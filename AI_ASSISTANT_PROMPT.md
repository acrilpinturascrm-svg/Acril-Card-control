# AI Assistant Prompt - ACRILCARD Project

## Contexto del Proyecto
Sistema empresarial de fidelización de clientes desarrollado con React 18, TailwindCSS y Material-UI. Incluye autenticación con roles granulares, **backend en Supabase (PostgreSQL)**, PWA completa y sistema de reportes avanzados.

**Última migración:** 28 de Octubre, 2025 - Migrado de Google Drive a Supabase como backend principal.

## Stack Tecnológico
- React 18.2.0 + React Router 6.28.5
- TailwindCSS + Material-UI
- Context API para estado global
- **Supabase (PostgreSQL)** - Backend y base de datos
- **@supabase/supabase-js** - Cliente de Supabase
- Lucide React para iconos
- PWA con Service Workers
- LocalStorage como fallback cuando Supabase no está disponible

## Principios de Desarrollo

### 1. Arquitectura y Estructura
- **Componentes modulares**: Cada componente debe tener una única responsabilidad
- **Context API**: Usar contextos existentes (AuthContext, CustomerContext, NotificationContext)
- **Hooks personalizados**: Crear hooks reutilizables para lógica compleja
- **Error Boundaries**: Implementar manejo robusto de errores en cada nivel

### 2. Sistema de Permisos
- **28 permisos granulares** definidos en `utils/permissions.simple.js`
- **Verificar permisos** antes de mostrar UI o ejecutar acciones
- **Roles**: Admin (acceso completo) vs Empleado (operaciones básicas)
- **Middleware**: Usar `PermissionMiddleware` para validaciones

### 3. Estándares de Código
- **ES6+**: Usar sintaxis moderna (arrow functions, destructuring, spread operator)
- **Functional Components**: Solo componentes funcionales con hooks
- **PropTypes**: Validar props en todos los componentes
- **Nombres descriptivos**: Variables y funciones en español para consistencia
- **Comentarios**: Solo cuando la lógica no es obvia

### 4. Gestión de Estado
- **CustomerContext**: Para operaciones CRUD de clientes (conectado a Supabase)
- **AuthContext**: Para autenticación y permisos
- **NotificationContext**: Para mensajes al usuario
- **Supabase**: Persistencia principal en PostgreSQL
- **LocalStorage**: Fallback automático cuando Supabase no está disponible

### 5. UI/UX
- **TailwindCSS**: Clases utility-first para estilos
- **Responsive**: Mobile-first design con breakpoints sm, md, lg, xl
- **Accesibilidad**: WCAG 2.1 AA compliance
- **Feedback visual**: Loading states, success/error messages
- **Material-UI**: Solo para componentes complejos (Modals, Selects)

### 6. Manejo de Errores
- **Try-catch**: En todas las operaciones asíncronas
- **Error Boundaries**: Para errores de renderizado
- **Notificaciones**: Usar `showError()` y `showSuccess()` del NotificationContext
- **Logging**: Console.error para debugging

### 7. Performance
- **React.memo**: Para componentes que renderizan frecuentemente
- **useMemo/useCallback**: Para cálculos costosos y funciones estables
- **Lazy Loading**: Para rutas y componentes grandes
- **Code Splitting**: Automático con React.lazy()

### 8. Testing
- **Jest + React Testing Library**: Para tests unitarios
- **Coverage**: Mínimo 70% en componentes críticos
- **Tests de integración**: Para flujos completos

### 9. Base de Datos y Persistencia
- **Supabase (PostgreSQL)**: Base de datos principal en la nube
- **Backups automáticos**: Supabase realiza backups diarios automáticamente
- **LocalStorage**: Fallback cuando Supabase no está disponible
- **Sincronización**: Datos sincronizados entre dispositivos vía Supabase
- **Esquema**: Definido en `SUPABASE_SCHEMA_SIMPLE.sql`

### 10. Seguridad
- **Validación de entrada**: Sanitizar todos los inputs
- **Verificación de permisos**: En frontend y lógica de negocio
- **Credenciales**: Nunca hardcodear, usar variables de entorno
- **HTTPS**: Solo en producción

## Estructura de Archivos

```
src/
├── components/          # Componentes de UI
│   ├── common/         # Componentes reutilizables
│   │   └── index.js    # Exporta EnhancedCustomerForm, Button, etc.
│   ├── EnhancedCustomerForm.jsx  # ⚠️ Formulario REAL usado (no CustomerForm.jsx)
│   ├── CustomerForm.jsx          # ⚠️ NO se usa (legacy)
│   ├── LoyaltyCardSystem.jsx     # Componente principal del sistema
│   └── [Feature].jsx             # Componentes específicos
├── contexts/           # Context API providers
│   ├── CustomerContext.js    # Conectado a Supabase
│   ├── AuthContext.js
│   └── NotificationContext.js
├── hooks/              # Custom hooks
├── services/           # Servicios externos
│   ├── supabaseClient.js     # Cliente de Supabase
│   ├── customersService.js   # CRUD de clientes
│   └── [otros servicios]
├── utils/              # Utilidades y helpers
├── pages/              # Páginas completas
├── App.js              # Router principal
├── MainApp.jsx         # App protegida
└── index.js            # Entry point
```

