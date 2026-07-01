-- Allow the admin to insert into the roadmap tables
CREATE POLICY "Admin can insert roadmap templates" ON roadmap_templates FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'anishff148@gmail.com');
CREATE POLICY "Admin can insert roadmap phases" ON roadmap_phases FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'anishff148@gmail.com');
CREATE POLICY "Admin can insert roadmap milestones" ON roadmap_milestones FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'anishff148@gmail.com');
CREATE POLICY "Admin can insert roadmap modules" ON roadmap_modules FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'anishff148@gmail.com');
CREATE POLICY "Admin can insert roadmap tasks" ON roadmap_tasks FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'anishff148@gmail.com');
