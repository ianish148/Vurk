-- Allow users to manage their own user_roadmaps
CREATE POLICY "Users can insert their own roadmaps" ON user_roadmaps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own roadmaps" ON user_roadmaps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own roadmaps" ON user_roadmaps FOR DELETE USING (auth.uid() = user_id);

-- Allow users to manage their own user_tasks
CREATE POLICY "Users can insert their own tasks" ON user_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON user_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON user_tasks FOR DELETE USING (auth.uid() = user_id);
