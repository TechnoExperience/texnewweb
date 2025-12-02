-- =============================================
-- PROMOTE USER TO ADMIN
-- =============================================

-- Update the profile role to 'admin' for the specified email
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'info@technoexperience.net';

-- Verify the update
SELECT * FROM public.profiles WHERE email = 'info@technoexperience.net';
