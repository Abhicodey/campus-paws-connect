-- 1. Kindness Ledger (Source of Truth)
CREATE TABLE IF NOT EXISTS public.kindness_actions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  dog_id uuid NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  points integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. Dog Interactions Log (Activity Record)
CREATE TABLE IF NOT EXISTS public.dog_interactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  dog_id uuid NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
  interaction_type text NOT NULL, -- 'feeding', 'petting', 'location_update'
  latitude double precision,
  longitude double precision,
  mood_rating integer,
  created_at timestamptz DEFAULT now()
);

-- 3. Views
-- Leaderboard: Global hall of fame
DROP VIEW IF EXISTS public.leaderboard;
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  u.id,
  u.username,
  u.avatar_url,
  u.avatar_updated_at,
  COALESCE(SUM(k.points), 0) as total_points
FROM public.users u
JOIN public.kindness_actions k ON u.id = k.user_id
WHERE u.username IS NOT NULL
GROUP BY u.id, u.username, u.avatar_url, u.avatar_updated_at
HAVING SUM(k.points) > 0
ORDER BY total_points DESC;

-- Dog Stats: Aggregated metrics
DROP VIEW IF EXISTS public.dog_stats;
CREATE OR REPLACE VIEW public.dog_stats AS
SELECT 
  dog_id as id,
  count(*) as total_interactions,
  avg(mood_rating)::numeric(3,2) as avg_mood,
  max(created_at) filter (where interaction_type = 'feeding') as last_fed_at,
  max(created_at) filter (where interaction_type = 'petting') as last_petted_at
FROM public.dog_interactions
GROUP BY dog_id;

-- Dog Summary: Detailed view for profiles
DROP VIEW IF EXISTS public.dog_summary;
CREATE OR REPLACE VIEW public.dog_summary AS
SELECT 
  d.id as dog_id,
  d.name,
  COALESCE(s.total_interactions, 0) as total_interactions,
  COALESCE(s.avg_mood, 0) as avg_mood,
  s.last_fed_at,
  s.last_petted_at,
  (SELECT count(*) FROM public.kindness_actions WHERE dog_id = d.id AND action_type = 'pet') as behaviour_score
FROM public.dogs d
LEFT JOIN public.dog_stats s ON d.id = s.id;

-- 3.5 User Points: Single source of truth for Individual Profiles
-- This includes EVERY user, even those with 0 points (unlike leaderboard)
DROP VIEW IF EXISTS public.user_points;
CREATE OR REPLACE VIEW public.user_points AS
SELECT 
  u.id as user_id,
  COALESCE(SUM(k.points), 0) as total_points
FROM public.users u
LEFT JOIN public.kindness_actions k ON u.id = k.user_id
GROUP BY u.id;

GRANT SELECT ON public.user_points TO anon, authenticated;

-- 4. Permissions
ALTER TABLE public.kindness_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dog_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ledger_self_read" ON public.kindness_actions;
CREATE POLICY "ledger_self_read" ON public.kindness_actions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "interactions_self_insert" ON public.dog_interactions;
CREATE POLICY "interactions_self_insert" ON public.dog_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "interactions_public_read" ON public.dog_interactions;
CREATE POLICY "interactions_public_read" ON public.dog_interactions FOR SELECT USING (true);

GRANT SELECT ON public.leaderboard TO anon, authenticated;
GRANT SELECT ON public.dog_stats TO anon, authenticated;
GRANT SELECT ON public.dog_summary TO anon, authenticated;

