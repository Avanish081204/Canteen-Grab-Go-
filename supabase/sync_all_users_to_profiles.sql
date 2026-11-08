-- ==============================================================================
-- SYNC ALL AUTH USERS TO PROFILES TABLE & FIX RLS PERMISSIONS
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Ensure profiles table has email and phone columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. Populate profiles from existing auth.users
INSERT INTO public.profiles (id, full_name, email, role, updated_at)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1), 'Campus User') AS full_name,
  email,
  CASE 
    WHEN lower(email) = 'avanishshukla234@gmail.com' THEN 'admin'
    WHEN lower(email) = 'avanish.v.shukla@slrtce.in' THEN 'staff'
    ELSE 'user'
  END AS role,
  NOW() AS updated_at
FROM auth.users
ON CONFLICT (id) DO UPDATE 
SET 
  email = EXCLUDED.email,
  full_name = COALESCE(NULLIF(public.profiles.full_name, ''), EXCLUDED.full_name),
  updated_at = NOW();

-- 3. Create or replace automatic trigger for all future user registrations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'Campus Student'),
    NEW.email,
    CASE 
      WHEN lower(NEW.email) = 'avanishshukla234@gmail.com' THEN 'admin'
      WHEN lower(NEW.email) = 'avanish.v.shukla@slrtce.in' THEN 'staff'
      ELSE 'user'
    END,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(public.profiles.full_name, ''), EXCLUDED.full_name),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Enable RLS and grant read/update permissions to admin and authenticated users
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all read on profiles" ON public.profiles;
CREATE POLICY "Allow all read on profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all update on profiles" ON public.profiles;
CREATE POLICY "Allow all update on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

