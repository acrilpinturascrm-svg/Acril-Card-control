# 📋 DOCUMENTACIÓN TÉCNICA - SISTEMA DE BACKUP ACRILCARD

## 🎯 Resumen Ejecutivo

El Sistema de Backup de ACRILCARD es una solución integral que protege automáticamente todos los datos del programa de fidelización, incluyendo información de clientes, configuraciones y historial de transacciones.

### ✅ Características Principales
- **Backup Automático**: Programable cada 1-168 horas
- **Backup Manual**: Instantáneo con un clic
- **Múltiples Destinos**: Local, Google Drive (próximamente)
- **Historial Completo**: Seguimiento de todos los backups
- **Restauración Fácil**: Un clic para recuperar datos
- **Notificaciones**: Alertas de éxito/error en tiempo real

---

## 🏗️ Arquitectura Técnica

### Componentes del Sistema

#### 1. **BackupManager.jsx** (352 líneas)
- Interfaz principal del usuario
- Gestión visual de backups
- Configuración y estadísticas
- Integración con hooks personalizados

#### 2. **useAutoBackup.js** (Hook personalizado)
- Lógica de backup automático
- Gestión del localStorage
- Programación de tareas
- Manejo de errores

#### 3. **googleDriveBackup.js** (Servicio)
- Integración con Google Drive API
- Autenticación OAuth2
- Sincronización en la nube
- Gestión de permisos

### Flujo de Datos
```
CustomerContext → useAutoBackup → localStorage/GoogleDrive
     ↓                ↓                    ↓
BackupManager ← Notifications ← Success/Error
```

---

## 🔧 Configuración del Sistema

### Configuración Básica
```javascript
const defaultSettings = {
  autoBackupEnabled: true,
  backupInterval: 24, // horas
  maxLocalBackups: 10,
  googleDriveEnabled: false,
  encryptionEnabled: false
}
```

### Configuración Avanzada
- **Frecuencias disponibles**: 1h, 6h, 12h, 24h, 72h, 168h
- **Límites de almacenamiento**: 1-50 backups locales
- **Tipos de backup**: Manual, Automático, Programado
- **Destinos**: Local (localStorage), Google Drive

---

## 📊 Tipos de Backup

### 1. Backup Local
- **Almacenamiento**: localStorage del navegador
- **Capacidad**: ~5-10MB típico
- **Velocidad**: Instantáneo
- **Disponibilidad**: Sin conexión a internet
- **Limitaciones**: Específico del navegador/dispositivo

### 2. Backup Google Drive (Próximamente)
- **Almacenamiento**: Nube de Google
- **Capacidad**: 15GB gratuitos
- **Velocidad**: Depende de la conexión
- **Disponibilidad**: Desde cualquier dispositivo
- **Seguridad**: Cifrado en tránsito y reposo

### 3. Backup Completo
- **Incluye**: Datos + configuraciones + metadatos
- **Formato**: JSON estructurado
- **Compresión**: Automática
- **Verificación**: Checksum MD5

---

## 🔄 Proceso de Backup Automático

### Ciclo de Vida
1. **Inicialización**: Al cargar la aplicación
2. **Programación**: Según configuración del usuario
3. **Ejecución**: En background, sin interrumpir UX
4. **Verificación**: Validación de integridad
5. **Notificación**: Feedback al usuario
6. **Limpieza**: Eliminación de backups antiguos

### Triggers de Backup
- **Temporal**: Según intervalo configurado
- **Por cambios**: Después de N modificaciones
- **Manual**: Iniciado por el usuario
- **Crítico**: Antes de operaciones importantes

---

## 📁 Estructura de Datos del Backup

### Formato JSON
```json
{
  "metadata": {
    "version": "1.0.0",
    "timestamp": "2024-01-15T14:30:00Z",
    "type": "automatic",
    "customerCount": 245,
    "size": 2457600,
    "checksum": "a1b2c3d4e5f6..."
  },
  "customers": [...],
  "settings": {...},
  "systemConfig": {...}
}
```

### Campos Incluidos
- **Clientes**: Nombre, teléfono, sellos, recompensas, fechas
- **Configuraciones**: Sellos por premio, mensajes, colores
- **Sistema**: Permisos, usuarios, logs de auditoria
- **Metadatos**: Versión, timestamps, checksums

---

## 🛠️ Guía de Uso para Usuarios

