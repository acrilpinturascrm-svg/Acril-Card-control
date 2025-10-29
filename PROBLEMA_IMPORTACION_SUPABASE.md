# Problema de Importación a Supabase - RESUELTO

**Fecha:** 28 de Octubre, 2025  
**Problema:** Los campos `cedula` y `stamps` (sellos) no se importaban a Supabase desde archivos JSON

---

## 🔍 Diagnóstico del Problema

### Síntoma
Al importar clientes desde un archivo JSON a Supabase, los siguientes campos no se guardaban:
- ❌ `cedula` (documento de identidad)
- ❌ `stamps` (sellos acumulados)
- ❌ `idType` y `idNumber` (componentes de la cédula)
- ❌ `code` (código del cliente)
- ❌ `totalPurchases`, `rewardsEarned`, `purchaseHistory`, `joinDate`, `lastPurchase`

### Causa Raíz
El problema estaba en **`src/contexts/CustomerContext.js`** líneas 76-82:

```javascript
// ❌ CÓDIGO ANTERIOR (INCORRECTO)
const dataToSend = {
  name: customerData.name,
  phone: customerData.phone,
  document: customerData.cedula || customerData.document || null,
  stamps: 0,  // ❌ Siempre enviaba 0
  rewards: 0
};
// ❌ Faltaban: cedula, idType, idNumber, code, totalPurchases, etc.
```

**El contexto solo enviaba 5 campos** al servicio de Supabase, ignorando todos los demás datos del cliente.

---

## ✅ Solución Implementada

### Archivo Corregido: `src/contexts/CustomerContext.js`

**Líneas 73-96** - Función `addCustomer` corregida:

```javascript
// ✅ CÓDIGO NUEVO (CORRECTO)
if (isSupabaseConfigured()) {
  // Crear en Supabase - ENVIAR TODOS LOS CAMPOS
  console.log('📝 Creando cliente en Supabase...');
  const dataToSend = {
    name: customerData.name,
    phone: customerData.phone,
    idType: customerData.idType || 'V',
    idNumber: customerData.idNumber || '',
    cedula: customerData.cedula || `${customerData.idType || 'V'}-${customerData.idNumber || ''}`,
    document: customerData.document || customerData.cedula || null,
    code: customerData.code || null,
    stamps: parseInt(customerData.stamps) || 0,  // ✅ Ahora usa el valor real
    rewards: parseInt(customerData.rewards) || 0,
    totalPurchases: parseInt(customerData.totalPurchases) || 0,
    rewardsEarned: parseInt(customerData.rewardsEarned) || 0,
    joinDate: customerData.joinDate || new Date().toISOString(),
    lastPurchase: customerData.lastPurchase || null,
    purchaseHistory: customerData.purchaseHistory || [],
    history: customerData.history || []
  };
  console.log('🔍 DEBUG Datos completos a enviar a Supabase:', dataToSend);
  
  newCustomer = await customersService.createCustomer(dataToSend);
  console.log('✅ Cliente creado en Supabase:', newCustomer.id);
}
```

### Verificación del Servicio

El archivo `src/services/customersService.js` **YA TENÍA** el mapeo correcto (líneas 114-130):

```javascript
// ✅ customersService.js - Mapeo correcto a columnas de Supabase
const supabaseData = {
  name: customerData.name,
  phone: customerData.phone,
  id_type: customerData.idType || 'V',
  id_number: customerData.idNumber || null,
  cedula: customerData.cedula || null,
  document: customerData.document || customerData.cedula || null,
  code: customerData.code || null,
  stamps: parseInt(customerData.stamps) || 0,
  rewards: parseInt(customerData.rewards) || 0,
  total_purchases: parseInt(customerData.totalPurchases) || 0,
  rewards_earned: parseInt(customerData.rewardsEarned) || 0,
  join_date: customerData.joinDate || null,
  last_purchase: customerData.lastPurchase || null,
  purchase_history: customerData.purchaseHistory || [],
  history: customerData.history || []
};
```

---

## 📋 Esquema de Supabase

