# 🗺️ MAPA DEL PROYECTO ACRILCARD

> **Documentación técnica completa de la arquitectura y componentes del sistema de fidelización ACRILCARD**

---

## 📁 ESTRUCTURA GENERAL DEL PROYECTO

```
ACRILCARD/
├── 📄 Archivos de Configuración (package.json, tailwind.config.js, etc.)
├── 📚 Documentación (README.md, CHANGELOG.md, GOOGLE_DRIVE_SETUP.md)
├── 🔧 Configuración de Deploy (netlify.toml, vercel.json)
└── 📂 src/ (Código fuente principal)
    ├── 🎯 App.js (Punto de entrada)
    ├── 🏠 MainApp.jsx (Aplicación principal)
    ├── 📦 components/ (Componentes React)
    ├── 🌐 contexts/ (Context API)
    ├── 🪝 hooks/ (Custom Hooks)
    ├── 🛠️ services/ (Servicios)
    ├── 🔧 utils/ (Utilidades)
    └── 📄 pages/ (Páginas)
```

---

## 🎯 COMPONENTES PRINCIPALES

### 🏠 Arquitectura de la Aplicación

#### **App.js - Punto de Entrada Principal**
- **Función**: Configuración de rutas y providers globales
- **Responsabilidades**:
  - Configurar React Router
  - Envolver la app con Context Providers
  - Definir rutas principales (`/`, `/login`, `/reports`, etc.)
- **Providers**: AuthProvider → NotificationProvider → CustomerProvider

#### **MainApp.jsx - Aplicación Principal Protegida**
- **Función**: Componente principal después del login
- **Responsabilidades**:
  - Gestión del estado de clientes
  - Manejo de importación/exportación JSON
  - Control de filtros y búsquedas
  - Integración con sistema de navegación

---

## 🧩 COMPONENTES FUNCIONALES

### 💳 Sistema de Fidelización

#### **LoyaltyCardSystem.jsx - Componente Central (1,228 líneas)**
- **Función**: Sistema completo de tarjetas de fidelización
- **Características**:
  - 🎨 **CustomerLoyaltyCard**: Tarjeta visual del cliente
  - 👥 **Vista de lista**: Gestión masiva de clientes
  - 👤 **Vista individual**: Detalles específicos del cliente
  - 🔍 **Sistema de búsqueda**: Filtros avanzados
  - ⚡ **Scroll pasivo**: Optimización de performance
- **Estados**: Vista actual, cliente seleccionado, filtros, búsqueda

#### **EnhancedCustomerForm.jsx - Formulario Avanzado (515 líneas)**
- **Función**: Formulario robusto para crear/editar clientes
- **Características**:
  - ✅ **Validación completa**: Campos obligatorios y formatos
  - 🔄 **Estados de carga**: Feedback visual
  - 🎯 **Generación automática**: Códigos únicos
  - 📱 **Responsive**: Adaptable a móviles

### 📊 Sistema de Reportes y Analytics

#### **Reports.jsx - Reportes Básicos**
- **Función**: Reportes estándar para empleados
- **Métricas**: Clientes totales, sellos, premios

#### **AdvancedReports.jsx - Reportes Avanzados**
- **Función**: Analytics detallados para administradores
- **Características**: Gráficos, tendencias, exportación

#### **Analytics.jsx - Dashboard Analítico**
- **Función**: Visualización avanzada de datos
- **Solo para**: Administradores con permisos especiales

### 🔐 Sistema de Autenticación

#### **LoginForm.jsx - Formulario de Login**
- **Función**: Autenticación de usuarios
- **Características**:
  - 👁️ **Mostrar/ocultar contraseña**
  - 🔒 **Control de intentos fallidos**
  - 🎯 **Validación en tiempo real**

#### **ProtectedRoute.jsx - Rutas Protegidas**
- **Función**: Control de acceso por permisos
- **Características**: Verificación granular de permisos

### ⚙️ Sistema de Configuración

#### **Settings.jsx - Panel de Configuración**
- **Función**: Configuración del sistema (solo admin)
- **Características**:
  - 🔧 **Configuración de sellos**
  - 👥 **Gestión de usuarios**
  - 🧹 **Limpieza de cache**

#### **BackupManager.jsx - Gestor de Backups**
- **Función**: Sistema completo de respaldos
- **Características**:
  - 💾 **Backup local**: Descarga automática
  - ☁️ **Google Drive**: Sincronización en la nube
  - ⏰ **Backup automático**: Programado
  - 📊 **Historial**: Seguimiento de backups

