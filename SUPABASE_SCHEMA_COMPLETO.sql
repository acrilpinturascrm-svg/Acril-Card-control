-- ============================================
-- ACRILCARD - Esquema Completo para Importación
-- ============================================
-- Este esquema incluye TODOS los campos necesarios
-- para importar clientes desde JSON
-- ============================================

-- PASO 1: Eliminar tabla existente
DROP TABLE IF EXISTS customers CASCADE;

-- PASO 2: Crear tabla con TODOS los campos
CREATE TABLE customers (
  -- ID generado por Supabase
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información personal
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  
  -- Documento de identidad
  id_type TEXT DEFAULT 'V',  -- V, E, J, P, G
  id_number TEXT,
  cedula TEXT,  -- Formato completo: "V-12345678"
  document TEXT,  -- Alias de cedula (para compatibilidad)
  
  -- Código del cliente
  code TEXT,
  
  -- Sistema de fidelización
  stamps INTEGER DEFAULT 0 CHECK (stamps >= 0),
  rewards INTEGER DEFAULT 0 CHECK (rewards >= 0),
  total_purchases INTEGER DEFAULT 0,
  rewards_earned INTEGER DEFAULT 0,
  
  -- Fechas
  join_date TEXT,
  last_purchase TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Historial (JSONB para almacenar arrays)
  purchase_history JSONB DEFAULT '[]'::jsonb,
  history JSONB DEFAULT '[]'::jsonb,
  
  -- Constraints
  CONSTRAINT customers_name_check CHECK (length(name) >= 2),
  CONSTRAINT customers_phone_check CHECK (length(phone) >= 10)
);

-- PASO 3: Crear índices
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_cedula ON customers(cedula);
CREATE INDEX idx_customers_stamps ON customers(stamps);
CREATE INDEX idx_customers_created_at ON customers(created_at);

-- PASO 4: Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- PASO 5: Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on customers"
  ON customers FOR ALL
  USING (true)
  WITH CHECK (true);

-- PASO 6: Verificar estructura
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'customers'
ORDER BY ordinal_position;

-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. Ve a Supabase Dashboard
-- 2. SQL Editor → New query
-- 3. Copia y pega TODO este archivo
-- 4. Click en "Run"
-- 5. Verifica que aparezcan todos los campos
-- ============================================
