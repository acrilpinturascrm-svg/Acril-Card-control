# 🔧 CONFIGURACIÓN DE GOOGLE DRIVE API - ACRILCARD

## 📋 Guía Paso a Paso para Habilitar Backup en Google Drive

### 🎯 **¿Qué necesitas hacer?**

Para habilitar el backup automático en Google Drive, necesitas configurar las credenciales de la API de Google Drive. Este proceso toma aproximadamente **10-15 minutos**.

---

## 🚀 **PASO 1: Crear Proyecto en Google Cloud Console**

### 1.1 Acceder a Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Acepta los términos de servicio si es la primera vez

### 1.2 Crear Nuevo Proyecto
1. Haz clic en el selector de proyectos (parte superior)
2. Clic en **"Nuevo Proyecto"**
3. Nombre del proyecto: `ACRILCARD-Backup`
4. Clic en **"Crear"**
5. Espera a que se cree el proyecto (1-2 minutos)

---

## 🔑 **PASO 2: Habilitar Google Drive API**

### 2.1 Activar la API
1. En el menú lateral, ve a **"APIs y servicios" > "Biblioteca"**
2. Busca: `Google Drive API`
3. Clic en **"Google Drive API"**
4. Clic en **"HABILITAR"**
5. Espera a que se active (30 segundos)

### 2.2 Verificar Activación
- Verás un mensaje: "API habilitada"
- En el dashboard aparecerá "Google Drive API" como activa

---

## 🛡️ **PASO 3: Crear Credenciales OAuth2**

### 3.1 Configurar Pantalla de Consentimiento
1. Ve a **"APIs y servicios" > "Pantalla de consentimiento de OAuth"**
2. Selecciona **"Externo"** (para uso personal)
3. Clic en **"CREAR"**

#### Información de la aplicación:
- **Nombre de la aplicación**: `ACRILCARD Sistema de Backup`
- **Correo de soporte del usuario**: Tu email
- **Logotipo**: (Opcional) Puedes subir el logo de ACRILCARD
- **Dominios autorizados**: Deja en blanco por ahora
- **Correo del desarrollador**: Tu email

4. Clic en **"GUARDAR Y CONTINUAR"**
5. En "Alcances": Clic en **"GUARDAR Y CONTINUAR"** (sin agregar nada)
6. En "Usuarios de prueba": Agrega tu email
7. Clic en **"GUARDAR Y CONTINUAR"**

### 3.2 Crear Credenciales OAuth2
1. Ve a **"APIs y servicios" > "Credenciales"**
2. Clic en **"+ CREAR CREDENCIALES"**
3. Selecciona **"ID de cliente de OAuth 2.0"**

#### Configuración del Cliente:
- **Tipo de aplicación**: `Aplicación web`
- **Nombre**: `ACRILCARD Web Client`
- **Orígenes de JavaScript autorizados**:
  - Para desarrollo: `http://localhost:3000`
  - Para producción: `https://tu-dominio.netlify.app` (reemplaza con tu dominio real)
- **URI de redirección autorizados**:
  - Para desarrollo: `http://localhost:3000`
  - Para producción: `https://tu-dominio.netlify.app`

4. Clic en **"CREAR"**

### 3.3 Obtener las Credenciales
Después de crear, verás un modal con:
- **ID de cliente**: `123456789-abcdef.apps.googleusercontent.com`
- **Secreto del cliente**: `ABCDEF-123456` (no lo necesitas para frontend)

**¡IMPORTANTE!** Copia el **ID de cliente** completo.

---

## 🔐 **PASO 4: Crear API Key**

### 4.1 Generar API Key
1. En **"Credenciales"**, clic en **"+ CREAR CREDENCIALES"**
2. Selecciona **"Clave de API"**
3. Se generará automáticamente una clave como: `AIzaSyABC123DEF456GHI789JKL`

### 4.2 Restringir la API Key (Recomendado)
1. Clic en el ícono de lápiz junto a la API Key
2. En **"Restricciones de API"**:
   - Selecciona **"Restringir clave"**
   - Marca **"Google Drive API"**
3. Clic en **"GUARDAR"**

---

## ⚙️ **PASO 5: Configurar Variables de Entorno**

### 5.1 Crear archivo .env
En la raíz de tu proyecto ACRILCARD, crea un archivo `.env` con:

