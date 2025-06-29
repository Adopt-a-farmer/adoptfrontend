
-- First, let's check if there are any existing policies on the profiles table and drop them
DO $$ 
DECLARE
    pol_name text;
BEGIN
    FOR pol_name IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE format('DROP POLICY %I ON public.profiles', pol_name);
    END LOOP;
END $$;

-- Now let's enable row level security on the profiles table if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to safely get the current user's role
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create policies for the profiles table
-- Allow users to see their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (get_auth_user_role() = 'admin');

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (get_auth_user_role() = 'admin');

-- Allow authenticated users to read farmer profiles
CREATE POLICY "Allow read access to all authenticated users" 
ON farmers 
FOR SELECT 
TO authenticated 
USING (true);

-- Allow admin to perform all operations on farmer profiles
CREATE POLICY "Allow full access to admins" 
ON farmers 
FOR ALL 
USING (get_auth_user_role() = 'admin');
