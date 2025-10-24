# 🔄 Guía de Migración: localStorage → Supabase

**Objetivo:** Migrar datos existentes de localStorage a Supabase sin pérdida de información

---

## 📋 Opción 1: Migración Automática (Recomendada)

### Paso 1: Exportar Datos Actuales

1. Abrir la aplicación actual (antes de migrar)
2. Abrir DevTools (F12) → Console
3. Ejecutar:

```javascript
// Exportar clientes actuales
const customers = JSON.parse(localStorage.getItem('customers') || '[]');
console.log(`📊 Total clientes: ${customers.length}`);

// Descargar como JSON
const dataStr = JSON.stringify(customers, null, 2);
const dataBlob = new Blob([dataStr], { type: 'application/json' });
const url = URL.createObjectURL(dataBlob);
const link = document.createElement('a');
link.href = url;
link.download = `acrilcard-backup-${new Date().toISOString().split('T')[0]}.json`;
link.click();
```

### Paso 2: Importar a Supabase

**Opción A - Desde la aplicación actualizada:**

1. Actualizar el proyecto con los nuevos archivos
2. Configurar variables de entorno
3. Iniciar la aplicación
4. Ir a Backup Manager
5. Click en "Importar desde archivo"
6. Seleccionar el archivo JSON exportado
7. La aplicación automáticamente importará a Supabase

**Opción B - Script manual:**

```javascript
// En DevTools Console de la nueva aplicación
import { customerService } from './services/customerService';

// Cargar archivo JSON
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'application/json';
fileInput.onchange = async (e) => {
  const file = e.target.files[0];
  const text = await file.text();
  const customers = JSON.parse(text);
  
  console.log(`🚀 Importando ${customers.length} clientes...`);
  const result = await customerService.bulkImport(customers);
  
  if (result.success) {
    console.log('✅ Importación exitosa!');
    console.log(`📊 ${result.data.length} clientes importados`);
  } else {
    console.error('❌ Error:', result.error);
  }
};
fileInput.click();
```

---

## 📋 Opción 2: Migración Manual (SQL)

### Paso 1: Preparar Datos

1. Exportar datos como en Opción 1
2. Convertir JSON a SQL usando este script:

```javascript
const customers = JSON.parse(localStorage.getItem('customers') || '[]');

const sqlInserts = customers.map(c => {
  const name = c.name.replace(/'/g, "''");
  const email = c.email ? `'${c.email.replace(/'/g, "''")}'` : 'NULL';
  
  return `INSERT INTO customers (name, document, phone, email, stamps, total_purchases, rewards_earned, join_date, last_purchase) VALUES ('${name}', '${c.document}', '${c.phone}', ${email}, ${c.stamps || 0}, ${c.totalPurchases || 0}, ${c.rewardsEarned || 0}, '${c.joinDate || new Date().toISOString()}', ${c.lastPurchase ? `'${c.lastPurchase}'` : 'NULL'});`;
}).join('\n');

console.log(sqlInserts);
```

### Paso 2: Ejecutar en Supabase

1. Ir a Supabase Dashboard → SQL Editor
2. Pegar el SQL generado
3. Click en "Run"
4. Verificar en Table Editor

---

## 📋 Opción 3: Importación CSV

### Paso 1: Convertir a CSV

```javascript
const customers = JSON.parse(localStorage.getItem('customers') || '[]');

const csvHeader = 'name,document,phone,email,stamps,total_purchases,rewards_earned,join_date,last_purchase\n';
const csvRows = customers.map(c => 
  `"${c.name}","${c.document}","${c.phone}","${c.email || ''}",${c.stamps || 0},${c.totalPurchases || 0},${c.rewardsEarned || 0},"${c.joinDate || new Date().toISOString()}","${c.lastPurchase || ''}"`
).join('\n');

const csv = csvHeader + csvRows;

