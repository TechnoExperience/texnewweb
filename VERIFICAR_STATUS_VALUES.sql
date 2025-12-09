-- =============================================
-- VERIFICAR VALORES DE STATUS DESPUÉS DE LA MIGRACIÓN 00036
-- =============================================
-- Ejecuta estas queries en Supabase SQL Editor para verificar
-- que los valores de status se actualizaron correctamente

-- =============================================
-- 1) VERIFICAR EVENTS
-- =============================================
SELECT 
    'events' as tabla,
    status, 
    COUNT(*) as cantidad
FROM events 
GROUP BY status
ORDER BY status;

-- Resultados esperados: 'draft', 'pub', 'can' (o NULL)

-- =============================================
-- 2) VERIFICAR NEWS
-- =============================================
SELECT 
    'news' as tabla,
    status, 
    COUNT(*) as cantidad
FROM news 
GROUP BY status
ORDER BY status;

-- Resultados esperados: 'draft', 'pend', 'pub', 'rej' (o NULL)

-- =============================================
-- 3) VERIFICAR DJ_RELEASES
-- =============================================
SELECT 
    'dj_releases' as tabla,
    status, 
    COUNT(*) as cantidad
FROM dj_releases 
GROUP BY status
ORDER BY status;

-- Resultados esperados: 'draft', 'pub' (o NULL)

-- =============================================
-- 4) VERIFICAR VIDEOS
-- =============================================
SELECT 
    'videos' as tabla,
    status, 
    COUNT(*) as cantidad
FROM videos 
GROUP BY status
ORDER BY status;

-- Resultados esperados: 'pend', 'pub', 'rej' (o NULL)

-- =============================================
-- 5) VERIFICAR REVIEWS
-- =============================================
SELECT 
    'reviews' as tabla,
    status, 
    COUNT(*) as cantidad
FROM reviews 
GROUP BY status
ORDER BY status;

-- Resultados esperados: 'draft', 'pend', 'pub', 'rej' (o NULL)

-- =============================================
-- 6) RESUMEN COMPLETO (Todas las tablas)
-- =============================================
SELECT 
    'events' as tabla,
    status, 
    COUNT(*) as cantidad
FROM events 
GROUP BY status

UNION ALL

SELECT 
    'news' as tabla,
    status, 
    COUNT(*) as cantidad
FROM news 
GROUP BY status

UNION ALL

SELECT 
    'dj_releases' as tabla,
    status, 
    COUNT(*) as cantidad
FROM dj_releases 
GROUP BY status

UNION ALL

SELECT 
    'videos' as tabla,
    status, 
    COUNT(*) as cantidad
FROM videos 
GROUP BY status

UNION ALL

SELECT 
    'reviews' as tabla,
    status, 
    COUNT(*) as cantidad
FROM reviews 
GROUP BY status

ORDER BY tabla, status;

-- =============================================
-- 7) VERIFICAR RESTRICCIONES (CHECK CONSTRAINTS)
-- =============================================
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK' 
    AND tc.table_name IN ('events', 'news', 'dj_releases', 'videos', 'reviews')
    AND cc.check_clause LIKE '%status%'
ORDER BY tc.table_name;

-- Deberías ver las nuevas restricciones con valores optimizados

