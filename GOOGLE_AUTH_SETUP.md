# 🔐 Configuración de Inicio de Sesión con Google

## 📋 Resumen

ACRILCARD ahora soporta inicio de sesión con Google OAuth 2.0, permitiendo a los usuarios autenticarse usando sus cuentas de Google y obtener acceso automático a Google Drive para backups en la nube.

---

## 🚀 Características Implementadas

### ✅ Login con Google
- **Autenticación OAuth 2.0** usando Google Identity Services
- **Permisos de administrador** automáticos para usuarios de Google
- **Sincronización automática** con Google Drive
- **Sesión persistente** guardada en localStorage
- **Cierre de sesión** integrado con Google

### ✅ Integración con Sistema Existente
- Compatible con login tradicional (usuario/contraseña)
- Mismo sistema de permisos granulares
- Acceso completo a todas las funcionalidades
- Backup automático en Google Drive

---

## 🔧 Configuración Paso a Paso

### 1️⃣ Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Nombra tu proyecto: **"ACRILCARD"**

### 2️⃣ Habilitar APIs Necesarias

1. En el menú lateral, ve a **"APIs y servicios" → "Biblioteca"**
2. Busca y habilita las siguientes APIs:
   - ✅ **Google Drive API**
   - ✅ **Google+ API** (para obtener información del usuario)

### 3️⃣ Configurar Pantalla de Consentimiento OAuth

1. Ve a **"APIs y servicios" → "Pantalla de consentimiento de OAuth"**
2. Selecciona **"Externo"** (o "Interno" si tienes Google Workspace)
3. Completa la información:
   - **Nombre de la aplicación:** ACRILCARD
   - **Correo de soporte:** tu-email@ejemplo.com
   - **Logotipo:** (opcional)
   - **Dominios autorizados:** tu-dominio.com
   - **Correo de contacto del desarrollador:** tu-email@ejemplo.com

4. En **"Permisos"**, agrega los siguientes scopes:
   ```
   https://www.googleapis.com/auth/userinfo.profile
   https://www.googleapis.com/auth/userinfo.email
   https://www.googleapis.com/auth/drive.file
   ```

5. Guarda y continúa

### 4️⃣ Crear Credenciales OAuth 2.0

1. Ve a **"APIs y servicios" → "Credenciales"**
2. Clic en **"+ CREAR CREDENCIALES" → "ID de cliente de OAuth 2.0"**
3. Selecciona **"Aplicación web"**
4. Configura:
   - **Nombre:** ACRILCARD Web Client
   - **Orígenes de JavaScript autorizados:**
     ```
     http://localhost:3000
     https://tu-dominio.com
     https://tu-app.netlify.app
     ```
   - **URIs de redirección autorizados:**
     ```
     http://localhost:3000
     https://tu-dominio.com
     https://tu-app.netlify.app
     ```

5. Clic en **"CREAR"**
6. **GUARDA** el **Client ID** que aparece

### 5️⃣ Configurar Variables de Entorno

Edita tu archivo `.env` y agrega:

```env
# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=tu-client-id-aqui.apps.googleusercontent.com
```

