-- Fix the handle_new_user trigger to prevent 500 errors on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- We only insert the ID. The rest of the profile data (name, username, etc.) 
  -- will be populated by the /onboarding page via upsert!
  INSERT INTO public.profiles (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
