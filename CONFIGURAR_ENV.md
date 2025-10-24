# 🔧 CONFIGURACIÓN DEL ARCHIVO .env

## ⚠️ IMPORTANTE: Debes crear tu archivo .env

El archivo `.env` está en `.gitignore` por seguridad (no se sube a Git). Debes crearlo manualmente.

---

## 📝 PASO 1: Crear el archivo .env

En la raíz del proyecto, crea un archivo llamado `.env` (sin extensión, solo `.env`)

---

## 📋 PASO 2: Copiar esta plantilla

Copia y pega el siguiente contenido en tu archivo `.env`:

```bash
# ========================================
# CONFIGURACIÓN ACRILCARD - DESARROLLO
# ========================================

# URL base de la aplicación
REACT_APP_PUBLIC_BASE_URL=http://localhost:3000

# Entorno
REACT_APP_ENVIRONMENT=development

# PWA
REACT_APP_PWA_ENABLED=true

# WhatsApp
REACT_APP_WHATSAPP_ENABLED=true
REACT_APP_WHATSAPP_COUNTRY_CODE=58

# Seguridad
REACT_APP_SECURE_COOKIES=false

# Logs
REACT_APP_LOG_LEVEL=info

# ========================================
# GOOGLE DRIVE API - BACKUP EN LA NUBE
# ========================================

# ⚠️ DEBES CONFIGURAR ESTAS CREDENCIALES
# Sigue la guía en: GOOGLE_DRIVE_SETUP.md

REACT_APP_GOOGLE_CLIENT_ID=TU_CLIENT_ID_AQUI.apps.googleusercontent.com
REACT_APP_GOOGLE_API_KEY=TU_API_KEY_AQUI

# Habilitar Google Drive (cambiar a true cuando tengas las credenciales)
REACT_APP_GOOGLE_DRIVE_ENABLED=false

# ========================================
# SISTEMA DE BACKUP
# ========================================

# Backup automático
REACT_APP_AUTO_BACKUP=true
REACT_APP_BACKUP_INTERVAL=24
REACT_APP_MAX_LOCAL_BACKUPS=10

# Backup habilitado
REACT_APP_BACKUP_ENABLED=true

# ========================================
# CACHE
# ========================================

REACT_APP_CACHE_VERSION=1.0.0

# ========================================
# DEBUG (solo desarrollo)
# ========================================

REACT_APP_DEBUG_MODE=true
```

---

## 🔑 PASO 3: Configurar Google Drive (OPCIONAL)

Si quieres habilitar el backup en Google Drive:

1. **Lee la guía completa**: `GOOGLE_DRIVE_SETUP.md`
2. **Obtén tus credenciales** en [Google Cloud Console](https://console.cloud.google.com/)
3. **Reemplaza** `TU_CLIENT_ID_AQUI` y `TU_API_KEY_AQUI` con tus credenciales reales
4. **Cambia** `REACT_APP_GOOGLE_DRIVE_ENABLED=false` a `true`

---

## ✅ PASO 4: Reiniciar el servidor

Después de crear/modificar el `.env`, **DEBES reiniciar el servidor**:

```bash
# Detener el servidor (Ctrl+C)
# Luego iniciar de nuevo:
npm start
```

---

## 🚀 CONFIGURACIÓN RÁPIDA (Sin Google Drive)

Si solo quieres usar backup local (sin Google Drive), usa esta configuración mínima:

```bash
# Configuración mínima para desarrollo
REACT_APP_PUBLIC_BASE_URL=http://localhost:3000
REACT_APP_ENVIRONMENT=development
REACT_APP_PWA_ENABLED=true
REACT_APP_WHATSAPP_ENABLED=true
REACT_APP_WHATSAPP_COUNTRY_CODE=58
REACT_APP_AUTO_BACKUP=true
REACT_APP_BACKUP_INTERVAL=24
REACT_APP_MAX_LOCAL_BACKUPS=10
REACT_APP_GOOGLE_DRIVE_ENABLED=false
REACT_APP_DEBUG_MODE=true
```

---

## 🔍 VERIFICAR QUE FUNCIONA

1. Inicia el servidor: `npm start`
2. Abre la consola del navegador (F12)
3. Busca mensajes como:
   - ✅ "Google Drive no está habilitado" (si GOOGLE_DRIVE_ENABLED=false)
   - ✅ "Iniciando inicialización de Google Drive API..." (si GOOGLE_DRIVE_ENABLED=true)

---

## ❓ PREGUNTAS FRECUENTES

### ¿Dónde creo el archivo .env?
En la raíz del proyecto, al mismo nivel que `package.json`

### ¿Puedo usar la app sin Google Drive?
Sí, solo deja `REACT_APP_GOOGLE_DRIVE_ENABLED=false`

### ¿Cómo obtengo las credenciales de Google?
Lee la guía completa en `GOOGLE_DRIVE_SETUP.md`

### ¿Por qué no veo cambios después de modificar .env?
Debes reiniciar el servidor con `npm start`

---

## 📞 SOPORTE

Si tienes problemas:
1. Verifica que el archivo se llame exactamente `.env` (sin extensión)
2. Verifica que esté en la raíz del proyecto
3. Reinicia el servidor después de cualquier cambio
4. Revisa la consola del navegador (F12) para errores

---

**¡Listo! Tu aplicación ya está configurada correctamente.** 🎉
