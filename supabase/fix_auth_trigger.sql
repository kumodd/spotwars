-- Fix for "Database error saving new user"
-- Run this in the Supabase SQL Editor

-- 1. Drop existing trigger if it exists to ensure clean replacement
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Create the robust trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.email,
      'User'
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- If profile creation fails, don't block auth user creation
    RAISE LOG 'Profile creation failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Re-attach the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
