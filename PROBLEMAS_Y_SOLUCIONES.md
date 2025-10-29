# Problemas y Soluciones - ACRILCARD

**Fecha de creación:** 28 de Octubre, 2025  
**Última actualización:** 28 de Octubre, 2025  
**Versión:** 1.5.2

Este documento consolida todos los problemas encontrados y sus soluciones durante el desarrollo y migración a Supabase.

---

## 📋 Índice

1. [Problema 1: Importación de Clientes - Campos Faltantes](#problema-1-importación-de-clientes---campos-faltantes)
2. [Problema 2: Duplicados Falsos en Importación](#problema-2-duplicados-falsos-en-importación)
3. [Problema 3: Error al Buscar Clientes](#problema-3-error-al-buscar-clientes)
4. [Problema 4: Cédula Vacía en Importación](#problema-4-cédula-vacía-en-importación)
5. [Problema 5: Mapeo Incorrecto de Datos desde Supabase](#problema-5-mapeo-incorrecto-de-datos-desde-supabase)
6. [Limpieza de Base de Datos en Supabase](#limpieza-de-base-de-datos-en-supabase)

---

## Problema 1: Importación de Clientes - Campos Faltantes

**Fecha:** 28 de Octubre, 2025  
**Estado:** ✅ RESUELTO

### Síntoma
Al importar clientes desde JSON a Supabase, los campos `cedula` y `stamps` no se guardaban.

### Causa Raíz
`CustomerContext.js` solo enviaba 5 campos al servicio de Supabase, ignorando todos los demás.

**Código problemático (líneas 76-82):**
```javascript
// ❌ INCORRECTO
const dataToSend = {
  name: customerData.name,
  phone: customerData.phone,
  document: customerData.cedula || customerData.document || null,
  stamps: 0,  // ❌ Siempre 0
  rewards: 0
};
```

### Solución
Actualizar `CustomerContext.js` para enviar TODOS los campos:

```javascript
// ✅ CORRECTO
const dataToSend = {
  name: customerData.name,
  phone: customerData.phone,
  idType: customerData.idType || 'V',
  idNumber: customerData.idNumber || '',
  cedula: customerData.cedula || null,
  document: customerData.document || customerData.cedula || null,
  code: customerData.code || null,
  stamps: parseInt(customerData.stamps) || 0,
  rewards: parseInt(customerData.rewards) || 0,
  totalPurchases: parseInt(customerData.totalPurchases) || 0,
  rewardsEarned: parseInt(customerData.rewardsEarned) || 0,
  joinDate: customerData.joinDate || new Date().toISOString(),
  lastPurchase: customerData.lastPurchase || null,
  purchaseHistory: customerData.purchaseHistory || [],
  history: customerData.history || []
};
```

**Archivos modificados:**
- `src/contexts/CustomerContext.js` (líneas 73-102)
- `src/services/customersService.js` (líneas 114-130)

---

## Problema 2: Duplicados Falsos en Importación

**Fecha:** 28 de Octubre, 2025  
**Estado:** ✅ RESUELTO

### Síntoma
4 clientes de 164 se omitían incorrectamente indicando que "ya existen", cuando en realidad NO existían.

### Causa Raíz
Comparación estricta de teléfonos sin normalización. No manejaba formatos diferentes:
- `"0414-123-4567"` vs `"04141234567"`
- `"(0414) 123-4567"` vs `"04141234567"`

**Código problemático:**
```javascript
// ❌ INCORRECTO
const exists = customers.find(c => c.phone === client.phone);
```

### Solución

**1. Crear función de normalización (`src/utils/validation.js`):**
```javascript
export const normalizePhone = (phone) => {
  if (!phone) return '';
  return phone.toString().replace(/\D/g, '');
};

export const phonesMatch = (phone1, phone2) => {
  const normalized1 = normalizePhone(phone1);
  const normalized2 = normalizePhone(phone2);
  
  if (normalized1 === normalized2) return true;
  
  // Comparar últimos 10 dígitos
  if (normalized1.length >= 10 && normalized2.length >= 10) {
    return normalized1.slice(-10) === normalized2.slice(-10);
  }
  
  return false;
};
```

**2. Actualizar verificación en `MainApp.jsx`:**
```javascript
// ✅ CORRECTO
// Verificar en estado local con normalización
for (const c of customers) {
  if (phonesMatch(c.phone, clientPhone)) {
    exists = true;
    matchedCustomer = c;
    break;
  }
}

// Verificar en Supabase directamente
if (!exists) {
  const supabaseResults = await customersService.searchCustomersByPhone(clientPhone);
  if (supabaseResults && supabaseResults.length > 0) {
    exists = true;
    matchedCustomer = supabaseResults[0];
  }
}
```

**Archivos modificados:**
- `src/utils/validation.js` (líneas 50-86)
- `src/MainApp.jsx` (líneas 174-209)

---

## Problema 3: Error al Buscar Clientes

**Fecha:** 28 de Octubre, 2025  
**Estado:** ✅ RESUELTO

### Síntoma
Error al buscar clientes: `Cannot read properties of undefined (reading 'includes')`

### Causa Raíz
Campos `null` o `undefined` desde Supabase al intentar hacer `.includes()`.

**Código problemático:**
```javascript
// ❌ INCORRECTO
result = result.filter(customer => 
  customer.name.toLowerCase().includes(term) ||
  customer.phone.includes(term) ||
  customer.idNumber.includes(term) ||  // ❌ Error si es null
  customer.code?.toLowerCase().includes(term)
);
```

### Solución
Agregar valores por defecto antes de usar `.includes()`:

```javascript
// ✅ CORRECTO
result = result.filter(customer => 
  (customer.name || '').toLowerCase().includes(term) ||
  (customer.phone || '').includes(term) ||
  (customer.idNumber || '').toString().includes(term) ||
  (customer.code || '').toLowerCase().includes(term)
);
```

**Archivos modificados:**
- `src/components/CustomerList.jsx` (líneas 116-119)
- `src/contexts/CustomerContext.js` (líneas 274-277)

---

## Problema 4: Cédula Vacía en Importación

**Fecha:** 28 de Octubre, 2025  
**Estado:** ✅ RESUELTO

### Síntoma
Clientes se importaban sin cédula o con valores inválidos como `"V-"`.

### Causa Raíz
Generación de cédula sin validar que `idNumber` tenga un valor.

**Código problemático:**
```javascript
// ❌ INCORRECTO
cedula: customerData.cedula || `${customerData.idType || 'V'}-${customerData.idNumber || ''}`
// Genera "V-" si idNumber está vacío
```

### Solución
Validar `idNumber` antes de generar cédula:

```javascript
// ✅ CORRECTO
let cedula = customerData.cedula;
const idType = customerData.idType || 'V';
const idNumber = customerData.idNumber || '';

if (!cedula && idNumber && idNumber.trim() !== '') {
  cedula = `${idType}-${idNumber}`;
}

// Enviar null si no hay cédula válida
cedula: cedula || null
```

**Archivos modificados:**
- `src/MainApp.jsx` (líneas 237-248)
- `src/contexts/CustomerContext.js` (líneas 77-91)

---

## Problema 5: Mapeo Incorrecto de Datos desde Supabase

**Fecha:** 28 de Octubre, 2025  
**Estado:** ✅ RESUELTO

### Síntoma
Los datos recuperados de Supabase no se mostraban correctamente en la interfaz. La cédula no aparecía y se mostraba el teléfono en su lugar.

### Causa Raíz
Supabase devuelve datos con nombres de columnas en `snake_case` (`id_type`, `id_number`, `cedula`), pero la aplicación espera `camelCase` (`idType`, `idNumber`, `cedula`).

### Solución
Crear función de mapeo en `customersService.js`:

```javascript
// ✅ CORRECTO
const mapSupabaseToApp = (supabaseData) => {
  if (!supabaseData) return null;
  
  return {
    id: supabaseData.id,
    name: supabaseData.name,
    phone: supabaseData.phone,
    idType: supabaseData.id_type || 'V',
    idNumber: supabaseData.id_number || '',
    cedula: supabaseData.cedula || null,
    document: supabaseData.document || supabaseData.cedula || null,
    code: supabaseData.code || '',
    stamps: supabaseData.stamps || 0,
    rewards: supabaseData.rewards || 0,
    totalPurchases: supabaseData.total_purchases || 0,
    rewardsEarned: supabaseData.rewards_earned || 0,
    joinDate: supabaseData.join_date || null,
    lastPurchase: supabaseData.last_purchase || null,
    purchaseHistory: supabaseData.purchase_history || [],
    history: supabaseData.history || [],
    createdAt: supabaseData.created_at,
    updatedAt: supabaseData.updated_at
  };
};

// Aplicar en todas las funciones
export const getAllCustomers = async () => {
  // ...
  return (data || []).map(mapSupabaseToApp);
};
```

**Archivos modificados:**
- `src/services/customersService.js` (líneas 14-38, aplicado en todas las funciones CRUD)

---

## 🔄 Flujo Completo de Importación (Actualizado)

```
1. Usuario selecciona archivo JSON
   ↓
2. MainApp.jsx → handleImportCustomersFromJSON()
   - Parsea JSON
   - Detecta formato
   - Extrae idType/idNumber de cedula
   ↓
3. Por cada cliente:
   - Normaliza teléfono
   - Verifica duplicados (local + Supabase)
   - Valida idNumber antes de generar cédula
   - Prepara datos completos
   ↓
4. CustomerContext.js → addCustomer()
   - Valida y genera cédula
   - Prepara TODOS los campos
   - Llama a customersService.createCustomer()
   ↓
5. customersService.js → createCustomer()
   - Mapea camelCase a snake_case
   - Inserta en Supabase
   - Mapea respuesta a camelCase
   ↓
6. Actualiza estado local
   ↓
7. Muestra resumen con logs detallados
```

---

## 🧪 Verificación Completa

### 1. Preparar archivo de prueba

```json
{
  "customers": [
    {
      "name": "Cliente Completo",
      "phone": "0414-123-4567",
      "cedula": "V-12345678",
      "code": "CLI001",
      "stamps": 5
    },
    {
      "name": "Cliente con idType/idNumber",
      "phone": "(0424) 234-5678",
      "idType": "V",
      "idNumber": "87654321",
      "stamps": 3
    },
    {
      "name": "Cliente sin cédula",
      "phone": "04161234567",
      "stamps": 2
    }
  ]
}
```

### 2. Importar y verificar logs

```
📦 Iniciando importación de 3 clientes...
📊 Clientes actuales en estado local: 0

📋 [1/3] Procesando: Cliente Completo
   📞 Teléfono del archivo: "0414-123-4567"
   🔍 No encontrado en local, verificando en Supabase...
   ✅ No existe en Supabase, se puede importar
   📝 Datos preparados:
      idType: "V"
      idNumber: "12345678"
      cedula: "V-12345678"  ✅
   ✅ IMPORTADO exitosamente

📋 [2/3] Procesando: Cliente con idType/idNumber
   📞 Teléfono del archivo: "(0424) 234-5678"
   🔍 No encontrado en local, verificando en Supabase...
   ✅ No existe en Supabase, se puede importar
   📝 Datos preparados:
      idType: "V"
      idNumber: "87654321"
      cedula: "V-87654321"  ✅ Generada
   ✅ IMPORTADO exitosamente

📋 [3/3] Procesando: Cliente sin cédula
   📞 Teléfono del archivo: "04161234567"
   🔍 No encontrado en local, verificando en Supabase...
   ✅ No existe en Supabase, se puede importar
   📝 Datos preparados:
      idType: "V"
      idNumber: ""
      cedula: null  ✅ No genera "V-"
   ✅ IMPORTADO exitosamente

📊 RESUMEN:
   ✅ Importados: 3
   ⏭️ Omitidos: 0
   ❌ Errores: 0
```

### 3. Verificar en Supabase

- ✅ Campo `cedula` con valores correctos
- ✅ Campo `id_type` e `id_number` correctos
- ✅ Campo `stamps` con valores reales
- ✅ Todos los campos mapeados correctamente

### 4. Verificar en la interfaz

- ✅ Cédula se muestra correctamente
- ✅ Búsqueda funciona sin errores
- ✅ Todos los datos visibles

---

## 📊 Resumen de Archivos Modificados

| Archivo | Problemas Resueltos | Líneas Modificadas |
|---------|---------------------|-------------------|
| `src/contexts/CustomerContext.js` | 1, 4 | 73-102 |
| `src/services/customersService.js` | 1, 5 | 14-38, todas las funciones |
| `src/MainApp.jsx` | 2, 4 | 174-266 |
| `src/utils/validation.js` | 2, 3 | 50-86 |
| `src/components/CustomerList.jsx` | 3 | 116-119 |

---

## 💡 Buenas Prácticas Implementadas

1. **Normalización de datos**
   - Teléfonos normalizados antes de comparar
   - Validación de campos antes de concatenar

2. **Manejo de null/undefined**
   - Valores por defecto con operador `||`
   - Conversión segura a string

3. **Mapeo de datos**
   - Función centralizada de mapeo
   - Consistencia entre snake_case y camelCase

4. **Logs detallados**
   - Información completa en cada paso
   - Fácil debugging y verificación

5. **Verificación en dos niveles**
   - Estado local (rápido)
   - Supabase (confiable)

---

## Limpieza de Base de Datos en Supabase

**Fecha:** 28 de Octubre, 2025  
**Propósito:** Limpiar datos incorrectos antes de reimportar con las correcciones

### Opciones de Limpieza

#### Opción 1: Eliminar TODOS los clientes (Recomendado)

```sql
-- Limpiar completamente la tabla
TRUNCATE TABLE customers RESTART IDENTITY CASCADE;

-- Verificar que quedó vacía
SELECT COUNT(*) as total FROM customers;
```

**Cuándo usar:** Cuando quieres empezar completamente limpio y reimportar todos los datos.

#### Opción 2: Eliminar solo clientes con cédula inválida

```sql
-- Eliminar clientes con cédula vacía o inválida
DELETE FROM customers 
WHERE cedula IS NULL 
   OR cedula = '' 
   OR cedula = 'V-' 
   OR cedula = 'E-'
   OR cedula = 'J-'
   OR cedula = 'P-'
   OR cedula = 'G-';

-- Ver cuántos se eliminaron
SELECT COUNT(*) as restantes FROM customers;
```

**Cuándo usar:** Cuando solo quieres eliminar registros con problemas.

#### Opción 3: Eliminar duplicados

```sql
-- Eliminar duplicados por teléfono, mantener el más reciente
DELETE FROM customers a
USING customers b
WHERE a.phone = b.phone
  AND a.created_at < b.created_at;

-- Verificar duplicados restantes
SELECT phone, COUNT(*) as cantidad
FROM customers
GROUP BY phone
HAVING COUNT(*) > 1;
```

**Cuándo usar:** Cuando tienes clientes duplicados por teléfono.

### Verificación Antes de Limpiar

```sql
-- Ver todos los clientes
SELECT id, name, phone, cedula, id_type, id_number, code, stamps, created_at
FROM customers
ORDER BY created_at DESC
LIMIT 50;

-- Contar total de clientes
SELECT COUNT(*) as total_clientes FROM customers;

-- Ver clientes con problemas
SELECT id, name, phone, cedula, id_type, id_number
FROM customers
WHERE cedula IS NULL 
   OR cedula = '' 
   OR cedula LIKE '%-'
   OR id_number IS NULL 
   OR id_number = '';

-- Contar clientes con problemas
SELECT COUNT(*) as con_problemas 
FROM customers
WHERE cedula IS NULL OR cedula LIKE '%-';
```

### Backup Antes de Limpiar (IMPORTANTE)

```sql
-- PASO 1: Crear tabla de backup
CREATE TABLE customers_backup AS 
SELECT * FROM customers;

-- PASO 2: Verificar que se creó
SELECT COUNT(*) FROM customers_backup;

-- PASO 3: Ahora sí, limpiar
TRUNCATE TABLE customers RESTART IDENTITY CASCADE;

-- Si algo sale mal, restaurar:
-- INSERT INTO customers SELECT * FROM customers_backup;

-- Cuando todo esté bien, eliminar backup:
-- DROP TABLE customers_backup;
```

### Cómo Ejecutar en Supabase

1. **Ir a Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Proyecto: nennbrzccidutbhbdbzd

2. **Abrir SQL Editor**
   - Menú lateral → SQL Editor
   - Click en "New query"

3. **Pegar y ejecutar el código**
   - Copiar el SQL deseado
   - Pegar en el editor
   - Click en "Run" o `Ctrl+Enter`

4. **Verificar en Table Editor**
   - Menú lateral → Table Editor
   - Seleccionar tabla `customers`
   - Verificar que se limpió correctamente

### Flujo Recomendado Completo

```sql
-- 1. Ver estado actual
SELECT COUNT(*) as total FROM customers;
SELECT COUNT(*) as con_problemas 
FROM customers
WHERE cedula IS NULL OR cedula LIKE '%-';

-- 2. Crear backup
CREATE TABLE customers_backup AS SELECT * FROM customers;

-- 3. Limpiar
TRUNCATE TABLE customers RESTART IDENTITY CASCADE;

-- 4. Verificar limpieza
SELECT COUNT(*) as total FROM customers;
```

### Después de Limpiar

1. **Reiniciar servidor de la aplicación**
   ```bash
   npm start
   ```

2. **Importar clientes nuevamente**
   - Ir a la aplicación
   - Menú → Importar Clientes
   - Seleccionar archivo JSON con 164 clientes
   - Verificar logs en consola (F12)

3. **Verificar importación exitosa**
   ```sql
   -- En Supabase SQL Editor
   SELECT COUNT(*) as total FROM customers;
   
   -- Ver primeros 10 clientes
   SELECT name, phone, cedula, id_type, id_number, code, stamps
   FROM customers
   ORDER BY created_at DESC
   LIMIT 10;
   
   -- Verificar que no hay cédulas inválidas
   SELECT COUNT(*) as con_problemas 
   FROM customers
   WHERE cedula IS NULL OR cedula LIKE '%-';
   ```

4. **Resultado esperado**
   - ✅ 164 clientes importados
   - ✅ Todas las cédulas correctas
   - ✅ Todos los campos mapeados
   - ✅ Sin duplicados
   - ✅ 0 clientes con problemas

### Consultas Útiles Post-Importación

```sql
-- Ver distribución de tipos de cédula
SELECT id_type, COUNT(*) as cantidad
FROM customers
GROUP BY id_type
ORDER BY cantidad DESC;

-- Ver clientes con más sellos
SELECT name, phone, cedula, stamps
FROM customers
ORDER BY stamps DESC
LIMIT 10;

-- Ver clientes sin código
SELECT name, phone, cedula, code
FROM customers
WHERE code IS NULL OR code = '';

-- Estadísticas generales
SELECT 
  COUNT(*) as total_clientes,
  SUM(stamps) as total_sellos,
  AVG(stamps) as promedio_sellos,
  MAX(stamps) as max_sellos,
  COUNT(CASE WHEN cedula IS NOT NULL THEN 1 END) as con_cedula,
  COUNT(CASE WHEN code IS NOT NULL AND code != '' THEN 1 END) as con_codigo
FROM customers;
```

---

## 📊 Resumen de la Sesión (28 Oct 2025)

### Problemas Identificados y Resueltos

1. ✅ **Campos faltantes en importación** - CustomerContext enviaba solo 5 campos
2. ✅ **Duplicados falsos** - Comparación de teléfonos sin normalización
3. ✅ **Error al buscar** - Campos null/undefined causaban crashes
4. ✅ **Cédula vacía** - Generación de "V-" cuando idNumber estaba vacío
5. ✅ **Mapeo incorrecto** - snake_case vs camelCase entre Supabase y app

### Archivos Modificados

- `src/contexts/CustomerContext.js` - Envío completo de campos y validación de cédula
- `src/services/customersService.js` - Función de mapeo snake_case ↔ camelCase
- `src/MainApp.jsx` - Normalización de teléfonos y validación de cédula
- `src/utils/validation.js` - Funciones de normalización de teléfonos
- `src/components/CustomerList.jsx` - Protección contra null/undefined

### Documentación Creada

- ✅ `PROBLEMAS_Y_SOLUCIONES.md` - Consolidación de todos los problemas y soluciones

### Documentación Eliminada

- ❌ `SOLUCION_IMPORTACION_DUPLICADOS.md` - Consolidado
- ❌ `CORRECCION_ERROR_BUSQUEDA.md` - Consolidado
- ❌ `CORRECCION_CEDULA_VACIA.md` - Consolidado

### Estado Final

- ✅ Todos los problemas resueltos
- ✅ Código optimizado con mejores prácticas
- ✅ Documentación consolidada
- ✅ Sistema listo para importación limpia
- ✅ Servidor compilado exitosamente

### Próximos Pasos

1. Limpiar Supabase con SQL (TRUNCATE)
2. Reimportar 164 clientes
3. Verificar que todos tengan cédula correcta
4. Confirmar que no hay duplicados

---

**Última actualización:** 28 de Octubre, 2025 - 4:16 PM  
**Versión:** 1.5.2  
**Estado:** ✅ TODOS LOS PROBLEMAS RESUELTOS  
**Servidor:** ✅ Compilado exitosamente en http://localhost:3003  
**Mantenedor:** ACRIL Pinturas
