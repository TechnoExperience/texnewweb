-- =============================================
-- VERIFICACIÓN RÁPIDA - DROPSHIPPING
-- Ejecuta estas consultas para confirmar que todo está correcto
-- =============================================

-- ✅ 1. Verificar columnas de dropshipping en products (deberías ver 6 filas)
SELECT 
  column_name, 
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name LIKE 'dropshipping%'
ORDER BY column_name;

-- ✅ 2. Verificar que dropshipping_orders existe (ya confirmado ✓)
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'dropshipping_orders';

-- ✅ 3. Verificar columnas de dropshipping_orders (deberías ver 12 filas)
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'dropshipping_orders'
ORDER BY ordinal_position;

-- ✅ 4. Verificar políticas RLS (deberías ver 2 políticas)
SELECT 
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'dropshipping_orders';

-- ✅ 5. Verificar trigger (deberías ver 1 trigger)
SELECT 
  trigger_name,
  event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'dropshipping_orders';