```bash
# Google Drive API Credentials
REACT_APP_GOOGLE_CLIENT_ID=TU_CLIENT_ID_AQUI.apps.googleusercontent.com
REACT_APP_GOOGLE_API_KEY=TU_API_KEY_AQUI

# Habilitar Google Drive
REACT_APP_GOOGLE_DRIVE_ENABLED=true
REACT_APP_AUTO_BACKUP=true
REACT_APP_BACKUP_INTERVAL=24
REACT_APP_MAX_LOCAL_BACKUPS=10
```

### 5.2 Ejemplo Real
```bash
# Ejemplo (NO uses estos valores reales)
REACT_APP_GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
REACT_APP_GOOGLE_API_KEY=AIzaSyABCDEF123456789GHIJKLMNOPQRSTUVWXYz

REACT_APP_GOOGLE_DRIVE_ENABLED=true
REACT_APP_AUTO_BACKUP=true
REACT_APP_BACKUP_INTERVAL=24
REACT_APP_MAX_LOCAL_BACKUPS=10
```

---

## 🧪 **PASO 6: Probar la Configuración**

### 6.1 Reiniciar el Servidor
```bash
npm start
```

### 6.2 Verificar en la Aplicación
1. Ve al **Sistema de Backup**
2. Verifica que aparezca el panel de **"Estado de Google Drive"**
3. Clic en **"Iniciar Sesión"**
4. Debería aparecer el popup de Google OAuth
5. Autoriza la aplicación
6. Verás tu nombre y email en el panel

### 6.3 Probar Backup
1. Clic en **"Backup Google Drive"**
2. Debería subir el archivo a tu Google Drive
3. Ve a [Google Drive](https://drive.google.com)
4. Busca la carpeta **"ACRILCARD_Backups"**
5. Verifica que el archivo esté ahí

---

## 🚨 **Solución de Problemas Comunes**

### Error: "redirect_uri_mismatch"
**Causa**: La URL no está autorizada en las credenciales
**Solución**: 
1. Ve a Google Cloud Console > Credenciales
2. Edita el cliente OAuth2
3. Agrega la URL exacta en "Orígenes autorizados"

### Error: "API key not valid"
**Causa**: La API Key está mal configurada
**Solución**:
1. Verifica que la API Key esté correcta en el .env
2. Asegúrate de que Google Drive API esté habilitada para esa key

### Error: "Access blocked"
**Causa**: La aplicación no está verificada por Google
**Solución**:
1. En desarrollo, clic en "Avanzado" > "Ir a ACRILCARD (no seguro)"
2. Para producción, considera verificar la aplicación

### No aparece el panel de Google Drive
**Causa**: Variables de entorno mal configuradas
**Solución**:
1. Verifica que `REACT_APP_GOOGLE_DRIVE_ENABLED=true`
2. Reinicia el servidor: `npm start`
3. Verifica en consola del navegador si hay errores

---

## 📊 **Verificación Final**

### ✅ Checklist de Configuración Completa
- [ ] Proyecto creado en Google Cloud Console
- [ ] Google Drive API habilitada
- [ ] Pantalla de consentimiento configurada
- [ ] Cliente OAuth2 creado con URLs correctas
- [ ] API Key generada y restringida
- [ ] Variables de entorno configuradas en .env
- [ ] Servidor reiniciado
- [ ] Panel de Google Drive aparece en la app
- [ ] Login con Google funciona
- [ ] Backup a Google Drive exitoso
- [ ] Archivo aparece en Google Drive

---

## 🎉 **¡Configuración Completada!**

Una vez completados todos los pasos, tendrás:

✅ **Backup automático en Google Drive**
✅ **Sincronización entre dispositivos**
✅ **Protección de datos en la nube**
✅ **Acceso desde cualquier lugar**

### 📱 **Próximos Pasos**
1. Configura el backup automático cada 24 horas
2. Prueba restaurar desde un backup de Google Drive
3. Comparte acceso con tu equipo si es necesario

---

## 📞 **¿Necesitas Ayuda?**

Si tienes problemas con la configuración:

1. **Revisa la consola del navegador** (F12) para errores
2. **Verifica las URLs** en las credenciales OAuth2
3. **Confirma las variables de entorno** en el archivo .env
4. **Reinicia el servidor** después de cambios

### Contacto de Soporte
- **Email**: soporte@acrilcard.com
- **Documentación**: Revisa `DOCUMENTACION_BACKUP.md`

---

**¡Tu sistema de backup está ahora completamente configurado y listo para proteger todos tus datos de clientes!** 🚀

*Última actualización: Septiembre 2024*
