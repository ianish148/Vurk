-- Add the missing caching columns to the profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0 NOT NULL;
