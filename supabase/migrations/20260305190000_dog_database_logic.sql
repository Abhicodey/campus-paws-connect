-- 1. Replace dog_live_stats view
CREATE OR REPLACE VIEW dog_live_stats AS
SELECT
    d.id AS dog_id,
    COUNT(di.id) FILTER (
        WHERE di.interaction_type IN ('feeding','petting')
    ) AS interactions,
    MAX(di.created_at) FILTER (
        WHERE di.interaction_type = 'feeding'
    ) AS last_fed,
    AVG(di.mood_rating) FILTER (
        WHERE di.mood_rating IS NOT NULL
    ) AS avg_mood,
    AVG(di.latitude) FILTER (
        WHERE di.latitude IS NOT NULL
    ) AS avg_lat,
    AVG(di.longitude) FILTER (
        WHERE di.longitude IS NOT NULL
    ) AS avg_lon,
    CASE
        WHEN MAX(di.created_at) FILTER (WHERE di.interaction_type = 'feeding') 
             < NOW() - INTERVAL '6 hours'
             OR MAX(di.created_at) FILTER (WHERE di.interaction_type = 'feeding') IS NULL
        THEN true
        ELSE false
    END AS needs_feeding,
    CASE
        WHEN AVG(di.mood_rating) < 2 THEN 'Aggressive'
        WHEN AVG(di.mood_rating) < 3 THEN 'Shy / cautious'
        WHEN AVG(di.mood_rating) < 4 THEN 'Friendly / calm'
        ELSE 'Very friendly / calm'
    END AS nature_label,
    CASE
        WHEN AVG(di.mood_rating) < 2 THEN 'avoid'
        WHEN AVG(di.mood_rating) < 3 THEN 'shy'
        WHEN AVG(di.mood_rating) < 4 THEN 'friendly'
        ELSE 'friendly'
    END AS nature_type
FROM dogs d
LEFT JOIN dog_interactions di ON d.id = di.dog_id
GROUP BY d.id;

-- 2. Auto-update dog location function and trigger
CREATE OR REPLACE FUNCTION update_dog_location()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE dogs
    SET
        latitude = (
            SELECT AVG(latitude)
            FROM dog_interactions
            WHERE dog_id = NEW.dog_id
            AND latitude IS NOT NULL
        ),
        longitude = (
            SELECT AVG(longitude)
            FROM dog_interactions
            WHERE dog_id = NEW.dog_id
            AND longitude IS NOT NULL
        )
    WHERE id = NEW.dog_id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_dog_location_trigger ON dog_interactions;
CREATE TRIGGER update_dog_location_trigger
AFTER INSERT ON dog_interactions
FOR EACH ROW
WHEN (NEW.latitude IS NOT NULL)
EXECUTE FUNCTION update_dog_location();

-- 3. Enforce cooldown in the database
CREATE OR REPLACE FUNCTION enforce_interaction_cooldown()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    last_action timestamptz;
BEGIN
    SELECT created_at
    INTO last_action
    FROM dog_interactions
    WHERE
        dog_id = NEW.dog_id
        AND user_id = NEW.user_id
        AND interaction_type = NEW.interaction_type
    ORDER BY created_at DESC
    LIMIT 1;

    IF last_action IS NOT NULL
    AND last_action > NOW() - INTERVAL '6 hours'
    THEN
        RAISE EXCEPTION 'Cooldown active for this dog';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cooldown_trigger ON dog_interactions;
CREATE TRIGGER cooldown_trigger
BEFORE INSERT ON dog_interactions
FOR EACH ROW
EXECUTE FUNCTION enforce_interaction_cooldown();

-- 4. Auto-increase user points
CREATE OR REPLACE FUNCTION reward_interaction()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.interaction_type = 'feeding' THEN
        UPDATE users
        SET points = points + 5
        WHERE id = NEW.user_id;
    ELSIF NEW.interaction_type = 'petting' THEN
        UPDATE users
        SET points = points + 3
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reward_trigger ON dog_interactions;
CREATE TRIGGER reward_trigger
AFTER INSERT ON dog_interactions
FOR EACH ROW
EXECUTE FUNCTION reward_interaction();
