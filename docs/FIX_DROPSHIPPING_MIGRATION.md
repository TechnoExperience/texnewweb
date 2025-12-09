# 🔧 Corrección de Migración de Dropshipping

**Fecha:** 2025-12-04  
**Problema:** Error al aplicar migración - políticas RLS ya existen  
**Solución:** Migración corregida para ser idempotente

---

## ❌ Error Original

```
ERROR: 42710: policy "Admins can view all dropshipping orders" for table "dropshipping_orders" already exists
```

**Causa:** La migración intentaba crear políticas que ya existían.

---

## ✅ Solución Aplicada

Se modificó la migración para:

1. **Eliminar políticas existentes** antes de crearlas:
   ```sql
   DROP POLICY IF EXISTS "Admins can view all dropshipping orders" ON dropshipping_orders;
   DROP POLICY IF EXISTS "Admins can manage dropshipping orders" ON dropshipping_orders;
   ```

2. **Eliminar trigger existente** antes de crearlo:
   ```sql
   DROP TRIGGER IF EXISTS update_dropshipping_orders_updated_at ON dropshipping_orders;
   ```

3. **Usar `IF NOT EXISTS`** en todos los `CREATE`:
   - `CREATE TABLE IF NOT EXISTS`
   - `CREATE INDEX IF NOT EXISTS`
   - `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`

---

## 🔄 Aplicar Migración Corregida

### Opción 1: Ejecutar SQL Corregido

1. Ve a: https://supabase.com/dashboard/project/ttuhkucedskdoblyxzub/sql/new
2. Copia el contenido de: `supabase/migrations/00035_add_dropshipping_support.sql` (ya corregido)
3. Pega y ejecuta el SQL

### Opción 2: Ejecutar Solo las Partes Faltantes

Si las políticas ya existen pero faltan otros elementos, ejecuta solo:

```sql
-- Agregar columnas si no existen (ya deberían estar)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS dropshipping_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dropshipping_url TEXT,
ADD COLUMN IF NOT EXISTS dropshipping_supplier_name TEXT,
ADD COLUMN IF NOT EXISTS dropshipping_supplier_email TEXT,
ADD COLUMN IF NOT EXISTS dropshipping_markup_percentage DECIMAL(5, 2) DEFAULT 0 CHECK (dropshipping_markup_percentage >= 0),
ADD COLUMN IF NOT EXISTS dropshipping_base_price DECIMAL(10, 2) CHECK (dropshipping_base_price >= 0);

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS dropshipping_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  supplier_name TEXT NOT NULL,
  supplier_url TEXT NOT NULL,
  supplier_order_id TEXT,
  supplier_status TEXT DEFAULT 'pending' CHECK (supplier_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  tracking_number TEXT,
  tracking_url TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_dropshipping_orders_order ON dropshipping_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_dropshipping_orders_product ON dropshipping_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_dropshipping_orders_supplier ON dropshipping_orders(supplier_name);
CREATE INDEX IF NOT EXISTS idx_dropshipping_orders_status ON dropshipping_orders(supplier_status);

-- RLS (ya debería estar habilitado)
ALTER TABLE dropshipping_orders ENABLE ROW LEVEL SECURITY;

-- Políticas (eliminar y recrear)
DROP POLICY IF EXISTS "Admins can view all dropshipping orders" ON dropshipping_orders;
DROP POLICY IF EXISTS "Admins can manage dropshipping orders" ON dropshipping_orders;

CREATE POLICY "Admins can view all dropshipping orders" 
  ON dropshipping_orders FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage dropshipping orders" 
  ON dropshipping_orders FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Trigger
DROP TRIGGER IF EXISTS update_dropshipping_orders_updated_at ON dropshipping_orders;
CREATE TRIGGER update_dropshipping_orders_updated_at
  BEFORE UPDATE ON dropshipping_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## ✅ Verificación

Después de aplicar la migración, verifica:

```sql
-- Verificar columnas en products
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name LIKE 'dropshipping%';

-- Verificar tabla dropshipping_orders
SELECT * FROM information_schema.tables WHERE table_name = 'dropshipping_orders';

-- Verificar políticas
SELECT policyname, tablename 
FROM pg_policies 
WHERE tablename = 'dropshipping_orders';
```

Deberías ver:
- 6 columnas nuevas en `products` (dropshipping_*)
- 1 tabla `dropshipping_orders`
- 2 políticas RLS

---

## 📝 Nota

La migración ahora es **idempotente**, lo que significa que puedes ejecutarla múltiples veces sin errores. Esto es importante para entornos donde la migración puede ejecutarse varias veces.

---

**Estado:** ✅ Migración corregida y lista para aplicar