El esquema completo está en `SUPABASE_SCHEMA_COMPLETO.sql`:

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información personal
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  
  -- Documento de identidad
  id_type TEXT DEFAULT 'V',  -- V, E, J, P, G
  id_number TEXT,
  cedula TEXT,  -- Formato completo: "V-12345678"
  document TEXT,  -- Alias de cedula
  
  -- Código del cliente
  code TEXT,
  
  -- Sistema de fidelización
  stamps INTEGER DEFAULT 0,
  rewards INTEGER DEFAULT 0,
  total_purchases INTEGER DEFAULT 0,
  rewards_earned INTEGER DEFAULT 0,
  
  -- Fechas
  join_date TEXT,
  last_purchase TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Historial (JSONB)
  purchase_history JSONB DEFAULT '[]'::jsonb,
  history JSONB DEFAULT '[]'::jsonb
);
```

---

## 🧪 Cómo Probar la Corrección

### 1. Preparar archivo JSON de prueba

Crea un archivo `test-import.json`:

```json
{
  "customers": [
    {
      "name": "Juan Pérez",
      "phone": "04141234567",
      "cedula": "V-12345678",
      "idType": "V",
      "idNumber": "12345678",
      "code": "CLI-001",
      "stamps": 5,
      "rewards": 2,
      "totalPurchases": 10,
      "rewardsEarned": 2,
      "joinDate": "2025-01-15T10:00:00.000Z",
      "lastPurchase": "2025-10-20T15:30:00.000Z",
      "purchaseHistory": [
        {"date": "2025-10-20", "amount": 50}
      ]
    }
  ]
}
```

### 2. Importar desde la aplicación

1. Inicia la aplicación: `npm start`
2. Inicia sesión con credenciales de admin
3. Ve al menú → **Importar Clientes**
4. Selecciona el archivo `test-import.json`
5. Verifica el mensaje de éxito

### 3. Verificar en Supabase

1. Ve a Supabase Dashboard
2. Table Editor → `customers`
3. Verifica que el cliente tenga:
   - ✅ `cedula`: "V-12345678"
   - ✅ `stamps`: 5
   - ✅ `id_type`: "V"
   - ✅ `id_number`: "12345678"
   - ✅ `code`: "CLI-001"
   - ✅ Todos los demás campos

### 4. Verificar en la consola del navegador

Deberías ver logs como:

```
🔍 DEBUG addCustomer - Datos recibidos: {name: "Juan Pérez", phone: "04141234567", ...}
📝 Creando cliente en Supabase...
🔍 DEBUG Datos completos a enviar a Supabase: {name: "Juan Pérez", phone: "04141234567", cedula: "V-12345678", stamps: 5, ...}
🔍 DEBUG Datos a enviar a Supabase: {name: "Juan Pérez", phone: "04141234567", id_type: "V", id_number: "12345678", cedula: "V-12345678", stamps: 5, ...}
✅ Cliente creado en Supabase: [uuid]
```

---

## 📝 Formato JSON Soportado

La función de importación soporta múltiples formatos:

### Formato 1: Array directo
```json
[
  {"name": "Cliente 1", "phone": "1234567890", "cedula": "V-12345678", "stamps": 5},
  {"name": "Cliente 2", "phone": "0987654321", "cedula": "V-87654321", "stamps": 3}
]
```

### Formato 2: Objeto con propiedad `customers`
```json
{
  "exportedAt": "2025-10-28T10:00:00.000Z",
  "count": 2,
  "customers": [
    {"name": "Cliente 1", "phone": "1234567890", "cedula": "V-12345678", "stamps": 5},
    {"name": "Cliente 2", "phone": "0987654321", "cedula": "V-87654321", "stamps": 3}
  ]
}
```

### Formato 3: Cliente único
```json
{
  "name": "Cliente Único",
  "phone": "1234567890",
  "cedula": "V-12345678",
  "stamps": 5
}
```

### Mapeo Flexible de Campos

La importación acepta nombres alternativos:

| Campo Estándar | Alternativas Aceptadas |
|----------------|------------------------|
| `name` | `nombre` |
| `phone` | `telefono`, `tel` |
| `stamps` | `sellos` |
| `totalPurchases` | `comprasTotales` |
| `rewardsEarned` | `premiosGanados` |
| `purchaseHistory` | `historialCompras`, `history` |
| `joinDate` | `fechaRegistro`, `createdAt` |
| `lastPurchase` | `ultimaCompra`, `updatedAt` |

---

## 🔄 Flujo Completo de Importación

```
1. Usuario selecciona archivo JSON
   ↓
2. MainApp.jsx → handleImportCustomersFromJSON()
   - Parsea el JSON
   - Detecta formato (array, objeto con customers, etc.)
   - Extrae idType/idNumber de cedula si es necesario
   ↓
3. Por cada cliente:
   - Verifica si ya existe (por teléfono)
   - Prepara datos con mapeo flexible
   - Llama a addCustomer(clientData)
   ↓
4. CustomerContext.js → addCustomer()
   - Prepara TODOS los campos (incluyendo cedula, stamps, etc.)
   - Llama a customersService.createCustomer(dataToSend)
   ↓
5. customersService.js → createCustomer()
   - Mapea campos a nombres de columnas de Supabase
   - Inserta en tabla 'customers'
   ↓
6. Supabase guarda el registro completo
   ↓
7. Actualiza estado local y muestra resumen
```

---

## ⚠️ Notas Importantes

1. **Reiniciar servidor**: Si modificas `.env`, reinicia con `Ctrl+C` y `npm start`

2. **Esquema actualizado**: Asegúrate de ejecutar `SUPABASE_SCHEMA_COMPLETO.sql` en Supabase SQL Editor

3. **Duplicados**: La importación omite clientes con teléfonos duplicados

4. **Parseo de cédula**: Si el JSON tiene `cedula: "V-12345678"` pero no `idType` ni `idNumber`, la importación los extrae automáticamente

5. **Logs de debugging**: Los logs con 🔍 DEBUG ayudan a rastrear el flujo de datos

---

## 📚 Archivos Relacionados

- ✅ **Corregido**: `src/contexts/CustomerContext.js` (líneas 73-96)
- ✅ **Verificado**: `src/services/customersService.js` (líneas 114-130)
- 📄 **Esquema**: `SUPABASE_SCHEMA_COMPLETO.sql`
- 📄 **Importación**: `src/MainApp.jsx` (líneas 133-222)
- 📄 **Documentación**: `AI_ASSISTANT_PROMPT.md`

---

## ✅ Resultado Final

Después de esta corrección:

- ✅ Todos los campos se importan correctamente a Supabase
- ✅ La cédula se guarda en formato completo ("V-12345678")
- ✅ Los sellos (stamps) mantienen su valor original
- ✅ El código del cliente se preserva
- ✅ El historial de compras se guarda como JSONB
- ✅ Las fechas se mantienen correctamente

**Estado:** PROBLEMA RESUELTO ✅

---

**Última actualización:** 28 de Octubre, 2025  
**Versión:** 1.5.0  
**Mantenedor:** ACRIL Pinturas
