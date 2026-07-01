-- Allow all users to read the roadmap hierarchy
CREATE POLICY "Phases are viewable" ON roadmap_phases FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Milestones are viewable" ON roadmap_milestones FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Modules are viewable" ON roadmap_modules FOR SELECT USING (deleted_at IS NULL);

-- Reset your subscription so you can click "Start Learning" again and trigger the scheduler
DELETE FROM user_roadmaps WHERE user_id = auth.uid();
