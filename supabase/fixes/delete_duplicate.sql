-- Find and delete the duplicate "JLPT N5 (4 Months)" roadmap that has no users enrolled.
-- This ensures we don't accidentally delete the one you are currently enrolled in!

WITH duplicate_roadmaps AS (
    SELECT id
    FROM roadmap_templates
    WHERE name = 'JLPT N5 (4 Months)'
),
roadmaps_with_users AS (
    SELECT DISTINCT template_id
    FROM user_roadmaps
)
DELETE FROM roadmap_templates
WHERE id IN (
    SELECT id 
    FROM duplicate_roadmaps 
    WHERE id NOT IN (SELECT template_id FROM roadmaps_with_users)
);
