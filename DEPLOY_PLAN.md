# 🚀 Plan de Despliegue: Netlify + Supabase

**Fecha:** 24 de Octubre, 2025  
**Objetivo:** Migrar ACRILCARD de localStorage a Supabase y desplegar en Netlify  
**Tiempo estimado:** 2-3 horas  
**Costo:** $0 USD/mes (100% gratis)

---

## 📋 FASE 1: Configuración de Supabase (15 min)

### 1.1 Crear Cuenta y Proyecto

1. Ir a https://supabase.com
2. Registrarse con GitHub o Email
3. Click en "New Project"
4. Configurar:
   - **Project Name:** acrilcard-production
   - **Database Password:** [Generar y GUARDAR]
   - **Region:** South America (São Paulo)
   - **Plan:** Free (500 MB)
5. Esperar 2-3 minutos

### 1.2 Obtener Credenciales

1. Ir a: Settings → API
2. Copiar y guardar:
   ```
   Project URL: https://xxxxx.supabase.co
   anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## 📋 FASE 2: Crear Base de Datos (20 min)

### 2.1 Ejecutar SQL

1. Ir a: SQL Editor → New Query
2. Copiar y pegar el SQL del archivo `SUPABASE_SCHEMA.sql`
3. Click en "Run"
4. Verificar que se crearon las tablas

---

## 📋 FASE 3: Integrar Supabase en el Proyecto (30 min)

### 3.1 Instalar Dependencias

```bash
npm install @supabase/supabase-js
```

### 3.2 Crear Archivos de Servicio

Los archivos ya están creados en:
- `src/services/supabaseClient.js`
- `src/services/customerService.js`

### 3.3 Actualizar CustomerContext

El archivo actualizado está en: `src/contexts/CustomerContext.supabase.js`

---

## 📋 FASE 4: Configurar Variables de Entorno (10 min)

### 4.1 Crear archivo .env

```bash
# Copiar desde .env.example
cp .env.example .env
```

### 4.2 Agregar credenciales de Supabase

Editar `.env` y agregar:

```env
# Supabase
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Otras variables existentes
REACT_APP_PUBLIC_BASE_URL=http://localhost:3000
REACT_APP_ENVIRONMENT=development
REACT_APP_PWA_ENABLED=true
```

---

## 📋 FASE 5: Migrar Datos Existentes (15 min)

### 5.1 Exportar datos de localStorage

1. Abrir la aplicación actual
2. Ir a Backup Manager
3. Exportar datos locales
4. Guardar archivo JSON

### 5.2 Importar a Supabase

Opción A - Desde la aplicación:
```javascript
// Usar la función de importación masiva
import { customerService } from './services/customerService';

const migrateData = async () => {
  const localData = JSON.parse(localStorage.getItem('customers'));
  await customerService.bulkImport(localData);
};
```

Opción B - Desde Supabase Dashboard:
1. Ir a Table Editor → customers
2. Click en "Insert" → "Insert row"
3. Pegar datos JSON

---

## 📋 FASE 6: Probar Localmente (15 min)

### 6.1 Iniciar servidor de desarrollo

```bash
npm start
```

### 6.2 Verificar funcionalidades

- [ ] Login funciona
- [ ] Cargar clientes desde Supabase
- [ ] Crear nuevo cliente
- [ ] Actualizar cliente
- [ ] Eliminar cliente
- [ ] Agregar sellos
- [ ] Canjear recompensa
- [ ] Búsqueda funciona
- [ ] Filtros funcionan

---

## 📋 FASE 7: Deploy en Netlify (20 min)

### 7.1 Preparar para producción

```bash
# Build de producción
npm run build
```

### 7.2 Deploy con Netlify CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### 7.3 Configurar Variables de Entorno en Netlify

1. Ir a: Site Settings → Environment Variables
2. Agregar:
   ```
   REACT_APP_SUPABASE_URL = https://xxxxx.supabase.co
   REACT_APP_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   REACT_APP_PUBLIC_BASE_URL = https://tu-sitio.netlify.app
   REACT_APP_ENVIRONMENT = production
   REACT_APP_PWA_ENABLED = true
   ```

### 7.4 Redeploy con variables

```bash
netlify deploy --prod
```

---

## 📋 FASE 8: Verificación Final (15 min)

### 8.1 Probar en producción

1. Abrir URL de Netlify
2. Verificar todas las funcionalidades
3. Probar en móvil
4. Verificar PWA instalable

### 8.2 Monitoreo

1. Supabase Dashboard → Database → Logs
2. Netlify Dashboard → Functions → Logs
3. Browser DevTools → Console

---

## 🎯 Checklist Final

- [ ] Supabase configurado
- [ ] Base de datos creada
- [ ] Dependencias instaladas
- [ ] Servicios implementados
- [ ] Variables de entorno configuradas
- [ ] Datos migrados
- [ ] Pruebas locales exitosas
- [ ] Deploy en Netlify exitoso
- [ ] Variables en Netlify configuradas
- [ ] Verificación en producción exitosa

---

## 📞 Soporte

**Archivos importantes:**
- `SUPABASE_SCHEMA.sql` - Esquema de base de datos
- `src/services/supabaseClient.js` - Cliente de Supabase
- `src/services/customerService.js` - Servicio de clientes
- `src/contexts/CustomerContext.supabase.js` - Context actualizado

**Documentación:**
- Supabase: https://supabase.com/docs
- Netlify: https://docs.netlify.com

---

**Estado:** ✅ Plan completo listo para ejecutar
