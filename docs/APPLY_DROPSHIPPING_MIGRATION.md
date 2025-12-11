# Aplicar Migración de Dropshipping

La migración `00035_add_dropshipping_support.sql` necesita aplicarse manualmente debido a conflictos con migraciones existentes.

## Opción 1: Ejecutar SQL en Supabase Dashboard (Recomendado)

1. Ve a: https://supabase.com/dashboard/project/ttuhkucedskdoblyxzub/sql/new
2. Copia y pega el siguiente SQL:

```sql
-- =============================================
-- DROPSHIPPING SUPPORT MIGRATION
-- Permite asociar productos con enlaces de dropshipping
-- =============================================

-- Add dropshipping fields to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS dropshipping_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dropshipping_url TEXT,
ADD COLUMN IF NOT EXISTS dropshipping_supplier_name TEXT,
ADD COLUMN IF NOT EXISTS dropshipping_supplier_email TEXT,
ADD COLUMN IF NOT EXISTS dropshipping_markup_percentage DECIMAL(5, 2) DEFAULT 0 CHECK (dropshipping_markup_percentage >= 0),
ADD COLUMN IF NOT EXISTS dropshipping_base_price DECIMAL(10, 2) CHECK (dropshipping_base_price >= 0);

-- Add index for dropshipping products
CREATE INDEX IF NOT EXISTS idx_products_dropshipping ON products(dropshipping_enabled) WHERE dropshipping_enabled = true;

-- Add comment
COMMENT ON COLUMN products.dropshipping_enabled IS 'Si el producto usa dropshipping';
COMMENT ON COLUMN products.dropshipping_url IS 'URL del producto en el sitio del proveedor';
COMMENT ON COLUMN products.dropshipping_supplier_name IS 'Nombre del proveedor de dropshipping';
COMMENT ON COLUMN products.dropshipping_supplier_email IS 'Email del proveedor';
COMMENT ON COLUMN products.dropshipping_markup_percentage IS 'Porcentaje de markup sobre el precio base';
COMMENT ON COLUMN products.dropshipping_base_price IS 'Precio base del proveedor (sin markup)';

-- =============================================
-- DROPSHIPPING ORDERS TABLE
-- Para rastrear pedidos de dropshipping
-- =============================================
CREATE TABLE IF NOT EXISTS dropshipping_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  supplier_name TEXT NOT NULL,
  supplier_url TEXT NOT NULL,
  supplier_order_id TEXT, -- ID del pedido en el sistema del proveedor
  supplier_status TEXT DEFAULT 'pending' CHECK (supplier_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  tracking_number TEXT,
  tracking_url TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dropshipping_orders_order ON dropshipping_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_dropshipping_orders_product ON dropshipping_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_dropshipping_orders_supplier ON dropshipping_orders(supplier_name);
CREATE INDEX IF NOT EXISTS idx_dropshipping_orders_status ON dropshipping_orders(supplier_status);

-- RLS for dropshipping_orders
ALTER TABLE dropshipping_orders ENABLE ROW LEVEL SECURITY;

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

-- Trigger for updated_at
CREATE TRIGGER update_dropshipping_orders_updated_at
  BEFORE UPDATE ON dropshipping_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

3. Haz clic en "Run" para ejecutar el SQL.

## Opción 2: Usar psql (si tienes acceso directo)

```bash
psql "postgresql://postgres:[PASSWORD]@db.ttuhkucedskdoblyxzub.supabase.co:5432/postgres" -f supabase/migrations/00035_add_dropshipping_support.sql
```

## Verificación

Después de aplicar la migración, verifica que los campos se hayan creado:

```sql
-- Verificar columnas en products
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name LIKE 'dropshipping%';

-- Verificar tabla dropshipping_orders
SELECT * FROM information_schema.tables WHERE table_name = 'dropshipping_orders';
```

## Nota

Si encuentras errores sobre `uuid_generate_v4()`, ejecuta primero:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