### ⚠️ Componentes Importantes a Conocer

**EnhancedCustomerForm.jsx** es el formulario REAL usado en producción, NO `CustomerForm.jsx`.

Cuando modifiques el formulario de clientes, siempre edita:
- `src/components/EnhancedCustomerForm.jsx` ✅
- `src/components/LoyaltyCardSystem.jsx` (para el `onSave`) ✅

NO edites `CustomerForm.jsx` ya que no se usa.

## Flujo de Trabajo

### Antes de Modificar Código
1. **Leer archivos relevantes** para entender contexto
2. **Verificar permisos** si la funcionalidad requiere autenticación
3. **Revisar componentes relacionados** para evitar duplicación
4. **Proponer cambios** antes de implementar

### Al Crear Nuevos Componentes
1. **Ubicación**: `src/components/` o `src/components/common/`
2. **PropTypes**: Definir y validar todas las props
3. **Hooks**: Usar hooks existentes cuando sea posible
4. **Estilos**: TailwindCSS utility classes
5. **Exportar**: Named export + default export

### Al Modificar Estado
1. **Context primero**: SIEMPRE usar funciones del contexto (`addCustomer`, `updateCustomer`, `deleteCustomer`)
2. **NUNCA bypass el contexto**: No guardar directamente en localStorage o Supabase
3. **Supabase automático**: El contexto maneja Supabase automáticamente
4. **Notificaciones**: Feedback al usuario con NotificationContext
5. **Validación**: Antes de actualizar estado

### ⚠️ IMPORTANTE: Flujo Correcto de Datos

**✅ CORRECTO:**
```javascript
// En LoyaltyCardSystem.jsx o cualquier componente
const { addCustomer } = useCustomers();

const handleSave = async (customerData) => {
  const created = await addCustomer(customerData);
  // addCustomer maneja Supabase automáticamente
};
```

**❌ INCORRECTO (NO HACER):**
```javascript
// ❌ NO guardar directamente en localStorage
setCustomers(prev => {
  const updated = [...prev, newCustomer];
  localStorage.setItem('customers', JSON.stringify(updated));
  return updated;
});

// ❌ NO llamar directamente a customersService
const created = await customersService.createCustomer(data);
```

**Flujo correcto:**
```
Componente → useCustomers() → CustomerContext → customersService → Supabase
```

### 📋 Funciones CRUD Correctas (Referencia Rápida)

**SIEMPRE usar estas funciones del contexto:**

```javascript
// En cualquier componente
const { 
  addCustomer,      // Crear cliente
  updateCustomer,   // Actualizar cliente
  deleteCustomer,   // Eliminar cliente
  customers,        // Lista de clientes
  loading           // Estado de carga
} = useCustomers();

// Si hay conflicto de nombres, usar alias:
const { 
  addCustomer: addCustomerFromContext,
  deleteCustomer: deleteCustomerFromContext 
} = useCustomers();
```

**✅ CORRECTO - Crear Cliente:**
```javascript
const handleCreate = async (data) => {
  const created = await addCustomer(data);
  // Cliente guardado en Supabase automáticamente
};
```

**❌ INCORRECTO - NO HACER:**
```javascript
// ❌ NO guardar directamente en localStorage
setCustomers([...customers, newCustomer]);
localStorage.setItem('customers', JSON.stringify(customers));

// ❌ NO llamar directamente al servicio
await customersService.createCustomer(data);
```

**Archivos Críticos:**
- `src/contexts/CustomerContext.js` - Funciones del contexto
- `src/services/customersService.js` - Servicio de Supabase
- `src/components/LoyaltyCardSystem.jsx` - Uso correcto del contexto

### Al Agregar Funcionalidades
1. **Permisos**: Definir qué roles pueden acceder
2. **Rutas**: Agregar en `App.js` con `ProtectedRoute`
3. **Navegación**: Actualizar `Navigation.jsx`
4. **Documentación**: Actualizar README.md

## Convenciones de Nombres

### Componentes
- **PascalCase**: `CustomerList.jsx`, `BackupManager.jsx`
- **Descriptivos**: Nombre debe indicar función clara

### Funciones
- **camelCase**: `handleSubmit`, `normalizeCustomerIds`
- **Verbos**: Iniciar con verbo de acción