**Ejemplo:**
```env
REACT_APP_GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

### 6️⃣ Reiniciar la Aplicación

```bash
npm start
```

---

## 🎯 Cómo Usar

### Para Usuarios

1. **Abrir la aplicación** en el navegador
2. En la pantalla de login, hacer clic en **"Continuar con Google"**
3. **Seleccionar tu cuenta de Google** en la ventana emergente
4. **Autorizar los permisos** solicitados
5. ¡Listo! Serás redirigido automáticamente al dashboard

### Permisos Solicitados

- ✅ **Ver tu información básica de perfil** (nombre, foto)
- ✅ **Ver tu dirección de correo electrónico**
- ✅ **Acceso a Google Drive** (solo archivos creados por ACRILCARD)

---

## 🔒 Seguridad y Privacidad

### Datos Almacenados Localmente

- Email del usuario
- Nombre completo
- Foto de perfil
- Token de acceso (encriptado)
- Fecha de expiración del token

### Datos NO Almacenados

- ❌ Contraseña de Google
- ❌ Información sensible de la cuenta
- ❌ Acceso a otros archivos de Drive

### Políticas de Seguridad

- **Tokens de acceso** se almacenan de forma segura
- **Sesiones expiran** automáticamente
- **Logout completo** revoca todos los permisos
- **Comunicación HTTPS** obligatoria en producción

---

## 🧪 Modo de Desarrollo

### Testing Local

Para probar en desarrollo sin configurar Google OAuth:

1. Usa las credenciales tradicionales:
   - **Admin:** Acrilgroup / ACRILCARD2025
   - **Empleado:** empleado / empleado123

2. El botón de Google mostrará un error si no está configurado

### Variables de Entorno de Desarrollo

```env
# .env.development
REACT_APP_GOOGLE_CLIENT_ID=tu-client-id-desarrollo
```

---

## 🐛 Solución de Problemas

### Error: "Google Client ID no configurado"

**Causa:** Falta la variable de entorno
**Solución:** 
1. Verifica que `.env` tenga `REACT_APP_GOOGLE_CLIENT_ID`
2. Reinicia el servidor de desarrollo

### Error: "redirect_uri_mismatch"

**Causa:** La URL actual no está en las URIs autorizadas
**Solución:**
1. Ve a Google Cloud Console → Credenciales
2. Edita el OAuth Client ID
3. Agrega la URL actual a "URIs de redirección autorizados"

### Error: "access_denied"

**Causa:** Usuario canceló la autorización o no tiene permisos
**Solución:**
1. Intenta nuevamente
2. Verifica que la pantalla de consentimiento esté publicada
3. Asegúrate de que el usuario tenga una cuenta de Google válida

### El botón de Google no aparece

**Causa:** Script de Google no se cargó
**Solución:**
1. Verifica tu conexión a internet
2. Revisa la consola del navegador (F12)
3. Limpia caché y recarga

---

## 📊 Flujo de Autenticación

```
Usuario → Clic "Continuar con Google"
    ↓
Google Identity Services → Ventana de autorización
    ↓
Usuario autoriza → Google devuelve token
    ↓
ACRILCARD obtiene info del usuario
    ↓
Crea sesión con permisos de Admin
    ↓
Guarda en localStorage
    ↓
Redirige al Dashboard
```

---

## 🔄 Sincronización con Google Drive

Una vez autenticado con Google:

1. **Backup automático** se sincroniza con Drive
2. **Acceso desde cualquier dispositivo** con la misma cuenta
3. **Restauración automática** de datos
4. **Historial de versiones** en Drive

---

## 📝 Notas Importantes

### Límites de Google

- **Cuota diaria:** 10,000 solicitudes por día (suficiente para uso normal)
- **Almacenamiento:** 15 GB gratuitos en Google Drive
- **Usuarios de prueba:** Máximo 100 en modo desarrollo

### Producción

Para publicar la aplicación:

1. **Verificar el dominio** en Google Cloud Console
2. **Solicitar verificación** de la aplicación (si es necesario)
3. **Publicar la pantalla de consentimiento**
4. **Configurar políticas de privacidad** y términos de servicio

---

## 🆘 Soporte

Si tienes problemas con la configuración:

1. Revisa la consola del navegador (F12)
2. Verifica los logs del servidor
3. Consulta la [documentación oficial de Google](https://developers.google.com/identity/protocols/oauth2)
4. Contacta al equipo de desarrollo

---

## 📚 Referencias

- [Google Identity Services](https://developers.google.com/identity/gsi/web)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Google Drive API](https://developers.google.com/drive/api/v3/about-sdk)

---

**Última actualización:** Octubre 2025  
**Versión:** 1.0.0  
**Autor:** Equipo ACRILCARD
