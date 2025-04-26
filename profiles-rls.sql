-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own profile
CREATE POLICY insert_own_profile ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create policy to allow users to update their own profile
CREATE POLICY update_own_profile ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create policy to allow users to read their own profile
CREATE POLICY read_own_profile ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Create policy to allow service role to manage all profiles
CREATE POLICY service_role_manage_profiles ON public.profiles
  USING (auth.jwt() ->> 'role' = 'service_role');
