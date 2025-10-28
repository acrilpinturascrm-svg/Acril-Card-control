-- ============================================
-- ACRILCARD - Esquema Simplificado
-- Supabase PostgreSQL Schema
-- Fecha: 28 de Octubre, 2025
-- Versión: 2.0 (Simplificada)
-- ============================================

-- ============================================
-- PASO 1: ELIMINAR TABLAS EXISTENTES (Si existen)
-- ============================================
-- ADVERTENCIA: Esto eliminará todos los datos existentes
-- Comenta estas líneas si ya tienes datos que quieres conservar

DROP TABLE IF EXISTS stamp_history CASCADE;
DROP TABLE IF EXISTS purchase_history CASCADE;
DROP TABLE IF EXISTS rewards_claimed CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- ============================================
-- PASO 2: CREAR TABLA customers (Simplificada)
-- ============================================

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información personal
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  document TEXT,  -- ← OPCIONAL (puede ser NULL)
  
  -- Sistema de fidelización
  stamps INTEGER DEFAULT 0 CHECK (stamps >= 0),
  rewards INTEGER DEFAULT 0 CHECK (rewards >= 0),  -- ← Nombre correcto
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints básicos
  CONSTRAINT customers_name_check CHECK (length(name) >= 2),
  CONSTRAINT customers_phone_check CHECK (length(phone) >= 10)
);

-- ============================================
-- PASO 3: CREAR TABLA stamp_history
-- ============================================

CREATE TABLE stamp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  stamps_added INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PASO 4: CREAR ÍNDICES
-- ============================================

CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_stamps ON customers(stamps);
CREATE INDEX idx_customers_created_at ON customers(created_at);
CREATE INDEX idx_stamp_history_customer_id ON stamp_history(customer_id);

-- ============================================
-- PASO 5: TRIGGER para updated_at automático
-- ============================================

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

-- ============================================
-- PASO 6: ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stamp_history ENABLE ROW LEVEL SECURITY;

-- Políticas: Permitir acceso completo con anon key
CREATE POLICY "Allow all operations on customers"
  ON customers FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on stamp_history"
  ON stamp_history FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- PASO 7: COMENTARIOS
-- ============================================

COMMENT ON TABLE customers IS 'Tabla principal de clientes - Esquema simplificado v2.0';
COMMENT ON COLUMN customers.stamps IS 'Sellos acumulados por el cliente';
COMMENT ON COLUMN customers.rewards IS 'Recompensas canjeadas por el cliente';
COMMENT ON COLUMN customers.document IS 'Documento de identidad (opcional)';

-- ============================================
-- PASO 8: VERIFICACIÓN
-- ============================================

-- Ver estructura de la tabla
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'customers'
ORDER BY ordinal_position;

-- ============================================
-- FIN DEL ESQUEMA
-- ============================================
