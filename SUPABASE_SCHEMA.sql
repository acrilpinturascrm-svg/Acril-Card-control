-- ============================================
-- ACRILCARD - Esquema de Base de Datos
-- Supabase PostgreSQL Schema
-- Fecha: 24 de Octubre, 2025
-- ============================================

-- ============================================
-- TABLA: customers
-- Descripción: Tabla principal de clientes
-- ============================================

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información personal
  name VARCHAR(255) NOT NULL,
  document VARCHAR(50) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  
  -- Sistema de fidelización
  stamps INTEGER DEFAULT 0 CHECK (stamps >= 0),
  total_purchases INTEGER DEFAULT 0 CHECK (total_purchases >= 0),
  rewards_earned INTEGER DEFAULT 0 CHECK (rewards_earned >= 0),
  
  -- Fechas
  join_date TIMESTAMPTZ DEFAULT NOW(),
  last_purchase TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT customers_name_check CHECK (length(name) >= 2),
  CONSTRAINT customers_document_check CHECK (length(document) >= 5),
  CONSTRAINT customers_phone_check CHECK (length(phone) >= 10)
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_document ON customers(document);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_stamps ON customers(stamps);
CREATE INDEX IF NOT EXISTS idx_customers_join_date ON customers(join_date);

-- Comentarios
COMMENT ON TABLE customers IS 'Tabla principal de clientes del sistema de fidelización ACRILCARD';
COMMENT ON COLUMN customers.stamps IS 'Número de sellos acumulados por el cliente';
COMMENT ON COLUMN customers.total_purchases IS 'Total de compras realizadas';
COMMENT ON COLUMN customers.rewards_earned IS 'Total de recompensas canjeadas';

-- ============================================
-- TABLA: purchase_history
-- Descripción: Historial de compras y sellos
-- ============================================

CREATE TABLE IF NOT EXISTS purchase_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Información de la compra
  purchase_date TIMESTAMPTZ DEFAULT NOW(),
  stamps_added INTEGER NOT NULL CHECK (stamps_added > 0),
  amount DECIMAL(10, 2),
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_purchase_history_customer_id ON purchase_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_date ON purchase_history(purchase_date);

COMMENT ON TABLE purchase_history IS 'Historial de compras y sellos agregados por cliente';

-- ============================================
-- TABLA: rewards_claimed
-- Descripción: Historial de recompensas canjeadas
-- ============================================

CREATE TABLE IF NOT EXISTS rewards_claimed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Información de la recompensa
  claimed_date TIMESTAMPTZ DEFAULT NOW(),
  stamps_used INTEGER NOT NULL CHECK (stamps_used > 0),
  reward_type VARCHAR(100),
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_rewards_customer_id ON rewards_claimed(customer_id);
CREATE INDEX IF NOT EXISTS idx_rewards_date ON rewards_claimed(claimed_date);

COMMENT ON TABLE rewards_claimed IS 'Historial de recompensas canjeadas por clientes';

-- ============================================
-- TRIGGER: Actualizar updated_at automáticamente
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
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards_claimed ENABLE ROW LEVEL SECURITY;

-- Políticas: Permitir acceso completo (ajustar según necesidades)
CREATE POLICY "Allow all operations on customers"
  ON customers FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on purchase_history"
  ON purchase_history FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on rewards_claimed"
  ON rewards_claimed FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Clientes con estadísticas completas
CREATE OR REPLACE VIEW customers_with_stats AS
SELECT 
  c.*,
  COUNT(DISTINCT ph.id) as purchase_count,
  COUNT(DISTINCT rc.id) as reward_count,
  COALESCE(SUM(ph.amount), 0) as total_spent,
  MAX(ph.purchase_date) as last_purchase_date
FROM customers c
LEFT JOIN purchase_history ph ON c.id = ph.customer_id
LEFT JOIN rewards_claimed rc ON c.id = rc.customer_id
GROUP BY c.id;

-- Vista: Top clientes por sellos
CREATE OR REPLACE VIEW top_customers_by_stamps AS
SELECT 
  id,
  name,
  document,
  phone,
  stamps,
  total_purchases,
  rewards_earned,
  join_date
FROM customers
ORDER BY stamps DESC
LIMIT 100;

COMMENT ON VIEW customers_with_stats IS 'Vista con estadísticas completas de clientes';
COMMENT ON VIEW top_customers_by_stamps IS 'Top 100 clientes ordenados por sellos';

-- ============================================
-- DATOS DE PRUEBA (Opcional - Comentar en producción)
-- ============================================

-- INSERT INTO customers (name, document, phone, email, stamps, total_purchases) VALUES
-- ('Juan Pérez', '12345678', '04141234567', 'juan@example.com', 5, 3),
-- ('María González', '87654321', '04249876543', 'maria@example.com', 8, 5),
-- ('Carlos Rodríguez', '11223344', '04261122334', 'carlos@example.com', 12, 8);

-- ============================================
-- FIN DEL ESQUEMA
-- ============================================

-- Verificar tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verificar vistas creadas
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;
