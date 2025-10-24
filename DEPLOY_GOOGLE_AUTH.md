# 🚀 Configurar Google Auth en Producción

## ⚠️ Error Común

```
Error: Google Drive initialization failed: Google Drive credentials not configured.
Please set REACT_APP_GOOGLE_CLIENT_ID and REACT_APP_GOOGLE_API_KEY in your .env file
```

Este error aparece porque las variables de entorno de Google no están configuradas en tu plataforma de despliegue.

---

## 📋 Pasos para Solucionar

### 1️⃣ Obtener Credenciales de Google

Si aún no las tienes, sigue estos pasos:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto "ACRILCARD" (o créalo)
3. Ve a **"APIs y servicios" → "Credenciales"**
4. Copia tu **Client ID** y **API Key**

**Formato del Client ID:**
```
123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

**Formato del API Key:**
```
AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
```

---

### 2️⃣ Configurar en Netlify

#### Opción A: Desde el Dashboard (Recomendado) ✅

1. **Ir a Netlify:**
   - https://app.netlify.com/

2. **Seleccionar tu sitio:**
   - Busca "acrilcard" en tus sitios

3. **Ir a configuración:**
   - Clic en **"Site settings"**
   - En el menú lateral: **"Environment variables"**

4. **Agregar variables:**
   
   **Variable 1:**
   ```
   Key: REACT_APP_GOOGLE_CLIENT_ID
   Value: [pega-tu-client-id-aqui].apps.googleusercontent.com
   ```
   
   **Variable 2:**
   ```
   Key: REACT_APP_GOOGLE_API_KEY
   Value: [pega-tu-api-key-aqui]
   ```

5. **Guardar y redeploy:**
   - Las variables se guardan automáticamente
   - Ve a **"Deploys"** → **"Trigger deploy"** → **"Deploy site"**
   - Espera 2-3 minutos a que termine el deploy

#### Opción B: Desde Netlify CLI

```bash
# Instalar Netlify CLI (si no lo tienes)
npm install -g netlify-cli

# Login
netlify login

# Configurar variables
netlify env:set REACT_APP_GOOGLE_CLIENT_ID "tu-client-id.apps.googleusercontent.com"
netlify env:set REACT_APP_GOOGLE_API_KEY "tu-api-key"