#### **BackupFloatingAlert.jsx - Alerta Flotante de Backup (NUEVO)**
- **Función**: Sistema de alertas inteligentes para backup
- **Características**:
  - 🚨 **Alertas flotantes**: Esquina superior derecha
  - 🎯 **Lógica inteligente**: Aparece según necesidad (7/14 días)
  - 🎨 **4 tipos de alerta**: Warning, Urgent, Success, Info
  - ⚡ **Backup rápido**: Modal con opciones Local/Google Drive
  - 💤 **Snooze y dismiss**: Control de usuario avanzado
  - 🔄 **Portal rendering**: Z-index alto, fuera del DOM normal

---

## 🌐 CONTEXTS (Estado Global)

### **AuthContext.js - Gestión de Autenticación**
- **Estado Global**: Usuario, permisos, autenticación
- **Funciones**:
  - `login()`: Autenticar usuario
  - `logout()`: Cerrar sesión
  - `hasPermission()`: Verificar permisos
  - `canManageSystemSettings()`: Permisos específicos
- **Usuarios por Defecto**:
  - **Admin**: `admin/admin123` (28 permisos)
  - **Empleado**: `empleado/empleado123` (8 permisos)

### **CustomerContext.js - Gestión de Clientes**
- **Estado Global**: Lista de clientes, operaciones CRUD
- **Funciones**:
  - `addCustomer()`: Agregar cliente
  - `updateCustomer()`: Actualizar datos
  - `deleteCustomer()`: Eliminar cliente
  - `searchCustomers()`: Búsqueda avanzada

### **NotificationContext.js - Sistema de Notificaciones**
- **Estado Global**: Notificaciones toast
- **Funciones**:
  - `showSuccess()`: Notificación de éxito
  - `showError()`: Notificación de error
  - `showWarning()`: Notificación de advertencia

---

## 🪝 CUSTOM HOOKS

### **useAutoBackup.js - Sistema de Backup (481 líneas)**
- **Función**: Gestión completa de backups
- **Características**:
  - 🔄 **Backup automático**: Verificación periódica
  - ☁️ **Google Drive**: Integración OAuth2
  - 📊 **Estadísticas**: Métricas de backup
  - ⚙️ **Configuración**: Variables de entorno

### **useAccessibility.js - Accesibilidad**
- **Función**: Mejoras de accesibilidad WCAG 2.1 AA
- **Características**: Navegación por teclado, screen readers

### **usePWA.js - Progressive Web App**
- **Función**: Funcionalidades PWA
- **Características**: Instalación, offline, actualizaciones

### **useJsonImportExport.js - Import/Export**
- **Función**: Manejo de archivos JSON
- **Características**: Importación, exportación, validación

### **useBackupAlert.js - Sistema de Alertas de Backup (NUEVO)**
- **Función**: Gestión inteligente de alertas de backup
- **Características**:
  - 🧠 **Lógica inteligente**: Calcula cuándo mostrar alertas
  - ⏰ **Intervalos configurables**: 7 días warning, 14 días urgent
  - 💤 **Snooze y dismiss**: Persistencia de preferencias
  - 📊 **Estadísticas**: Días desde último backup
  - 🔄 **Auto-verificación**: Cada 30 minutos
  - ✅ **Alertas de éxito**: Feedback post-backup

---

## 🛠️ SERVICIOS Y UTILIDADES

### 📊 Servicios

#### **customerStore.js - Almacenamiento de Datos**
- **Función**: Gestión de datos de clientes
- **Características**: localStorage, PocketBase integration

#### **googleDriveBackup.js - Servicio Google Drive**
- **Función**: Integración con Google Drive API
- **Características**: OAuth2, upload, download, gestión de archivos

### 🔧 Utilidades

#### **permissions.simple.js - Sistema de Permisos (266 líneas)**
- **Función**: Control granular de acceso
- **Características**:
  - 28 permisos específicos
  - 2 roles (Admin/Empleado)
  - Verificadores avanzados
  - Estadísticas de permisos

#### **logic.js - Lógica de Negocio**
- **Función**: Funciones de negocio centralizadas
- **Características**: Generación de códigos, validaciones

#### **whatsapp.js - Integración WhatsApp**
- **Función**: Envío de tarjetas por WhatsApp
- **Características**: URLs personalizadas, templates

#### **errorHandler.js - Manejo de Errores (668 líneas)**
- **Función**: Sistema centralizado de errores
- **Características**: Logging, recovery, notificaciones

---