// Descargar CSV
const blob = new Blob([csv], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'acrilcard-customers.csv';
link.click();
```

### Paso 2: Importar en Supabase

1. Ir a Table Editor → customers
2. Click en "Insert" → "Import data from CSV"
3. Seleccionar archivo CSV
4. Mapear columnas
5. Click en "Import"

---

## ✅ Verificación Post-Migración

### Checklist de Verificación

```javascript
// Ejecutar en Console después de migración
import { customerService } from './services/customerService';

// 1. Contar clientes
const result = await customerService.getAllCustomers();
console.log(`✅ Total clientes en Supabase: ${result.data.length}`);

// 2. Verificar datos
const sample = result.data[0];
console.log('📋 Cliente de muestra:', sample);

// 3. Verificar campos
const requiredFields = ['id', 'name', 'document', 'phone', 'stamps'];
const hasAllFields = requiredFields.every(field => sample.hasOwnProperty(field));
console.log(`✅ Todos los campos presentes: ${hasAllFields}`);

// 4. Estadísticas
const stats = await customerService.getStatistics();
console.log('📊 Estadísticas:', stats.data);
```

---

## 🔄 Rollback (Si algo sale mal)

### Restaurar desde Backup

```javascript
// 1. Cargar backup local
const backup = JSON.parse(localStorage.getItem('customers_backup') || '[]');

// 2. Restaurar a localStorage
localStorage.setItem('customers', JSON.stringify(backup));

// 3. Recargar página
window.location.reload();
```

### Limpiar Supabase

```sql
-- Eliminar todos los datos (CUIDADO!)
DELETE FROM rewards_claimed;
DELETE FROM purchase_history;
DELETE FROM customers;

-- Reiniciar secuencias
ALTER SEQUENCE customers_id_seq RESTART WITH 1;
```

---

## 📊 Comparación de Datos

### Script de Comparación

```javascript
// Comparar localStorage vs Supabase
const localCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
const supabaseResult = await customerService.getAllCustomers();
const supabaseCustomers = supabaseResult.data;

console.log('📊 Comparación:');
console.log(`Local: ${localCustomers.length} clientes`);
console.log(`Supabase: ${supabaseCustomers.length} clientes`);
console.log(`Diferencia: ${Math.abs(localCustomers.length - supabaseCustomers.length)}`);

// Verificar documentos únicos
const localDocs = new Set(localCustomers.map(c => c.document));
const supabaseDocs = new Set(supabaseCustomers.map(c => c.document));

const missing = [...localDocs].filter(doc => !supabaseDocs.has(doc));
if (missing.length > 0) {
  console.warn('⚠️ Documentos faltantes en Supabase:', missing);
} else {
  console.log('✅ Todos los documentos migrados correctamente');
}
```

---

## 🎯 Mejores Prácticas

### Antes de Migrar

1. ✅ Hacer backup completo de localStorage
2. ✅ Exportar datos a JSON
3. ✅ Verificar integridad de datos
4. ✅ Probar en ambiente de desarrollo primero

### Durante la Migración

1. ✅ Migrar en horario de baja actividad
2. ✅ Monitorear logs de Supabase
3. ✅ Verificar cada lote de datos
4. ✅ Mantener backup accesible

### Después de Migrar

1. ✅ Verificar conteo de registros
2. ✅ Probar funcionalidades CRUD
3. ✅ Verificar búsquedas y filtros
4. ✅ Mantener backup local por 30 días

---

## 🆘 Solución de Problemas

### Error: "duplicate key value violates unique constraint"

**Causa:** Documentos o teléfonos duplicados

**Solución:**
```javascript
// Limpiar duplicados antes de importar
const customers = JSON.parse(localStorage.getItem('customers') || '[]');
const uniqueCustomers = customers.filter((c, index, self) =>
  index === self.findIndex(t => t.document === c.document)
);
console.log(`Eliminados ${customers.length - uniqueCustomers.length} duplicados`);
```

### Error: "Failed to fetch"

**Causa:** Problemas de red o credenciales incorrectas

**Solución:**
1. Verificar variables de entorno
2. Verificar conexión a internet
3. Verificar que Supabase esté activo

### Error: "Row level security policy violation"

**Causa:** Políticas RLS muy restrictivas

**Solución:**
```sql
-- Temporalmente deshabilitar RLS para migración
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- Después de migrar, volver a habilitar
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
```

---

**Estado:** ✅ Guía completa de migración lista
