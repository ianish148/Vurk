-- Add RLS Policies for user_preferences
-- Users can only see and edit their own preferences

CREATE POLICY "Users can view their own preferences" 
ON user_preferences FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
ON user_preferences FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON user_preferences FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);
