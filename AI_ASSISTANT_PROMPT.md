# AI Assistant Prompt - ACRILCARD Project

## Contexto del Proyecto
Sistema empresarial de fidelización de clientes desarrollado con React 18, TailwindCSS y Material-UI. Incluye autenticación con roles granulares, backup en Google Drive, PWA completa y sistema de reportes avanzados.

## Stack Tecnológico
- React 18.2.0 + React Router 6.28.5
- TailwindCSS + Material-UI
- Context API para estado global
- Google Drive API para backups
- Lucide React para iconos
- PWA con Service Workers

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
- **CustomerContext**: Para operaciones CRUD de clientes
- **AuthContext**: Para autenticación y permisos
- **NotificationContext**: Para mensajes al usuario
- **LocalStorage**: Persistencia automática de datos críticos

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

### 9. Backup y Persistencia
- **Auto-backup**: Cada 24 horas por defecto
- **Google Drive**: Integración completa con OAuth
- **LocalStorage**: Backup local automático
- **Versionado**: Timestamps en nombres de archivos

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
│   └── [Feature].jsx   # Componentes específicos
├── contexts/           # Context API providers
├── hooks/              # Custom hooks
├── services/           # Servicios externos (Google Drive, etc.)
├── utils/              # Utilidades y helpers
├── pages/              # Páginas completas
├── App.js              # Router principal
├── MainApp.jsx         # App protegida
└── index.js            # Entry point
```

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
1. **Context primero**: Usar contextos existentes
2. **LocalStorage**: Persistir cambios críticos
3. **Notificaciones**: Feedback al usuario
4. **Validación**: Antes de actualizar estado

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
# Google Drive API
REACT_APP_GOOGLE_CLIENT_ID=
REACT_APP_GOOGLE_API_KEY=
REACT_APP_GOOGLE_CLIENT_SECRET=

# Configuración
REACT_APP_STAMPS_PER_REWARD=10
REACT_APP_AUTO_BACKUP_ENABLED=true
REACT_APP_BACKUP_INTERVAL_HOURS=24
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

- **Documentación de permisos**: `utils/permissions.simple.js`
- **Sistema de backup**: `DOCUMENTACION_BACKUP.md`
- **Configuración Google Drive**: `GOOGLE_DRIVE_SETUP.md`
- **Guía de inicio rápido**: `QUICK_START.md`
- **Mapa del proyecto**: `PROJECT_MAP.md`

## Notas Importantes

1. **No eliminar funcionalidades existentes** sin consultar
2. **Mantener compatibilidad** con versiones anteriores de datos
3. **Probar en móvil** antes de considerar completo
4. **Backup antes de cambios grandes** en estructura de datos
5. **Documentar decisiones técnicas** importantes
6. **NUNCA commitear credenciales** - Usar siempre variables de entorno

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

**Última actualización**: Octubre 2025
**Versión del proyecto**: 1.0.0
**Mantenedor**: ACRIL Pinturas
