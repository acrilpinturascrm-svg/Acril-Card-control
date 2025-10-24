# ✅ VERIFICACIÓN DE CONFIGURACIÓN GOOGLE DRIVE

## 📋 TU CONFIGURACIÓN ACTUAL

```bash
REACT_APP_GOOGLE_CLIENT_ID=647020546777-net122khmpkvlj3u13mhaob4ia6dnmad.apps.googleusercontent.com
REACT_APP_GOOGLE_API_KEY=AIzaSyD_Sq3xNYYC4UNagsypZQcMQbA4QjymQds
REACT_APP_GOOGLE_DRIVE_ENABLED=true
```

✅ **Credenciales detectadas correctamente**  
✅ **Google Drive habilitado**  
✅ **Formato correcto**

---

## 🧪 PASOS PARA PROBAR GOOGLE DRIVE

### **1. Abrir la aplicación**
```
http://localhost:3003
```

### **2. Iniciar sesión en la aplicación**
- Usuario: admin
- Contraseña: (tu contraseña configurada)

### **3. Ir al Sistema de Backup**
- Clic en el menú hamburguesa (☰)
- Seleccionar **"Sistema de Backup"**

### **4. Verificar panel de Google Drive**

Deberías ver un panel verde que dice:
```
📊 Estado de Google Drive
└─ No conectado a Google Drive
   └─ Botón: "Iniciar Sesión"
```

### **5. Iniciar sesión en Google Drive**

1. Clic en **"Iniciar Sesión"**
2. Se abrirá un popup de Google OAuth
3. Selecciona tu cuenta de Google
4. Autoriza la aplicación

**IMPORTANTE**: Si ves un mensaje de "Aplicación no verificada":
- Clic en **"Avanzado"**
- Clic en **"Ir a ACRILCARD (no seguro)"**
- Esto es normal en desarrollo

### **6. Verificar conexión exitosa**

Después de autorizar, deberías ver:
```
📊 Estado de Google Drive
└─ Conectado como [Tu Nombre]
   └─ [Tu Email]
   └─ Botón: "Cerrar Sesión"
```

### **7. Probar backup a Google Drive**

1. Clic en **"Backup Google Drive"** (botón verde)
2. Espera a que se suba el archivo
3. Verás una notificación: "✅ Backup subido a Google Drive: [nombre_archivo]"

### **8. Verificar en Google Drive**

1. Ve a [Google Drive](https://drive.google.com)
2. Busca la carpeta **"ACRILCARD_Backups"**
3. Verifica que el archivo esté ahí

---

## 🔍 QUÉ BUSCAR EN LA CONSOLA DEL NAVEGADOR

Abre la consola del navegador (F12) y busca estos mensajes:

### ✅ **Mensajes de éxito esperados:**

```
✅ Google API script ya está cargado
🔄 Iniciando inicialización de Google Drive API...
📋 Configuración: { clientId: "647020546777-net122...", ... }
🔄 Cargando client:auth2...
✅ Google Drive API inicializada exitosamente
👤 Estado de autenticación: No autenticado
```

Después de iniciar sesión:
```
👤 Estado de autenticación: Autenticado
User signed in: [Tu Nombre]
```

Después de hacer backup:
```
📤 Subiendo backup a Google Drive...
Backup uploaded to Google Drive: [file_id]
```

### ❌ **Errores posibles y soluciones:**

#### Error: "redirect_uri_mismatch"
**Causa**: La URL no está autorizada en Google Cloud Console

**Solución**:
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Ve a **Credenciales** → Edita tu OAuth Client ID
3. En **"Orígenes de JavaScript autorizados"** agrega:
   ```
   http://localhost:3003
   ```
4. En **"URI de redirección autorizados"** agrega:
   ```
   http://localhost:3003
   ```
5. Guarda y espera 5 minutos para que se propague

#### Error: "API key not valid"
**Causa**: La API Key está mal configurada o restringida incorrectamente

**Solución**:
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Ve a **Credenciales** → Edita tu API Key
3. En **"Restricciones de API"**:
   - Selecciona **"Restringir clave"**
   - Marca solo **"Google Drive API"**
4. Guarda

#### Error: "Google Drive credentials not configured"
**Causa**: Las variables de entorno no se cargaron

**Solución**:
1. Verifica que el archivo `.env` esté en la raíz del proyecto
2. Reinicia el servidor: `npm start`
3. Verifica que las variables empiecen con `REACT_APP_`

---

## 📊 CHECKLIST DE VERIFICACIÓN

- [ ] Servidor iniciado en `http://localhost:3003`
- [ ] Aplicación carga sin errores
- [ ] Panel de Google Drive aparece en Sistema de Backup
- [ ] Botón "Iniciar Sesión" visible
- [ ] Popup de Google OAuth se abre
- [ ] Autorización exitosa
- [ ] Panel muestra "Conectado como [nombre]"
- [ ] Botón "Backup Google Drive" habilitado (verde)
- [ ] Backup se sube correctamente
- [ ] Archivo aparece en Google Drive
- [ ] Carpeta "ACRILCARD_Backups" creada

---

## 🎯 FUNCIONALIDADES ADICIONALES A PROBAR

### **Backup Completo (Local + Google Drive)**
- Clic en **"Backup Completo"** (botón morado)
- Descarga archivo local Y sube a Google Drive

### **Sincronización Bidireccional**
- Clic en **"Sincronizar"** (botón índigo)
- Compara archivos locales con remotos
- Sube faltantes y descarga nuevos

### **Historial de Backups**
- Clic en **"Historial"**
- Ver todos los backups realizados
- Restaurar desde un backup anterior

---

## 💡 CONSEJOS

### **Para desarrollo:**
- Mantén la consola del navegador abierta (F12)
- Revisa los logs para ver el flujo de operaciones
- Los mensajes con emojis (✅ ❌ 🔄) son fáciles de identificar

### **Para producción:**
- Cambia `REACT_APP_DEBUG=false`
- Cambia `REACT_APP_LOG_LEVEL=warn`
- Verifica las URLs autorizadas en Google Cloud Console

### **Seguridad:**
- Nunca compartas tu API Key públicamente
- El archivo `.env` está en `.gitignore` (no se sube a Git)
- Para producción, usa variables de entorno del servidor

---

## 🚨 SI ALGO NO FUNCIONA

1. **Revisa la consola del navegador** (F12) para errores
2. **Verifica las URLs** en Google Cloud Console
3. **Reinicia el servidor** después de cambios en `.env`
4. **Limpia la caché** del navegador (Ctrl+Shift+Delete)
5. **Verifica que Google Drive API** esté habilitada en Google Cloud Console

---

## 📞 INFORMACIÓN ADICIONAL

### **Tu configuración actual:**
- Puerto: `3003`
- URL: `http://localhost:3003`
- Google Drive: `Habilitado`
- Backup automático: `Cada 24 horas`
- Máximo backups locales: `10`

### **Credenciales configuradas:**
- Client ID: `647020546777-net122...` ✅
- API Key: `AIzaSyD_Sq3xNYYC4...` ✅

---

**¡Todo está listo para probar! Sigue los pasos y verifica que funcione correctamente.** 🚀
