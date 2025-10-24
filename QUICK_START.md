# ⚡ Quick Start: Deploy en 30 Minutos

**Guía rápida para desplegar ACRILCARD con Netlify + Supabase**

---

## 🎯 Paso 1: Supabase (10 min)

### 1.1 Crear Proyecto
```
1. Ir a: https://supabase.com
2. Click: "Start your project"
3. Registrarse con GitHub
4. Click: "New Project"
5. Configurar:
   - Name: acrilcard-production
   - Password: [Generar y GUARDAR]
   - Region: South America (São Paulo)
6. Click: "Create new project"
7. Esperar 2-3 minutos
```

### 1.2 Crear Base de Datos
```
1. Ir a: SQL Editor
2. Click: "New Query"
3. Copiar contenido de: SUPABASE_SCHEMA.sql
4. Pegar en el editor
5. Click: "Run"
6. Verificar: "Success. No rows returned"
```

### 1.3 Obtener Credenciales
```
1. Ir a: Settings → API
2. Copiar:
   - Project URL: https://xxxxx.supabase.co
   - anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
3. GUARDAR en lugar seguro
```

---

## 🔧 Paso 2: Configurar Proyecto (5 min)

### 2.1 Instalar Dependencia
```bash
npm install @supabase/supabase-js
```

### 2.2 Crear archivo .env
```bash
# Copiar desde ejemplo
cp .env.example .env

# Editar .env y agregar credenciales de Supabase
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REACT_APP_PUBLIC_BASE_URL=http://localhost:3000
REACT_APP_ENVIRONMENT=development
```

### 2.3 Probar Localmente
```bash
npm start
```

**Verificar:**
- [ ] Aplicación abre sin errores
- [ ] Console muestra: "✅ Conexión con Supabase exitosa"
- [ ] Puedes crear un cliente de prueba

---

## 🚀 Paso 3: Deploy en Netlify (10 min)

### 3.1 Instalar Netlify CLI
```bash
npm install -g netlify-cli
```

### 3.2 Login en Netlify
```bash
netlify login
```
- Se abrirá navegador
- Autorizar acceso
- Volver a terminal

### 3.3 Deploy
```bash
# Build de producción
npm run build

# Deploy
netlify deploy --prod
```

**Responder preguntas:**
```
? Create & configure a new site: Yes
? Team: [Tu equipo]
? Site name: acrilcard-production (o el que prefieras)
? Publish directory: build
```

### 3.4 Configurar Variables en Netlify

**Opción A - Desde Dashboard:**
```
1. Ir a: https://app.netlify.com
2. Seleccionar tu sitio
3. Ir a: Site settings → Environment variables
4. Click: "Add a variable"
5. Agregar cada variable:
   - REACT_APP_SUPABASE_URL
   - REACT_APP_SUPABASE_ANON_KEY
   - REACT_APP_PUBLIC_BASE_URL (tu URL de Netlify)
   - REACT_APP_ENVIRONMENT = production
   - REACT_APP_PWA_ENABLED = true
```

**Opción B - Desde CLI:**
```bash
netlify env:set REACT_APP_SUPABASE_URL "https://xxxxx.supabase.co"
netlify env:set REACT_APP_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
netlify env:set REACT_APP_PUBLIC_BASE_URL "https://tu-sitio.netlify.app"
netlify env:set REACT_APP_ENVIRONMENT "production"
netlify env:set REACT_APP_PWA_ENABLED "true"
```

### 3.5 Redeploy con Variables
```bash
netlify deploy --prod
```

---

## ✅ Paso 4: Verificación (5 min)

### 4.1 Abrir Sitio
```bash
netlify open:site
```

### 4.2 Checklist de Verificación
```
- [ ] Sitio carga correctamente
- [ ] Login funciona (admin/admin123)
- [ ] Puedes crear un cliente
- [ ] Cliente aparece en la lista
- [ ] Puedes agregar sellos
- [ ] Puedes canjear recompensa
- [ ] PWA es instalable (icono en barra de direcciones)
- [ ] Funciona en móvil
```

### 4.3 Verificar en Supabase
```
1. Ir a: Supabase Dashboard
2. Ir a: Table Editor → customers
3. Verificar: Aparece el cliente creado
```

---

## 🔄 Migrar Datos Existentes (Opcional)

### Si tienes datos en localStorage:

```javascript
// 1. En la aplicación ANTIGUA, abrir Console (F12)
const customers = JSON.parse(localStorage.getItem('customers') || '[]');
const dataStr = JSON.stringify(customers, null, 2);
const blob = new Blob([dataStr], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'backup-clientes.json';
link.click();

// 2. En la aplicación NUEVA, usar BackupManager
// Ir a: Backup Manager → Importar → Seleccionar archivo
```

---

## 🎉 ¡Listo!

Tu aplicación está desplegada en:
- **URL:** https://tu-sitio.netlify.app
- **Base de datos:** Supabase (500 MB gratis)
- **Costo:** $0 USD/mes

---

## 📞 Comandos Útiles

```bash
# Ver logs de deploy
netlify logs

# Abrir dashboard
netlify open

# Ver sitio en producción
netlify open:site

# Ver variables de entorno
netlify env:list

# Redeploy
netlify deploy --prod

# Ver status del sitio
netlify status
```

---

## 🆘 Solución de Problemas

### Error: "Supabase credentials missing"
```bash
# Verificar que las variables estén configuradas
netlify env:list

# Si no están, agregarlas
netlify env:set REACT_APP_SUPABASE_URL "tu-url"
netlify env:set REACT_APP_SUPABASE_ANON_KEY "tu-key"

# Redeploy
netlify deploy --prod
```

### Error: "Failed to fetch"
```
1. Verificar que Supabase esté activo
2. Verificar URL y Key correctas
3. Verificar RLS policies en Supabase
```

### PWA no se instala
```
1. Verificar que sea HTTPS (Netlify lo hace automático)
2. Verificar manifest.json en build/
3. Verificar service worker registrado
4. Limpiar cache del navegador
```

---

## 📚 Próximos Pasos

1. **Personalizar dominio** (opcional)
   ```bash
   netlify domains:add tu-dominio.com
   ```

2. **Configurar Google Drive** (opcional)
   - Ver: GOOGLE_DRIVE_SETUP.md

3. **Monitorear uso**
   - Supabase: Dashboard → Database → Usage
   - Netlify: Dashboard → Analytics

4. **Backups automáticos**
   - Supabase hace backups diarios automáticos
   - Configurar backup local adicional

---

**Tiempo total:** ~30 minutos  
**Costo:** $0 USD/mes  
**Estado:** ✅ Producción lista
