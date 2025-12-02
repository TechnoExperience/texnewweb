-- =============================================
-- ACTUALIZAR EMAIL DEL ADMIN
-- =============================================
-- Este script actualiza el email del usuario admin
-- de edu.coco@technoexperience.com a edu.coco@technoexperience.net

-- IMPORTANTE: Ejecuta esto desde el SQL Editor de Supabase
-- o usando el CLI de Supabase

-- 1. Buscar el ID del usuario con el email antiguo
DO $$
DECLARE
    user_id_var UUID;
    old_email TEXT := 'edu.coco@technoexperience.com';
    new_email TEXT := 'edu.coco@technoexperience.net';
BEGIN
    -- Buscar el usuario por email
    SELECT id INTO user_id_var
    FROM auth.users
    WHERE email = old_email
    LIMIT 1;

    IF user_id_var IS NULL THEN
        RAISE NOTICE '⚠️  Usuario con email % no encontrado. Creando nuevo usuario...', old_email;
        
        -- Si no existe, crear uno nuevo (requiere función de creación)
        -- Por ahora, solo notificamos
        RAISE NOTICE '💡 Ejecuta el script create-admin.ts con el nuevo email: %', new_email;
    ELSE
        RAISE NOTICE '✅ Usuario encontrado: %', user_id_var;
        
        -- 2. Actualizar email en auth.users
        UPDATE auth.users
        SET 
            email = new_email,
            email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
            updated_at = NOW()
        WHERE id = user_id_var;
        
        RAISE NOTICE '✅ Email actualizado en auth.users';
        
        -- 3. Actualizar email en profiles
        UPDATE public.profiles
        SET 
            email = new_email,
            updated_at = NOW()
        WHERE id = user_id_var;
        
        RAISE NOTICE '✅ Email actualizado en profiles';
        
        -- 4. Asegurar que el rol sea admin
        UPDATE public.profiles
        SET 
            role = 'admin',
            updated_at = NOW()
        WHERE id = user_id_var;
        
        RAISE NOTICE '✅ Rol confirmado como admin';
        RAISE NOTICE '';
        RAISE NOTICE '🎉 ¡Email del admin actualizado exitosamente!';
        RAISE NOTICE '   Nuevo email: %', new_email;
    END IF;
END $$;

-- Verificar el resultado
SELECT 
    u.id,
    u.email as auth_email,
    p.email as profile_email,
    p.role,
    u.email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'edu.coco@technoexperience.net' OR u.email = 'edu.coco@technoexperience.com'
ORDER BY u.created_at DESC
LIMIT 1;

