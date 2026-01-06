-- Add is_super_admin column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- Create policy to allow super admins to view everything (Optional, but good for admin dashboards)
-- This is just the schema change. The app logic will check this flag.

-- Example: Set specific user as super admin (User needs to replace EMAIL)
-- UPDATE public.profiles 
-- SET is_super_admin = TRUE 
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'luisxsilva56@gmail.com');
