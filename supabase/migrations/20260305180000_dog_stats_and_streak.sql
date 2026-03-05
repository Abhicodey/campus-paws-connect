-- ============================================================
-- CampusPaws: Dog Stats Views + Streak Function
-- Run this migration in Supabase SQL Editor
-- ============================================================

-- 1. dog_stats: real-time metrics per dog (from dog_interactions)
DROP VIEW IF EXISTS public.dog_stats CASCADE;
CREATE OR REPLACE VIEW public.dog_stats AS
SELECT
  dog_id                                                                    AS id,

  -- Only count caring interactions (not location updates)
  COUNT(*) FILTER (WHERE interaction_type IN ('feeding', 'petting'))         AS total_interactions,

  -- Average of the LAST 5 mood ratings only (for recency)
  ROUND((
    SELECT AVG(m.mood_rating)
    FROM (
      SELECT mood_rating
      FROM   public.dog_interactions i2
      WHERE  i2.dog_id       = di.dog_id
      AND    i2.mood_rating  IS NOT NULL
      ORDER  BY i2.created_at DESC
      LIMIT  5
    ) m
  )::numeric, 1)                                                             AS avg_mood,

  -- Last caring timestamps
  MAX(created_at) FILTER (WHERE interaction_type = 'feeding')                AS last_fed_at,
  MAX(created_at) FILTER (WHERE interaction_type = 'petting')                AS last_petted_at,

  -- Community-sourced average GPS position (from location_update rows)
  ROUND(AVG(latitude)  FILTER (WHERE interaction_type = 'location_update' AND latitude  IS NOT NULL)::numeric, 6) AS avg_lat,
  ROUND(AVG(longitude) FILTER (WHERE interaction_type = 'location_update' AND longitude IS NOT NULL)::numeric, 6) AS avg_lon,

  -- Needs feeding if last feed > 8 hours ago (or never fed)
  (MAX(created_at) FILTER (WHERE interaction_type = 'feeding') IS NULL
    OR MAX(created_at) FILTER (WHERE interaction_type = 'feeding') < now() - interval '8 hours')
                                                                              AS needs_feeding,

  -- Nature derived from recent average mood
  CASE
    WHEN (SELECT AVG(m.mood_rating)
          FROM (SELECT mood_rating FROM public.dog_interactions i2
                WHERE i2.dog_id = di.dog_id AND i2.mood_rating IS NOT NULL
                ORDER BY i2.created_at DESC LIMIT 5) m) < 2  THEN 'shy'
    WHEN (SELECT AVG(m.mood_rating)
          FROM (SELECT mood_rating FROM public.dog_interactions i2
                WHERE i2.dog_id = di.dog_id AND i2.mood_rating IS NOT NULL
                ORDER BY i2.created_at DESC LIMIT 5) m) < 3  THEN 'cautious'
    WHEN (SELECT AVG(m.mood_rating)
          FROM (SELECT mood_rating FROM public.dog_interactions i2
                WHERE i2.dog_id = di.dog_id AND i2.mood_rating IS NOT NULL
                ORDER BY i2.created_at DESC LIMIT 5) m) < 4  THEN 'friendly'
    WHEN (SELECT AVG(m.mood_rating)
          FROM (SELECT mood_rating FROM public.dog_interactions i2
                WHERE i2.dog_id = di.dog_id AND i2.mood_rating IS NOT NULL
                ORDER BY i2.created_at DESC LIMIT 5) m) >= 4 THEN 'very friendly'
    ELSE 'unknown'
  END                                                                         AS nature

FROM public.dog_interactions di
GROUP BY dog_id;

GRANT SELECT ON public.dog_stats TO anon, authenticated;


-- 2. dog_summary: joins dog base record with live stats
DROP VIEW IF EXISTS public.dog_summary CASCADE;
CREATE OR REPLACE VIEW public.dog_summary AS
SELECT
  d.id                                              AS dog_id,
  d.name,
  COALESCE(s.total_interactions, 0)                 AS total_interactions,
  s.avg_mood,
  s.last_fed_at,
  s.last_petted_at,
  COALESCE(s.needs_feeding, true)                   AS needs_feeding,
  COALESCE(s.nature, 'unknown')                     AS nature,
  (
    SELECT COUNT(*)
    FROM public.kindness_actions
    WHERE dog_id = d.id AND action_type = 'pet'
  )                                                 AS behaviour_score
FROM public.dogs d
LEFT JOIN public.dog_stats s ON d.id = s.id;

GRANT SELECT ON public.dog_summary TO anon, authenticated;


-- 3. user_points: single source of truth for profile points
DROP VIEW IF EXISTS public.user_points CASCADE;
CREATE OR REPLACE VIEW public.user_points AS
SELECT
  u.id                                AS user_id,
  COALESCE(SUM(k.points), 0)          AS total_points
FROM public.users u
LEFT JOIN public.kindness_actions k ON u.id = k.user_id
GROUP BY u.id;

GRANT SELECT ON public.user_points TO anon, authenticated;


-- 4. calculate_feeding_streak: counts consecutive days of activity
--    Parameter: uid uuid  (matches frontend call)
CREATE OR REPLACE FUNCTION public.calculate_feeding_streak(uid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  streak    integer := 0;
  curr_date date    := current_date;
  had_action boolean;
BEGIN
  LOOP
    SELECT EXISTS (
      SELECT 1
      FROM   public.dog_interactions
      WHERE  user_id        = uid
      AND    created_at::date = curr_date
    ) INTO had_action;

    IF had_action THEN
      streak    := streak + 1;
      curr_date := curr_date - 1;
    ELSE
      -- Give today a free pass (day just started)
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


-- 5. Verify everything works
-- SELECT * FROM dog_stats          LIMIT 5;
-- SELECT * FROM dog_summary        LIMIT 5;
-- SELECT * FROM user_points        LIMIT 5;
-- SELECT calculate_feeding_streak('<your-user-id>');
