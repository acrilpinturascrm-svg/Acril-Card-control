# 📘 Guía de Migración a Supabase: Lecciones Aprendidas

**Propósito:** Documento de referencia para futuras migraciones o proyectos similares  
**Fecha de creación:** 11 de Noviembre, 2025  
**Basado en:** Proyecto ACRILCARD - Migración exitosa a Supabase  
**Versión:** 1.0.0

---

## 🎯 Resumen Ejecutivo

Este documento consolida las lecciones aprendidas durante la migración de ACRILCARD a Supabase, proporcionando una **ruta clara** para evitar y resolver problemas comunes en migraciones similares.

### Problemas Principales Resueltos
1. ✅ Pérdida de datos en importación (campos faltantes)
2. ✅ Mapeo incorrecto entre frontend y base de datos
3. ✅ Conversión de tipos de datos
4. ✅ Bypass de arquitectura (contexto ignorado)
5. ✅ Sincronización entre múltiples capas

---

## 📋 Índice de Problemas

1. [Problema 1: Pérdida de Datos en Importación](#problema-1-pérdida-de-datos-en-importación)
2. [Problema 2: Mapeo Incorrecto de Campos](#problema-2-mapeo-incorrecto-de-campos)
3. [Problema 3: Conversión de Tipos de Datos](#problema-3-conversión-de-tipos-de-datos)
4. [Problema 4: Bypass de Arquitectura](#problema-4-bypass-de-arquitectura)
5. [Checklist de Migración](#checklist-de-migración)

---

## Problema 1: Pérdida de Datos en Importación

### 🔍 Síntoma
Los datos se crean en la interfaz pero **no todos los campos** se guardan en la base de datos.

### 🎯 Causa Raíz
El contexto o servicio solo envía un **subconjunto de campos** al backend, ignorando el resto.

### ❌ Código Problemático

```javascript
// ❌ INCORRECTO - Solo envía 5 campos
const dataToSend = {
  name: customerData.name,
  phone: customerData.phone,
  document: customerData.cedula || customerData.document || null,
  stamps: 0,  // ❌ Siempre envía 0
  rewards: 0
};
```

### ✅ Solución

```javascript
// ✅ CORRECTO - Envía TODOS los campos
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

### 🛠️ Pasos para Diagnosticar

1. Agregar logs: `console.log('🔍 Datos a enviar:', dataToSend);`
2. Verificar en Supabase Dashboard qué campos están vacíos
3. Comparar campos del formulario vs objeto enviado vs columnas DB

---

## Problema 2: Mapeo Incorrecto de Campos

### 🔍 Síntoma
Los datos se guardan pero con **nombres incorrectos** o no se recuperan correctamente.

### 🎯 Causa Raíz
Frontend usa `camelCase` pero PostgreSQL usa `snake_case`.

### ✅ Solución: Funciones de Mapeo

```javascript
// Frontend → Base de Datos
const mapAppToSupabase = (appData) => {
  return {
    name: appData.name,
    phone: appData.phone,
    id_type: appData.idType,
    id_number: appData.idNumber,
    total_purchases: appData.totalPurchases,
    rewards_earned: appData.rewardsEarned,
    join_date: appData.joinDate,
    last_purchase: appData.lastPurchase,
    purchase_history: appData.purchaseHistory
  };
};

// Base de Datos → Frontend
const mapSupabaseToApp = (supabaseData) => {
  return {
    id: supabaseData.id,
    name: supabaseData.name,
    phone: supabaseData.phone,
    idType: supabaseData.id_type || 'V',
    idNumber: supabaseData.id_number || '',
    totalPurchases: supabaseData.total_purchases || 0,
    rewardsEarned: supabaseData.rewards_earned || 0,
    joinDate: supabaseData.join_date || null,
    lastPurchase: supabaseData.last_purchase || null,
    purchaseHistory: supabaseData.purchase_history || []
  };
};
```

### 📝 Tabla de Mapeo

| Frontend (camelCase) | Base de Datos (snake_case) |
|---------------------|---------------------------|
| `idType` | `id_type` |
| `idNumber` | `id_number` |
| `totalPurchases` | `total_purchases` |
| `rewardsEarned` | `rewards_earned` |
| `joinDate` | `join_date` |
| `lastPurchase` | `last_purchase` |
| `purchaseHistory` | `purchase_history` |

---

## Problema 3: Conversión de Tipos de Datos

### 🔍 Síntoma
Campos numéricos se guardan como texto o viceversa.

### 🎯 Causa Raíz
JavaScript es débilmente tipado, PostgreSQL es fuertemente tipado.

### ✅ Solución

```javascript
const dataToSend = {
  // Números enteros
  stamps: parseInt(customerData.stamps) || 0,
  rewards: parseInt(customerData.rewards) || 0,
  
  // Números decimales
  price: parseFloat(customerData.price) || 0.0,
  
  // Booleanos
  isActive: Boolean(customerData.isActive),
  
  // Fechas ISO 8601
  joinDate: customerData.joinDate || new Date().toISOString(),
  
  // Arrays
  history: Array.isArray(customerData.history) ? customerData.history : []
};
```

### 📊 Guía de Conversión

| Tipo PostgreSQL | Conversión JavaScript |
|----------------|----------------------|
| `INTEGER` | `parseInt(value) \|\| 0` |
| `NUMERIC` | `parseFloat(value) \|\| 0.0` |
| `BOOLEAN` | `Boolean(value)` |
| `TIMESTAMP` | `new Date().toISOString()` |
| `JSONB` | Verificar con `Array.isArray()` |

---

## Problema 4: Bypass de Arquitectura

### 🔍 Síntoma
Los datos se guardan en localStorage pero **no en Supabase**.

### 🎯 Causa Raíz
Componentes bypassean el contexto y guardan directamente.

### ❌ Código Problemático

```javascript
// ❌ INCORRECTO - Bypass del contexto
const onSave = async (customerData) => {
  const newCustomer = { id: `temp-${Date.now()}`, ...customerData };
  
  // ❌ Guarda directamente en localStorage
  setCustomers(prev => {
    const updated = [...prev, newCustomer];
    localStorage.setItem('customers', JSON.stringify(updated));
    return updated;
  });
};
```

### ✅ Solución

```javascript
// ✅ CORRECTO - Usa el contexto
import { useCustomers } from '../contexts/CustomerContext';

const MyComponent = () => {
  const { addCustomer: addCustomerFromContext } = useCustomers();
  
  const onSave = async (customerData) => {
    try {
      const payload = { name: customerData.name, phone: customerData.phone };
      const created = await addCustomerFromContext(payload);
      console.log('✅ Cliente creado:', created);
    } catch (error) {
      console.error('❌ Error:', error);
    }
  };
};
```

### 📝 Flujo Correcto

```
Componente UI
    ↓
useCustomers() hook
    ↓
CustomerContext
    ↓
customersService
    ↓
Supabase
```

---

## Checklist de Migración

### 📋 Pre-Migración
- [ ] Documentar esquema actual (tablas, campos, tipos)
- [ ] Crear backup completo en JSON
- [ ] Definir esquema SQL para Supabase

### 🔧 Durante Migración
- [ ] Crear proyecto en Supabase
- [ ] Ejecutar SQL de esquema
- [ ] Instalar `@supabase/supabase-js`
- [ ] Crear `supabaseClient.js`
- [ ] Crear funciones de mapeo (camelCase ↔ snake_case)
- [ ] Implementar servicio CRUD completo
- [ ] Actualizar contexto para usar Supabase
- [ ] Verificar que NO hay bypass de contexto

### ✅ Post-Migración
- [ ] Crear registro de prueba
- [ ] Verificar en Supabase Dashboard
- [ ] Migrar datos existentes
- [ ] Eliminar código obsoleto
- [ ] Actualizar documentación

---

## Patrones de Código Recomendados

### Servicio CRUD Completo

```javascript
// src/services/myService.js
import { supabase, isSupabaseConfigured } from './supabaseClient';

const TABLE = 'my_table';

const mapSupabaseToApp = (data) => ({ /* mapeo */ });
const mapAppToSupabase = (data) => ({ /* mapeo */ });

export const getAll = async () => {
  if (!isSupabaseConfigured()) {
    const local = localStorage.getItem('data');
    return local ? JSON.parse(local) : [];
  }
  
  const { data, error } = await supabase.from(TABLE).select('*');
  if (error) throw error;
  return (data || []).map(mapSupabaseToApp);
};

export const create = async (itemData) => {
  const supabaseData = mapAppToSupabase(itemData);
  const { data, error } = await supabase
    .from(TABLE)
    .insert([supabaseData])
    .select()
    .single();
  
  if (error) throw error;
  return mapSupabaseToApp(data);
};
```

---

## Herramientas de Debugging

### Logs Estratégicos

```javascript
// Logs condicionales por ambiente
const logger = {
  debug: (msg, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 ${msg}`, data);
    }
  },
  error: (msg, error) => {
    console.error(`❌ ${msg}`, error);
  }
};

// Uso
logger.debug('Datos a enviar:', dataToSend);
```

### Verificación en Supabase

```sql
-- Ver últimos registros
SELECT * FROM customers ORDER BY created_at DESC LIMIT 10;

-- Verificar campos vacíos
SELECT * FROM customers WHERE cedula IS NULL OR cedula = '';

-- Contar registros
SELECT COUNT(*) FROM customers;
```

---

## Lecciones Clave

1. **Siempre enviar TODOS los campos** - No asumir valores por defecto
2. **Mapear camelCase ↔ snake_case** - Crear funciones centralizadas
3. **Convertir tipos explícitamente** - Usar `parseInt()`, `parseFloat()`, etc.
4. **Respetar la arquitectura** - Nunca bypassear el contexto
5. **Agregar logs estratégicos** - Facilita debugging futuro
6. **Crear funciones de mapeo reutilizables** - DRY principle
7. **Verificar en múltiples capas** - UI, logs, Supabase Dashboard

---

## Referencias del Proyecto ACRILCARD

### Archivos Clave Modificados
- `src/contexts/CustomerContext.js` (líneas 103-119)
- `src/services/customersService.js` (líneas 16-38, 208-224)
- `src/components/LoyaltyCardSystem.jsx` (líneas 11-12, 59, 869)

### Documentación Relacionada
- `PROBLEMA_IMPORTACION_SUPABASE.md` - Problema de campos faltantes
- `MIGRACION_SUPABASE.md` - Registro completo de migración
- `PROBLEMAS_Y_SOLUCIONES.md` - Consolidación de 5 problemas

---

**Última actualización:** 11 de Noviembre, 2025  
**Autor:** Basado en experiencia real de ACRILCARD  
**Estado:** ✅ Validado y probado en producción
