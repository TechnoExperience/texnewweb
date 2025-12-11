-- =============================================
-- SCRIPT DE VERIFICACIÓN DE MIGRACIÓN DROPSHIPPING
-- Ejecuta este script en Supabase SQL Editor para verificar
-- =============================================

-- 1. Verificar columnas de dropshipping en products
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name LIKE 'dropshipping%'
ORDER BY ordinal_position;

-- 2. Verificar que la tabla dropshipping_orders existe
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'dropshipping_orders';

-- 3. Verificar estructura de dropshipping_orders
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'dropshipping_orders'
ORDER BY ordinal_position;

-- 4. Verificar índices de dropshipping_orders
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'dropshipping_orders'
ORDER BY indexname;

-- 5. Verificar políticas RLS de dropshipping_orders
SELECT 
  policyname,
  tablename,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'dropshipping_orders'
ORDER BY policyname;

-- 6. Verificar trigger de updated_at
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'dropshipping_orders'
ORDER BY trigger_name;

-- 7. Verificar índice de products para dropshipping
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'products'
AND indexname LIKE '%dropshipping%';

-- 8. Verificar comentarios de columnas
SELECT 
  table_name,
  column_name,
  col_description(
    (SELECT oid FROM pg_class WHERE relname = table_name),
    ordinal_position
  ) AS column_comment
FROM information_schema.columns
WHERE table_name = 'products'
AND column_name LIKE 'dropshipping%'
ORDER BY ordinal_position;

-- =============================================
-- RESUMEN ESPERADO
-- =============================================
-- Deberías ver:
-- 
-- 1. 6 columnas en products:
--    - dropshipping_enabled (boolean)
--    - dropshipping_url (text)
--    - dropshipping_supplier_name (text)
--    - dropshipping_supplier_email (text)
--    - dropshipping_markup_percentage (numeric)
--    - dropshipping_base_price (numeric)
--
-- 2. Tabla dropshipping_orders con 12 columnas
--
-- 3. 4 índices en dropshipping_orders:
--    - idx_dropshipping_orders_order
--    - idx_dropshipping_orders_product
--    - idx_dropshipping_orders_supplier
--    - idx_dropshipping_orders_status
--
-- 4. 1 índice en products:
--    - idx_products_dropshipping
--
-- 5. 2 políticas RLS:
--    - "Admins can view all dropshipping orders"
--    - "Admins can manage dropshipping orders"
--
-- 6. 1 trigger:
--    - update_dropshipping_orders_updated_at
-- =============================================