# Redeploy
netlify deploy --prod
```

---

### 3️⃣ Configurar en Vercel

Si usas Vercel en lugar de Netlify:

1. **Ir a Vercel:**
   - https://vercel.com/dashboard

2. **Seleccionar tu proyecto:**
   - Busca "acrilcard"

3. **Ir a Settings:**
   - Clic en **"Settings"**
   - En el menú lateral: **"Environment Variables"**

4. **Agregar variables:**
   
   **Variable 1:**
   ```
   Name: REACT_APP_GOOGLE_CLIENT_ID
   Value: [tu-client-id].apps.googleusercontent.com
   Environment: Production, Preview, Development
   ```
   
   **Variable 2:**
   ```
   Name: REACT_APP_GOOGLE_API_KEY
   Value: [tu-api-key]
   Environment: Production, Preview, Development
   ```

5. **Redeploy:**
   - Ve a **"Deployments"**
   - Clic en los tres puntos del último deploy
   - **"Redeploy"**

---

### 4️⃣ Configurar URIs Autorizadas en Google

**IMPORTANTE:** Debes agregar tu dominio de producción a Google Cloud Console.

1. **Ve a Google Cloud Console:**
   - https://console.cloud.google.com/

2. **Ve a Credenciales:**
   - APIs y servicios → Credenciales
   - Clic en tu OAuth 2.0 Client ID

3. **Agregar URIs autorizadas:**
   
   **Orígenes de JavaScript autorizados:**
   ```
   https://acrilcard.netlify.app
   ```
   O si usas Vercel:
   ```
   https://acrilcard.vercel.app
   ```

   **URIs de redirección autorizados:**
   ```
   https://acrilcard.netlify.app
   ```

4. **Guardar cambios**

---

## ✅ Verificar que Funciona

1. **Espera a que termine el deploy** (2-3 minutos)

2. **Abre tu aplicación:**
   - https://acrilcard.netlify.app (o tu dominio)

3. **Prueba el login:**
   - Clic en **"Continuar con Google"**
   - Debería abrir la ventana de Google
   - Selecciona tu cuenta
   - Autoriza los permisos
   - ¡Deberías estar dentro!

---

## 🐛 Solución de Problemas

### Error: "redirect_uri_mismatch"

**Causa:** Tu dominio no está en las URIs autorizadas de Google

**Solución:**
1. Ve a Google Cloud Console → Credenciales
2. Edita tu OAuth Client ID
3. Agrega tu dominio exacto en "URIs de redirección autorizados"
4. Guarda y espera 5 minutos

### Error: "Invalid Client ID"

**Causa:** El Client ID está mal configurado

**Solución:**
1. Verifica que copiaste el Client ID completo
2. No debe tener espacios al inicio o final
3. Debe terminar en `.apps.googleusercontent.com`
4. Redeploy después de corregir

### El botón de Google no aparece

**Causa:** Variables no se aplicaron correctamente

**Solución:**
1. Verifica que las variables estén en Netlify/Vercel
2. Haz un "Clear cache and deploy site"
3. Espera 5 minutos y prueba de nuevo

### Error: "API Key not valid"

**Causa:** El API Key está mal o no tiene permisos

**Solución:**
1. Ve a Google Cloud Console → Credenciales
2. Verifica que el API Key tenga restricciones correctas
3. Debe permitir "Google Drive API"
4. Copia el API Key de nuevo y actualiza en Netlify

---

## 📝 Checklist de Configuración

Marca cada paso cuando lo completes:

- [ ] Obtener Client ID de Google Cloud Console
- [ ] Obtener API Key de Google Cloud Console
- [ ] Configurar `REACT_APP_GOOGLE_CLIENT_ID` en Netlify/Vercel
- [ ] Configurar `REACT_APP_GOOGLE_API_KEY` en Netlify/Vercel
- [ ] Agregar dominio en "Orígenes autorizados" de Google
- [ ] Agregar dominio en "URIs de redirección" de Google
- [ ] Hacer redeploy del sitio
- [ ] Esperar 2-3 minutos
- [ ] Probar login con Google
- [ ] ✅ ¡Funciona!

---

## 🔒 Seguridad

### ⚠️ NUNCA hagas esto:

- ❌ NO subas las credenciales al repositorio
- ❌ NO compartas tu API Key públicamente
- ❌ NO uses las mismas credenciales para desarrollo y producción

### ✅ Buenas prácticas:

- ✅ Usa variables de entorno en la plataforma
- ✅ Restringe el API Key a tu dominio
- ✅ Revisa los logs de uso en Google Cloud Console
- ✅ Rota las credenciales cada 6 meses

---

## 📞 Soporte

Si sigues teniendo problemas:

1. **Verifica la consola del navegador (F12)**
   - Busca errores en rojo
   - Copia el mensaje completo

2. **Verifica los logs de Netlify/Vercel**
   - Ve a Deploys → [último deploy] → Deploy log
   - Busca errores relacionados con variables

3. **Contacta al equipo:**
   - Incluye capturas de pantalla
   - Incluye el mensaje de error completo
   - Indica qué pasos ya probaste

---

## 🎯 Resultado Esperado

Una vez configurado correctamente:

```
✅ Login tradicional funciona
✅ Login con Google funciona
✅ Sincronización con Drive funciona
✅ Backup automático funciona
✅ Sin errores en consola
```

---

**Última actualización:** Octubre 2025  
**Versión:** 1.0.0  
**Plataformas soportadas:** Netlify, Vercel