-- 5. Unified Handler for Points & Logic
CREATE OR REPLACE FUNCTION public.handle_point_award()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_ts timestamptz;
BEGIN
  -- A. DOG APPROVAL (+20)
  IF (TG_TABLE_NAME = 'dogs' AND OLD.status = 'pending' AND NEW.status = 'approved') THEN
    INSERT INTO public.kindness_actions (user_id, dog_id, action_type, points)
    VALUES (NEW.created_by, NEW.id, 'dog_approved', 20);
  END IF;

  -- B. GALLERY IMAGE APPROVAL (+10)
  IF (TG_TABLE_NAME = 'gallery_images' AND OLD.status = 'pending' AND NEW.status = 'approved') THEN
    IF EXISTS (SELECT 1 FROM public.dogs WHERE created_by = NEW.user_id AND status = 'approved') THEN
      INSERT INTO public.kindness_actions (user_id, dog_id, action_type, points)
      VALUES (NEW.user_id, NEW.id, 'gallery_approved', 10);
    END IF;
  END IF;

  -- C. DOG INTERACTIONS (The "Activity" System)
  IF (TG_TABLE_NAME = 'dog_interactions') THEN
    
    -- C1. Feeding (+10, once per 12h per user per dog)
    IF (NEW.interaction_type = 'feeding') THEN
      SELECT created_at INTO last_ts FROM public.dog_interactions
      WHERE user_id = NEW.user_id AND dog_id = NEW.dog_id AND interaction_type = 'feeding' AND id != NEW.id
      ORDER BY created_at DESC LIMIT 1;

      IF last_ts IS NOT NULL AND last_ts > now() - interval '12 hours' THEN
        RAISE EXCEPTION 'You already fed this dog recently! (12h cooldown)';
      END IF;

      INSERT INTO public.kindness_actions (user_id, dog_id, action_type, points)
      VALUES (NEW.user_id, NEW.dog_id, 'feed', 10);

    -- C2. Petting (+5, once per 6h per user per dog)
    ELSIF (NEW.interaction_type = 'petting') THEN
      SELECT created_at INTO last_ts FROM public.dog_interactions
      WHERE user_id = NEW.user_id AND dog_id = NEW.dog_id AND interaction_type = 'petting' AND id != NEW.id
      ORDER BY created_at DESC LIMIT 1;

      IF last_ts IS NOT NULL AND last_ts > now() - interval '6 hours' THEN
        RAISE EXCEPTION 'You already petted this dog recently! (6h cooldown)';
      END IF;

      INSERT INTO public.kindness_actions (user_id, dog_id, action_type, points)
      VALUES (NEW.user_id, NEW.dog_id, 'pet', 5);

    -- C3. Location Update (+5, always rewards)
    ELSIF (NEW.interaction_type = 'location_update') THEN
      UPDATE public.dogs 
      SET location_lat = NEW.latitude, 
          location_lng = NEW.longitude,
          updated_at = now()
      WHERE id = NEW.dog_id;

      INSERT INTO public.kindness_actions (user_id, dog_id, action_type, points)
      VALUES (NEW.user_id, NEW.dog_id, 'location_update', 5);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 6. Apply Triggers
DROP TRIGGER IF EXISTS tr_dog_approval_points ON public.dogs;
CREATE TRIGGER tr_dog_approval_points AFTER UPDATE ON public.dogs
FOR EACH ROW EXECUTE FUNCTION public.handle_point_award();

DROP TRIGGER IF EXISTS tr_image_approval_points ON public.gallery_images;
CREATE TRIGGER tr_image_approval_points AFTER UPDATE ON public.gallery_images
FOR EACH ROW EXECUTE FUNCTION public.handle_point_award();

DROP TRIGGER IF EXISTS tr_interaction_points ON public.dog_interactions;
CREATE TRIGGER tr_interaction_points AFTER INSERT ON public.dog_interactions
FOR EACH ROW EXECUTE FUNCTION public.handle_point_award();

-- 7. Cleanup obsolete columns/tables (if you had feed_logs/pet_logs)
DROP TABLE IF EXISTS public.feed_logs;
DROP TABLE IF EXISTS public.pet_logs;

-- 8. Feeding Streak Function
CREATE OR REPLACE FUNCTION public.calculate_feeding_streak(target_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  streak integer := 0;
  curr_date date := current_date;
  found_action boolean;
BEGIN
  LOOP
    -- Check if user performed any interaction on this date
    SELECT EXISTS (
      SELECT 1 FROM public.dog_interactions
      WHERE user_id = target_user_id
      AND created_at::date = curr_date
    ) INTO found_action;

    IF found_action THEN
      streak := streak + 1;
      curr_date := curr_date - 1;
    ELSE
      -- If no action today, check if they did one yesterday (to allow for today's streak to still be pending)
      IF curr_date = current_date THEN
        curr_date := curr_date - 1;
        CONTINUE;
      ELSE
        EXIT;
      END IF;
    END IF;
  END LOOP;
  
  RETURN streak;
END;
$$;
