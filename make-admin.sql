-- =====================================================
-- HACER ADMINISTRADOR A TECHNOEXPERIENCEMAGAZINE@GMAIL.COM
-- =====================================================

-- Ejecutar esta función para hacer administrador al usuario
SELECT make_user_admin('technoexperiencemagazine@gmail.com');

-- Verificar que el cambio se aplicó correctamente
SELECT id, email, username, role, created_at
FROM public.user_profiles 
WHERE email = 'technoexperiencemagazine@gmail.com';

-- Si el usuario no existe todavía (no se ha registrado), crear el perfil manualmente:
-- Nota: Esto solo funcionará si ya tienes el auth.users entry de Supabase Auth

/*
INSERT INTO public.user_profiles (id, email, username, role, bio, website, location, avatar_url)
SELECT 
    au.id,
    'technoexperiencemagazine@gmail.com',
    'Admin Techno Experience',
    'admin',
    'Administrador principal de Techno Experience',
    '',
    '',
    ''
FROM auth.users au 
WHERE au.email = 'technoexperiencemagazine@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.email = 'technoexperiencemagazine@gmail.com'
);
*/ 