## 🧪 COMPONENTES DE TESTING

### Componentes de Prueba
- **TestErrorHandling.jsx**: Pruebas de manejo de errores
- **TestAsyncOperations.jsx**: Pruebas de operaciones asíncronas
- **TestNotifications.jsx**: Pruebas del sistema de notificaciones

### Tests Unitarios
- **CustomerContext.test.jsx**: Tests del contexto de clientes
- **CustomerForm.test.jsx**: Tests del formulario
- **Notification.test.jsx**: Tests de notificaciones

---

## 🎨 COMPONENTES COMUNES

### UI Components
- **Button.jsx**: Botón reutilizable con variantes
- **InputField.jsx**: Campo de entrada con validación
- **Notification.jsx**: Componente de notificación toast
- **DropdownMenu.jsx**: Menú desplegable
- **Navigation.jsx**: Barra de navegación principal

### Utilidades UI
- **ErrorBoundary.jsx**: Captura de errores React
- **AccessibilityPanel.jsx**: Panel de accesibilidad
- **InstallPWAButton.jsx**: Botón de instalación PWA
- **SkipNavigation.jsx**: Navegación para screen readers

---

## 🔄 FLUJO DE LA APLICACIÓN

```
App.js (Entrada) → Providers → ¿Autenticado?
    ↓ No                    ↓ Sí
LoginForm.jsx          MainApp.jsx
    ↓                       ↓
AuthContext.login()    Navigation.jsx + LoyaltyCardSystem.jsx
    ↓                       ↓
¿Válido? → MainApp.jsx     Rutas Protegidas (Reports, Settings, Analytics)
                           ↓
                      CustomerList/Details/Form
                           ↓
                      CustomerContext → localStorage → BackupManager
                           ↓
                      useAutoBackup → Google Drive API
```

---

## 📊 MÉTRICAS DEL PROYECTO

### 📈 Estadísticas de Código
- **Total de archivos**: 49 archivos fuente (+2 nuevos)
- **Componentes React**: 26+ componentes (+1 BackupFloatingAlert)
- **Custom Hooks**: 7 hooks especializados (+1 useBackupAlert)
- **Contexts**: 3 providers globales
- **Servicios**: 3 servicios principales
- **Utilidades**: 8+ funciones utilitarias

### 🎯 Funcionalidades Principales
1. **Sistema de Fidelización**: Gestión completa de tarjetas
2. **Autenticación Granular**: 28 permisos específicos
3. **Backup Automático**: Local + Google Drive
4. **Alertas Inteligentes**: Sistema flotante de backup (NUEVO)
5. **Reportes Avanzados**: Analytics y métricas
6. **PWA Completa**: Instalable y offline
7. **Accesibilidad**: WCAG 2.1 AA compliant

### 🔐 Sistema de Permisos
- **Admin**: 28 permisos (acceso completo)
- **Empleado**: 8 permisos (operaciones diarias)
- **Verificación**: Granular por función/ruta

---

## 🎯 RESUMEN EJECUTIVO

**ACRILCARD** es una **aplicación empresarial completa** de fidelización con:

- ✅ **Arquitectura modular** con separation of concerns
- ✅ **Estado global** gestionado con Context API
- ✅ **Sistema de permisos granular** (28 permisos específicos)
- ✅ **Backup automático** local y en la nube
- ✅ **Alertas inteligentes** flotantes para backup (NUEVO)
- ✅ **PWA completa** instalable y offline
- ✅ **Accesibilidad WCAG 2.1 AA** 
- ✅ **Testing comprehensivo** con componentes de prueba
- ✅ **Documentación empresarial** completa

**El proyecto está estructurado de manera profesional, con código limpio, optimizado y listo para producción.**

---

## 📚 DOCUMENTACIÓN RELACIONADA

- 📖 **[README.md](README.md)** - Guía principal del proyecto
- 🔧 **[GOOGLE_DRIVE_SETUP.md](GOOGLE_DRIVE_SETUP.md)** - Configuración de backup en la nube
- 📝 **[CHANGELOG.md](CHANGELOG.md)** - Historial de versiones y cambios
- 🚀 **[DEPLOY_README.md](DEPLOY_README.md)** - Guía de despliegue
- 🔐 **[AUTH_README.md](AUTH_README.md)** - Sistema de autenticación

---

**Desarrollado con ❤️ para ACRIL Pinturas - © 2025**

*Mapa del proyecto actualizado: Septiembre 2025 - Versión 1.4.0 con Sistema de Alertas Inteligentes*
