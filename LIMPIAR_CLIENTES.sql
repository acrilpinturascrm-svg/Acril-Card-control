-- ============================================
-- LIMPIAR TODOS LOS CLIENTES DE SUPABASE
-- ============================================
-- ADVERTENCIA: Esto eliminará TODOS los clientes
-- Solo ejecutar si estás seguro
-- ============================================

-- Eliminar todos los registros de la tabla customers
DELETE FROM customers;

-- Verificar que la tabla está vacía
SELECT COUNT(*) as total_clientes FROM customers;

-- Resultado esperado: total_clientes = 0

-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. Ve a Supabase Dashboard
-- 2. Selecciona tu proyecto
-- 3. Click en "SQL Editor" (en el menú lateral)
-- 4. Click en "New query"
-- 5. Copia y pega SOLO la línea 10:
--    DELETE FROM customers;
-- 6. Click en "Run" (o presiona Ctrl+Enter)
-- 7. Deberías ver: "Success. No rows returned"
-- ============================================
