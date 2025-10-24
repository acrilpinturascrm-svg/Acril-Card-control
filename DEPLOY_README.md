# 🚀 Guía de Despliegue - ACRILCARD

## 📋 Descripción
Esta guía documenta el proceso completo para desplegar **ACRILCARD** en **Netlify** de forma gratuita y obtener una URL pública que permita el funcionamiento completo de WhatsApp.

## 🎯 Objetivo
- Obtener URL pública para la aplicación
- Habilitar funcionalidad completa de WhatsApp
- Permitir instalación como PWA nativa
- Cero costos de hosting

---

## 🛠️ Requisitos Previos

### 1. Cuentas Necesarias
- **Cuenta de Netlify**: [netlify.com](https://netlify.com) (gratuita)
- **Repositorio GitHub**: Ya tienes el proyecto subido

### 2. Verificación Local
```bash
# Verificar que el proyecto funciona localmente
npm install
npm start

# Verificar build de producción
npm run build
```

---

## 🚀 PASO A PASO: Despliegue en Netlify

### Paso 1: Crear Cuenta en Netlify
1. Ve a [https://netlify.com](https://netlify.com)
2. Haz clic en **"Sign up"**
3. Regístrate con:
   - **Opción 1**: Email y contraseña
   - **Opción 2**: Tu cuenta de GitHub (recomendado)
4. Verifica tu email si es necesario

### Paso 2: Conectar Repositorio GitHub
1. En Netlify Dashboard, haz clic en **"New site from Git"**
2. Selecciona **GitHub** como proveedor
3. Autoriza el acceso a tus repositorios de GitHub
4. Busca y selecciona tu repositorio **"Acril-Card-control"**
5. Haz clic en **"Deploy site"**

### Paso 3: Configurar Build Settings
Netlify detectará automáticamente la configuración, pero verifica:

- **Branch**: `main` o `master`
- **Build command**: `npm run build`
- **Publish directory**: `build`

### Paso 4: Configurar Variables de Entorno
1. Ve a **Site settings > Environment variables**
2. Haz clic en **"Add variable"**
3. Agrega las siguientes variables:

```bash
# Variable de entorno para URL pública
REACT_APP_PUBLIC_BASE_URL=https://TU-SITIO.netlify.app

# Entorno de producción
REACT_APP_ENVIRONMENT=production

# Habilitar funcionalidades PWA
REACT_APP_PWA_ENABLED=true
```

### Paso 5: Deploy Inicial
1. Haz clic en **"Deploy site"**
2. Espera 2-3 minutos mientras Netlify construye tu aplicación
3. Recibirás una URL como: `https://random-name-123456.netlify.app`

---

## ✅ Verificación Post-Deploy

### 1. Verificar URL Pública
1. Abre tu nueva URL en el navegador
2. Deberías ver la aplicación funcionando completamente
3. Verifica que la navegación funcione correctamente

### 2. Probar Funcionalidad WhatsApp
1. En la aplicación, agrega un cliente de prueba
2. Haz clic en el botón de WhatsApp
3. Verifica que:
   - Se abra WhatsApp correctamente
   - El mensaje contenga la URL pública
   - La URL sea accesible desde el mensaje

### 3. Probar PWA
1. En Chrome/Firefox móvil:
   - Busca "Instalar app" en el menú (tres puntos)
   - Instala la aplicación
   - Verifica que funcione como app nativa

### 4. Verificar Funcionalidades Offline
1. Abre DevTools (F12) > Application > Service Workers
2. Verifica que el Service Worker esté activo
3. Desconecta internet y prueba la aplicación

---

## 🔧 Configuración Avanzada (Opcional)

### Cambiar Nombre del Sitio
1. Ve a **Site settings > General**
2. Cambia **Site name** a algo más amigable
3. Netlify actualizará automáticamente la URL

### Configurar Dominio Personalizado (Futuro)
Si quieres un dominio propio:
1. Ve a **Site settings > Domain management**
2. Agrega tu dominio personalizado
3. Configura DNS records

---

## 📱 Para Tu Equipo de Ventas

### Opción 1: Usar como Web App
- Comparte la URL de Netlify con tu equipo
- Funciona en cualquier navegador moderno
- Se puede agregar a favoritos como acceso rápido

### Opción 2: Instalar como App Nativa
- **En móviles**: Buscar "Instalar app" en el menú del navegador
- **En desktop**: Instalar como PWA desde Chrome
- Aparecerá como aplicación nativa en el escritorio/teléfono

### Instrucciones para el Equipo:
```markdown
# Instrucciones para el Equipo de Ventas

## Acceso a ACRILCARD:
1. Ve a: [URL_DE_NETLIFY]
2. Para mejor experiencia, instala la app:
   - En móvil: Menú del navegador > "Instalar app"
   - En PC: Instalar como PWA

## Funcionalidades Disponibles:
- ✅ Agregar nuevos clientes
- ✅ Gestionar sellos por compras
- ✅ Enviar tarjetas por WhatsApp
- ✅ Funciona sin internet
- ✅ Se actualiza automáticamente

## Soporte:
Contactar a [TU_EMAIL] para problemas técnicos
```

---

## 🚨 Troubleshooting

### Problema: Build Falla
**Solución**:
1. Verifica que `npm run build` funcione localmente
2. Revisa que todas las dependencias estén instaladas
3. Contacta soporte de Netlify si persiste

### Problema: Variables de Entorno No Funcionan
**Solución**:
1. Verifica que las variables estén configuradas correctamente
2. Reinicia el build desde **Deploys > Trigger deploy**
3. Revisa la consola del navegador para errores

### Problema: WhatsApp No Abre
**Solución**:
1. Verifica que la URL pública sea accesible
2. Prueba con diferentes navegadores
3. Verifica que el número de teléfono tenga 10 dígitos

### Problema: PWA No Se Instala
**Solución**:
1. Verifica que uses HTTPS (Netlify lo proporciona automáticamente)
2. Prueba en Chrome o Firefox (Safari tiene limitaciones)
3. Limpia cache del navegador

---

## 💡 Ventajas del Despliegue en Netlify

### ✅ Gratuito
- **Plan gratuito**: Hasta 100GB de ancho de banda mensual
- **Sin costos ocultos**: Funcionalidades premium incluidas

### ✅ Automático
- **Deploy continuo**: Se actualiza con cada push a GitHub
- **SSL automático**: Certificado HTTPS gratuito
- **Optimización automática**: Compresión y optimización de assets

### ✅ Escalable
- **Sin límites de usuarios**: Tu equipo puede usar sin restricciones
- **Performance global**: CDN global incluido
- **Analytics**: Métricas de uso incluidas

### ✅ Confiable
- **99.99% uptime**: Garantizado por Netlify
- **Backups automáticos**: Versiones anteriores disponibles
- **Rollback fácil**: Puedes revertir a versiones anteriores

---

## 🔄 Actualizaciones Futuras

### Para Actualizar la Aplicación:
1. Haz cambios en tu código local
2. Commit y push a GitHub
3. Netlify desplegará automáticamente
4. La URL se actualiza en 2-3 minutos

### Para Agregar Nuevas Variables de Entorno:
1. Ve a **Site settings > Environment variables**
2. Agrega la nueva variable
3. Trigger un nuevo deploy

---

## 📞 Soporte

### Recursos de Ayuda:
- **Documentación Netlify**: [docs.netlify.com](https://docs.netlify.com)
- **Comunidad**: [community.netlify.com](https://community.netlify.com)
- **Soporte**: [app.netlify.com/support](https://app.netlify.com/support)

### Contacto Interno:
Para problemas específicos del proyecto ACRILCARD, contacta al equipo de desarrollo.

---

## 🎉 Resultado Final

Después del despliegue exitoso tendrás:

- **URL pública permanente**: `https://tu-sitio.netlify.app`
- **WhatsApp funcional**: Los clientes pueden recibir sus tarjetas
- **App instalable**: Experiencia nativa en móviles y desktop
- **Cero costos**: Hosting gratuito ilimitado
- **Mantenimiento automático**: Se actualiza con cada commit

**¡Tu equipo de ventas ya puede usar ACRILCARD al 100%!** 🚀

---

*Este documento fue creado el $(date)*
*Guía de despliegue para ACRILCARD - Sistema de Fidelización*
