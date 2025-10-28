# 🚀 Guía Completa de Deployment - ACRILCARD

**Última actualización:** Octubre 2025  
**Versión:** 1.0.0  
**Stack:** React 18 + Netlify (Hosting Gratuito)

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Despliegue en Netlify](#despliegue-en-netlify)
3. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
4. [Verificación Post-Deploy](#verificación-post-deploy)
5. [Troubleshooting](#troubleshooting)
6. [Actualizaciones Futuras](#actualizaciones-futuras)

---

## 🛠️ Requisitos Previos

### 1. Cuentas Necesarias
- **Cuenta de Netlify**: [netlify.com](https://netlify.com) (gratuita)
- **Repositorio GitHub**: Proyecto ya debe estar en GitHub

### 2. Verificación Local
```bash
# Verificar que el proyecto funciona localmente
npm install
npm start

# Verificar build de producción
npm run build
```

**Resultado esperado:**
- ✅ Build exitoso sin errores
- ✅ Carpeta `build/` creada con archivos estáticos
- ✅ Aplicación funciona en `http://localhost:3000`

---

## 🚀 Despliegue en Netlify

### Paso 1: Crear Cuenta en Netlify
1. Ve a [https://netlify.com](https://netlify.com)
2. Haz clic en **"Sign up"**
3. Regístrate con tu cuenta de GitHub (recomendado)
4. Autoriza el acceso a tus repositorios

### Paso 2: Conectar Repositorio
1. En Netlify Dashboard, haz clic en **"New site from Git"**
2. Selecciona **GitHub** como proveedor
3. Busca y selecciona tu repositorio **"Acril-Card-control"**
4. Configura los siguientes parámetros:

```
Branch to deploy: main (o master)
Build command: npm run build
Publish directory: build
```

5. Haz clic en **"Deploy site"**

### Paso 3: Esperar Deploy Inicial
- Netlify construirá tu aplicación (2-3 minutos)
- Recibirás una URL temporal: `https://random-name-123456.netlify.app`
- Puedes cambiar el nombre del sitio después

### Paso 4: Cambiar Nombre del Sitio (Opcional)
1. Ve a **Site settings > General > Site details**
2. Haz clic en **"Change site name"**
3. Elige un nombre único: `acrilcard-production`
4. Tu nueva URL será: `https://acrilcard-production.netlify.app`

---

## ⚙️ Configuración de Variables de Entorno

### Variables Requeridas

1. Ve a **Site settings > Environment variables**
2. Haz clic en **"Add variable"**
3. Agrega las siguientes variables:

```bash
# URL pública de la aplicación
REACT_APP_PUBLIC_BASE_URL=https://tu-sitio.netlify.app

# Entorno de producción
REACT_APP_ENVIRONMENT=production

# Habilitar PWA
REACT_APP_PWA_ENABLED=true

# Configuración de sellos
REACT_APP_STAMPS_PER_REWARD=10

# Backup automático
REACT_APP_AUTO_BACKUP_ENABLED=true
REACT_APP_BACKUP_INTERVAL_HOURS=24
```

### Variables Opcionales (Google Drive)

Si quieres habilitar backup en Google Drive:

```bash
# Google Drive API
REACT_APP_GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
REACT_APP_GOOGLE_API_KEY=tu-api-key
REACT_APP_GOOGLE_CLIENT_SECRET=tu-client-secret
```

**Nota:** Ver `GOOGLE_DRIVE_SETUP.md` para obtener estas credenciales.

### Paso 5: Redeploy con Variables
1. Después de agregar las variables, ve a **Deploys**
2. Haz clic en **"Trigger deploy" > "Deploy site"**
3. Espera 2-3 minutos

---

## ✅ Verificación Post-Deploy

### 1. Verificar URL Pública
- [ ] Abre tu URL de Netlify en el navegador
- [ ] La aplicación carga correctamente
- [ ] El login funciona
- [ ] Puedes crear y ver clientes

### 2. Probar Funcionalidad WhatsApp
- [ ] Agrega un cliente de prueba
- [ ] Haz clic en el botón de WhatsApp
- [ ] Verifica que se abra WhatsApp con el mensaje correcto
- [ ] La URL en el mensaje debe ser tu URL de Netlify

### 3. Probar PWA
**En móvil (Chrome/Firefox):**
- [ ] Abre la URL en el navegador
- [ ] Busca "Instalar app" en el menú (⋮)
- [ ] Instala la aplicación
- [ ] Verifica que funcione como app nativa

**En desktop (Chrome):**
- [ ] Busca el ícono de instalación en la barra de direcciones
- [ ] Instala como PWA
- [ ] La app aparece en tu escritorio

### 4. Verificar Funcionalidad Offline
- [ ] Abre DevTools (F12) > Application > Service Workers
- [ ] Verifica que el Service Worker esté activo
- [ ] Desconecta internet
- [ ] La aplicación debe seguir funcionando

### 5. Verificar Backup
- [ ] Ve a Backup Manager
- [ ] Crea un backup manual
- [ ] Verifica que se descargue correctamente
- [ ] Si configuraste Google Drive, verifica que suba archivos

---

## 🚨 Troubleshooting

### Problema: Build Falla

**Síntomas:**
- Deploy falla con error de compilación
- Netlify muestra "Build failed"

**Soluciones:**
```bash
# 1. Verifica que el build funcione localmente
npm run build

# 2. Revisa los logs de Netlify
# Ve a: Deploys > [último deploy] > Deploy log

# 3. Verifica que todas las dependencias estén en package.json
npm install

# 4. Limpia cache y rebuild
npm run clean
npm run build
```

### Problema: Variables de Entorno No Funcionan

**Síntomas:**
- La aplicación no encuentra las variables
- Funcionalidades no funcionan en producción

**Soluciones:**
1. Verifica que las variables tengan el prefijo `REACT_APP_`
2. Reinicia el build: **Deploys > Trigger deploy > Clear cache and deploy**
3. Verifica en DevTools > Console si hay errores
4. Asegúrate de que las variables estén en **Site settings**, no en `.env`

### Problema: WhatsApp No Abre Correctamente

**Síntomas:**
- El botón de WhatsApp no funciona
- La URL en el mensaje es incorrecta

**Soluciones:**
1. Verifica que `REACT_APP_PUBLIC_BASE_URL` esté configurada correctamente
2. Debe ser la URL completa: `https://tu-sitio.netlify.app`
3. Sin barra final: ❌ `https://tu-sitio.netlify.app/`
4. Redeploy después de corregir

### Problema: PWA No Se Instala

**Síntomas:**
- No aparece opción de instalar
- Service Worker no se registra

**Soluciones:**
1. Verifica que uses HTTPS (Netlify lo proporciona automáticamente)
2. Prueba en Chrome o Firefox (Safari tiene limitaciones)
3. Limpia cache del navegador: Ctrl+Shift+Delete
4. Verifica en DevTools > Application > Manifest
5. Asegúrate de que `REACT_APP_PWA_ENABLED=true`

### Problema: Datos No Persisten

**Síntomas:**
- Los datos se pierden al recargar
- LocalStorage no funciona

**Soluciones:**
1. Verifica que el navegador permita cookies y almacenamiento local
2. Revisa DevTools > Application > Local Storage
3. Verifica que no estés en modo incógnito
4. Comprueba que no haya errores en Console

### Problema: Página en Blanco

**Síntomas:**
- La aplicación muestra pantalla blanca
- No hay errores visibles

**Soluciones:**
1. Abre DevTools > Console para ver errores
2. Verifica que el `basename` en `App.js` esté correcto
3. Para Netlify debe ser: `basename: ''` (vacío)
4. Verifica que los archivos estén en la carpeta `build/`
5. Redeploy con cache limpio

---

## 🔄 Actualizaciones Futuras

### Deploy Automático (Recomendado)

Netlify hace deploy automático cada vez que haces push a GitHub:

```bash
# 1. Haz cambios en tu código local
git add .
git commit -m "Descripción de cambios"
git push origin main

# 2. Netlify detecta el push y hace deploy automático
# 3. Espera 2-3 minutos
# 4. Tu sitio se actualiza automáticamente
```

### Deploy Manual

Si prefieres control manual:

```bash
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Link al sitio
netlify link

# 4. Deploy
netlify deploy --prod
```

### Agregar Nuevas Variables de Entorno

```bash
# Opción 1: Desde Dashboard
# Site settings > Environment variables > Add variable

# Opción 2: Desde CLI
netlify env:set VARIABLE_NAME "valor"

# Después de agregar variables, redeploy:
netlify deploy --prod
```

### Rollback a Versión Anterior

Si algo sale mal:

1. Ve a **Deploys** en Netlify Dashboard
2. Encuentra el deploy anterior que funcionaba
3. Haz clic en **"Publish deploy"**
4. Tu sitio vuelve a esa versión instantáneamente

---

## 💡 Mejores Prácticas

### 1. Seguridad
- ✅ Nunca commitear credenciales en el código
- ✅ Usar variables de entorno para datos sensibles
- ✅ Mantener `.env` en `.gitignore`
- ✅ Rotar credenciales periódicamente

### 2. Performance
- ✅ Habilitar compresión (Netlify lo hace automáticamente)
- ✅ Usar lazy loading para componentes grandes
- ✅ Optimizar imágenes antes de subir
- ✅ Minimizar dependencias innecesarias

### 3. Monitoreo
- ✅ Revisar Netlify Analytics regularmente
- ✅ Monitorear errores en DevTools Console
- ✅ Verificar Service Worker status
- ✅ Revisar logs de deploy

### 4. Backup
- ✅ Hacer backup manual antes de cambios grandes
- ✅ Mantener backups locales importantes
- ✅ Configurar Google Drive para backups automáticos
- ✅ Probar restauración periódicamente

---

## 📱 Para Tu Equipo

### Instrucciones para el Equipo de Ventas

```markdown
# Acceso a ACRILCARD

## URL de la Aplicación:
🔗 https://tu-sitio.netlify.app

## Instalación Recomendada:

### En Móvil:
1. Abre la URL en Chrome o Firefox
2. Toca el menú (⋮) > "Instalar app"
3. La app aparecerá en tu pantalla de inicio

### En Computadora:
1. Abre la URL en Chrome
2. Busca el ícono de instalación en la barra de direcciones
3. Haz clic en "Instalar"

## Funcionalidades:
- ✅ Agregar nuevos clientes
- ✅ Gestionar sellos por compras
- ✅ Enviar tarjetas por WhatsApp
- ✅ Funciona sin internet
- ✅ Se actualiza automáticamente

## Soporte:
Para problemas técnicos, contactar a: [tu-email]
```

---

## 📊 Ventajas de Netlify

### ✅ Gratuito
- **100 GB** de ancho de banda mensual
- **300 minutos** de build por mes
- **Deploy ilimitados**
- **Sin costos ocultos**

### ✅ Automático
- **Deploy continuo** desde GitHub
- **SSL/HTTPS automático** y gratuito
- **Optimización automática** de assets
- **CDN global** incluido

### ✅ Confiable
- **99.99% uptime** garantizado
- **Backups automáticos** (deploy history)
- **Rollback instantáneo** a versiones anteriores
- **Preview deployments** para testing

### ✅ Escalable
- **Sin límites de usuarios**
- **Performance global** con CDN
- **Analytics incluido**
- **Soporte para custom domains**

---

## 📞 Recursos de Ayuda

### Documentación Oficial
- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **React Docs**: [react.dev](https://react.dev)
- **PWA Guide**: [web.dev/pwa](https://web.dev/pwa)

### Documentación del Proyecto
- `README.md` - Documentación principal
- `QUICK_START.md` - Guía de inicio rápido
- `GOOGLE_DRIVE_SETUP.md` - Configuración de Google Drive
- `AI_ASSISTANT_PROMPT.md` - Guía para desarrollo

### Soporte
- **Netlify Community**: [community.netlify.com](https://community.netlify.com)
- **Netlify Support**: [app.netlify.com/support](https://app.netlify.com/support)

---

## 🎉 Resultado Final

Después del despliegue exitoso tendrás:

- ✅ **URL pública permanente**: `https://tu-sitio.netlify.app`
- ✅ **WhatsApp funcional**: Los clientes pueden recibir sus tarjetas
- ✅ **App instalable**: Experiencia nativa en móviles y desktop
- ✅ **Cero costos**: Hosting gratuito ilimitado
- ✅ **Mantenimiento automático**: Se actualiza con cada commit
- ✅ **HTTPS seguro**: Certificado SSL incluido
- ✅ **Performance global**: CDN en todo el mundo

**¡Tu equipo de ventas ya puede usar ACRILCARD al 100%!** 🚀

---

**Última actualización:** Octubre 2025  
**Mantenedor:** ACRIL Pinturas  
**Versión:** 1.0.0