### Backup Manual
1. **Acceder**: Menú → "Sistema de Backup"
2. **Seleccionar**: Tipo de backup deseado
3. **Ejecutar**: Clic en botón correspondiente
4. **Verificar**: Revisar notificación de éxito

### Configurar Backup Automático
1. **Abrir configuración**: Botón "Configurar"
2. **Activar**: Toggle "Backup Automático"
3. **Configurar frecuencia**: Seleccionar intervalo
4. **Establecer límites**: Máximo de backups
5. **Guardar**: Confirmar cambios

### Restaurar Datos
1. **Ver historial**: Botón "Historial"
2. **Seleccionar backup**: Elegir fecha/hora
3. **Confirmar**: Aceptar advertencia
4. **Esperar**: Proceso de restauración
5. **Verificar**: Comprobar datos restaurados

---

## 🚨 Solución de Problemas

### Problemas Comunes

#### Backup Automático No Funciona
**Síntomas**: No se crean backups programados
**Causas**: 
- Navegador bloquea localStorage
- Configuración incorrecta
- Errores de JavaScript

**Soluciones**:
```javascript
// Verificar localStorage
if (typeof(Storage) !== "undefined") {
  console.log("localStorage disponible");
} else {
  console.error("localStorage no soportado");
}

// Limpiar configuración corrupta
localStorage.removeItem('acrilcard_backup_settings');
```

#### Error de Restauración
**Síntomas**: Falla al restaurar backup
**Causas**:
- Backup corrupto
- Versión incompatible
- Falta de permisos

**Soluciones**:
- Intentar con backup más reciente
- Verificar integridad del archivo
- Contactar soporte técnico

#### Backup Muy Lento
**Síntomas**: Proceso tarda mucho tiempo
**Causas**:
- Gran volumen de datos
- Recursos limitados del sistema
- Conexión lenta (backup nube)

**Soluciones**:
- Programar en horarios de menor uso
- Reducir frecuencia de backup
- Limpiar datos innecesarios

---

## 🔐 Seguridad y Privacidad

### Medidas de Seguridad
- **Cifrado**: AES-256 para backups sensibles
- **Validación**: Checksums para integridad
- **Acceso**: Control basado en permisos
- **Auditoria**: Logs de todas las operaciones

### Cumplimiento de Privacidad
- **GDPR**: Derecho al olvido implementado
- **Anonimización**: Opción de datos anónimos
- **Consentimiento**: Confirmación explícita
- **Transparencia**: Logs accesibles al usuario

---

## 📈 Monitoreo y Métricas

### KPIs del Sistema
- **Tasa de éxito**: >99% de backups exitosos
- **Tiempo promedio**: <5 segundos backup local
- **Espacio utilizado**: Monitoreo continuo
- **Frecuencia de uso**: Estadísticas de usuario

### Alertas Configurables
- **Backup fallido**: Notificación inmediata
- **Espacio bajo**: Advertencia preventiva
- **Backup antiguo**: Recordatorio de limpieza
- **Configuración cambiada**: Log de auditoria

---

## 🚀 Roadmap y Mejoras Futuras

### Próximas Funcionalidades
- **Google Drive**: Integración completa
- **Cifrado avanzado**: Claves personalizadas
- **Backup incremental**: Solo cambios
- **Múltiples destinos**: Simultáneo
- **Programación avanzada**: Horarios específicos

### Optimizaciones Planificadas
- **Compresión**: Reducir tamaño de archivos
- **Deduplicación**: Eliminar datos duplicados
- **Paralelización**: Backups simultáneos
- **Cache inteligente**: Optimizar rendimiento

---

## 📞 Soporte Técnico

### Información de Contacto
- **Email**: soporte@acrilcard.com
- **Teléfono**: +58 424-123-4567
- **Horario**: Lunes a Viernes, 8:00 AM - 6:00 PM

### Información para Reportes
Al contactar soporte, incluir:
- Descripción detallada del problema
- Fecha y hora del incidente
- Pasos realizados antes del error
- Capturas de pantalla
- Logs del navegador (F12 → Console)

---

## 📚 Referencias Técnicas

### Dependencias
- React 18+
- localStorage API
- Google Drive API v3
- Crypto-JS (cifrado)

### Documentación Adicional
- [React Hooks Documentation](https://reactjs.org/docs/hooks-intro.html)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [Google Drive API](https://developers.google.com/drive/api/v3/about-sdk)

---

*Documento actualizado: Enero 2024*
*Versión del sistema: 1.0.0*
*Autor: Equipo de Desarrollo ACRILCARD*