### Variables
- **camelCase**: `stampsPerReward`, `showModal`
- **Booleanos**: Prefijo `is`, `has`, `show`

### Constantes
- **UPPER_SNAKE_CASE**: `USER_ROLES`, `PERMISSIONS`

### Archivos
- **Componentes**: PascalCase.jsx
- **Utilidades**: camelCase.js
- **Contextos**: PascalCase + Context.js

## Comandos Útiles

```bash
# Desarrollo
npm start                # Iniciar dev server (puerto 3000)

# Build
npm run build           # Build para producción
npm run preview         # Preview del build

# Testing
npm test                # Ejecutar tests
npm run test:coverage   # Tests con coverage

# Limpieza
npm run clean           # Limpiar cache y build

# Deploy
npm run deploy          # Deploy a GitHub Pages
```

## Variables de Entorno Críticas

```env
# Supabase (Backend Principal)
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu_anon_key_aqui

# Configuración
REACT_APP_STAMPS_PER_REWARD=10
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=1.5.0

# PWA
REACT_APP_PWA_ENABLED=true
REACT_APP_NOTIFICATIONS_ENABLED=true
```

### ⚠️ Importante sobre Variables de Entorno

1. **Reiniciar servidor**: Después de modificar `.env`, SIEMPRE reinicia el servidor (`Ctrl+C` y `npm start`)
2. **Sin comillas**: No uses comillas en los valores
3. **Sin espacios**: No dejes espacios alrededor del `=`
4. **Prefijo obligatorio**: Todas las variables deben empezar con `REACT_APP_`

**Ejemplo correcto:**
```env
REACT_APP_SUPABASE_URL=https://nennbrzccidutbhbdbzd.supabase.co
```

**Ejemplo incorrecto:**
```env
REACT_APP_SUPABASE_URL = "https://nennbrzccidutbhbdbzd.supabase.co"  # ❌
```

## Checklist para Pull Requests

- [ ] Código sigue convenciones del proyecto
- [ ] PropTypes definidos en componentes nuevos
- [ ] Permisos verificados para funcionalidades protegidas
- [ ] Responsive design implementado
- [ ] Manejo de errores con try-catch
- [ ] Notificaciones al usuario implementadas
- [ ] Tests unitarios agregados/actualizados
- [ ] README actualizado si es necesario
- [ ] Sin console.logs en código de producción
- [ ] Build exitoso sin warnings

## Recursos Importantes

### Documentación Principal
- **Migración a Supabase**: `MIGRACION_SUPABASE.md` - Registro completo de la migración
- **Configuración de Supabase**: `SUPABASE_SETUP.md` - Guía de configuración
- **Esquema de base de datos**: `SUPABASE_SCHEMA_SIMPLE.sql` - Esquema SQL actual
- **Problemas conocidos**: `PROBLEMA_SUPABASE_CLIENTES.md` - Problemas resueltos y lecciones aprendidas
- **Documentación de permisos**: `utils/permissions.simple.js`
- **Guía de inicio rápido**: `QUICK_START.md`
- **Mapa del proyecto**: `PROJECT_MAP.md`

### Archivos Clave del Código
- **Cliente Supabase**: `src/services/supabaseClient.js`
- **Servicio de clientes**: `src/services/customersService.js`
- **Contexto de clientes**: `src/contexts/CustomerContext.js`
- **Formulario principal**: `src/components/EnhancedCustomerForm.jsx`
- **Sistema principal**: `src/components/LoyaltyCardSystem.jsx`

## Notas Importantes

1. **No eliminar funcionalidades existentes** sin consultar
2. **Mantener compatibilidad** con versiones anteriores de datos
3. **Probar en móvil** antes de considerar completo
4. **NUNCA commitear credenciales** - Usar siempre variables de entorno
5. **Documentar decisiones técnicas** importantes
6. **Respetar el flujo de datos**: Siempre usar el contexto, nunca bypass
7. **Verificar componente real**: `EnhancedCustomerForm` es el usado, no `CustomerForm`
8. **Reiniciar servidor**: Después de cambios en `.env`

## Problemas Comunes y Soluciones

### 1. "Los clientes no se guardan en Supabase"
**Causa:** Bypass del contexto, guardando directamente en localStorage  
**Solución:** Usar siempre `addCustomer()` del contexto

### 2. "Variables de entorno no se cargan"
**Causa:** Servidor no reiniciado después de cambiar `.env`  
**Solución:** `Ctrl+C` y `npm start`

### 3. "Modifico CustomerForm.jsx pero no hay cambios"
**Causa:** El componente real es `EnhancedCustomerForm.jsx`  
**Solución:** Editar `EnhancedCustomerForm.jsx` y `LoyaltyCardSystem.jsx`

### 4. "Error: relation 'customers' does not exist"
**Causa:** Tablas no creadas en Supabase  
**Solución:** Ejecutar `SUPABASE_SCHEMA_SIMPLE.sql` en Supabase SQL Editor

### 5. "Logs de DEBUG no aparecen"
**Causa:** Código modificado no es el que se ejecuta  
**Solución:** Verificar imports y componentes reales usando `grep`

## Credenciales de Prueba

```javascript
// Administrador - Acceso completo (28 permisos)
Usuario: Acrilgroup
Contraseña: ACRILCARD2025

// Empleado - Operaciones básicas (8 permisos)
Usuario: empleado
Contraseña: empleado123
```

---

## Esquema de Base de Datos (Supabase)

### Tabla: `customers`
```sql
- id: UUID (Primary Key, auto-generado)
- name: TEXT (NOT NULL)
- phone: TEXT (UNIQUE, NOT NULL)
- document: TEXT (Opcional, ej: "V-12345678")
- stamps: INTEGER (Default: 0)
- rewards: INTEGER (Default: 0)
- created_at: TIMESTAMPTZ (Auto)
- updated_at: TIMESTAMPTZ (Auto, con trigger)
```

### Tabla: `stamp_history`
```sql
- id: UUID (Primary Key)
- customer_id: UUID (Foreign Key -> customers.id)
- stamps_added: INTEGER (NOT NULL)
- created_at: TIMESTAMPTZ (Auto)
```

### Políticas de Seguridad (RLS)
- Row Level Security habilitado
- Políticas permiten acceso completo con `anon` key
- Triggers automáticos para `updated_at`

---

## Historial de Cambios Importantes

### 28 de Octubre, 2025 - Migración a Supabase y Correcciones CRUD
**Sesión completa de 5 horas - 6 problemas resueltos**

#### Migración Inicial:
- ✅ Eliminado Google Drive como sistema de backup
- ✅ Integrado Supabase como backend principal
- ✅ Creado esquema simplificado de base de datos (`SUPABASE_SCHEMA_SIMPLE.sql`)
- ✅ Actualizado CustomerContext para usar Supabase
- ⚠️ `CustomerForm.jsx` marcado como legacy (no se usa)
- ✅ `EnhancedCustomerForm.jsx` confirmado como componente activo

#### Problemas Encontrados y Resueltos:

**Problema 1-3: Creación de Clientes**
- ❌ Clientes no se guardaban en Supabase
- ✅ Corregido `LoyaltyCardSystem.jsx` para usar `addCustomerFromContext`
- ✅ Agregados logs de debugging
- ✅ Importado `useCustomers` del contexto

**Problema 4: Eliminación de Clientes**
- ❌ Clientes reaparecían al recargar
- ✅ Corregido para usar `deleteCustomerFromContext`
- ✅ Eliminación persistente en Supabase

**Problema 5: Importación de Clientes**
- ❌ Importación solo guardaba en localStorage
- ✅ Reescrita función para usar `addCustomerFromContext`
- ✅ Importación por lotes con detección de duplicados
- ✅ Resumen de importación (exitosos/omitidos/errores)

**Problema 6: Menú de Importar/Exportar**
- ❌ Funciones no visibles en el menú
- ✅ Agregados botones en `Navigation.jsx`
- ✅ Creada función de importación en `MainApp.jsx`
- ✅ Mejorado diseño del menú con colores de marca

#### Mejoras de UX:
- ✅ Menú desplegable rediseñado con colores ACRILCARD (rojo/naranja)
- ✅ Iconos coloridos por categoría
- ✅ Gradientes en hover
- ✅ Contador de clientes en botón de exportar
- ✅ Secciones organizadas: Datos, Reportes, Sistema

#### Archivos Modificados:
1. `src/components/LoyaltyCardSystem.jsx` - Funciones CRUD corregidas
2. `src/contexts/CustomerContext.js` - Logs de debugging
3. `src/services/supabaseClient.js` - Logs de configuración
4. `src/components/common/Navigation.jsx` - Menú mejorado
5. `src/MainApp.jsx` - Función de importación agregada
6. `SUPABASE_SCHEMA_SIMPLE.sql` - Esquema creado
7. `PROBLEMA_SUPABASE_CLIENTES.md` - Documentación completa

**Documentación:** Ver `MIGRACION_SUPABASE.md` y `PROBLEMA_SUPABASE_CLIENTES.md`

**Lección Principal:** Todas las operaciones CRUD DEBEN usar el contexto. NUNCA guardar directamente en localStorage o Supabase.

---

**Última actualización**: 28 de Octubre, 2025
**Versión del proyecto**: 1.5.0
**Backend**: Supabase (PostgreSQL)
**Mantenedor**: ACRIL Pinturas
