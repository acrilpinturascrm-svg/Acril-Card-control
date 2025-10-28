# 🚀 Configuración de Supabase para ACRILCARD

Esta guía te ayudará a configurar Supabase como backend para ACRILCARD.

## 📋 Requisitos Previos

- Cuenta de GitHub (para login en Supabase)
- Navegador web moderno

---

## 🎯 Paso 1: Crear Cuenta en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en **"Start your project"**
3. Inicia sesión con tu cuenta de GitHub
4. Acepta los permisos solicitados

---

## 🏗️ Paso 2: Crear Nuevo Proyecto

1. En el dashboard, haz clic en **"New Project"**
2. Selecciona tu organización (o crea una nueva)
3. Configura tu proyecto:
   - **Name:** `acrilcard` (o el nombre que prefieras)
   - **Database Password:** Genera una contraseña segura (guárdala en un lugar seguro)
   - **Region:** Selecciona la región más cercana a tus usuarios
   - **Pricing Plan:** Selecciona **"Free"** (suficiente para empezar)
4. Haz clic en **"Create new project"**
5. Espera 2-3 minutos mientras se crea el proyecto

---

## 🗄️ Paso 3: Crear las Tablas

1. En el menú lateral, ve a **"SQL Editor"**
2. Haz clic en **"New query"**
3. Copia y pega el siguiente SQL:

```sql
-- Crear tabla de clientes
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  document TEXT,
  stamps INTEGER DEFAULT 0 CHECK (stamps >= 0),
  rewards INTEGER DEFAULT 0 CHECK (rewards >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para búsquedas rápidas
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_created_at ON customers(created_at DESC);

-- Crear tabla de historial de sellos
CREATE TABLE stamp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  stamps_added INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para historial
CREATE INDEX idx_stamp_history_customer ON stamp_history(customer_id);
CREATE INDEX idx_stamp_history_created_at ON stamp_history(created_at DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en customers
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stamp_history ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad (permitir todo para anon key - ajustar según necesites)
CREATE POLICY "Permitir lectura de clientes" ON customers
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserción de clientes" ON customers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualización de clientes" ON customers
  FOR UPDATE USING (true);

CREATE POLICY "Permitir eliminación de clientes" ON customers
  FOR DELETE USING (true);

CREATE POLICY "Permitir lectura de historial" ON stamp_history
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserción de historial" ON stamp_history
  FOR INSERT WITH CHECK (true);
```

4. Haz clic en **"Run"** (o presiona `Ctrl + Enter`)
5. Verifica que aparezca el mensaje **"Success. No rows returned"**

---

## 🔑 Paso 4: Obtener las Credenciales

1. En el menú lateral, ve a **"Project Settings"** (ícono de engranaje)
2. Haz clic en **"API"** en el menú lateral
3. Encontrarás dos valores importantes:

### **Project URL**
```
https://tu-proyecto-id.supabase.co
```

### **anon/public key**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANTE:** 
- La `anon key` es segura para usar en el frontend
- **NUNCA** uses la `service_role key` en el frontend (es secreta)

---

## ⚙️ Paso 5: Configurar Variables de Entorno

1. En tu proyecto ACRILCARD, crea un archivo `.env` en la raíz (si no existe)
2. Agrega las siguientes variables:

```env
REACT_APP_SUPABASE_URL=https://tu-proyecto-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

3. Reemplaza los valores con tus credenciales reales de Supabase

---

## 🧪 Paso 6: Probar la Conexión

1. Reinicia tu servidor de desarrollo:
```bash
npm start
```

2. Abre la consola del navegador (F12)
3. Deberías ver un mensaje indicando que Supabase está conectado
4. Intenta crear un cliente de prueba
5. Ve al dashboard de Supabase > **"Table Editor"** > **"customers"**
6. Deberías ver el cliente que acabas de crear

---

## 📊 Paso 7: Migrar Datos Existentes (Opcional)

Si ya tienes clientes en localStorage y quieres migrarlos a Supabase:

1. En la aplicación, abre la consola del navegador (F12)
2. Ejecuta:
```javascript
// Importar el servicio
import customersService from './services/customersService';

// Migrar datos
customersService.migrateFromLocalStorage()
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

3. Verifica en Supabase que los datos se migraron correctamente

---

## 🔒 Paso 8: Configurar Seguridad (Recomendado)

### **Políticas de Row Level Security (RLS)**

Las políticas actuales permiten acceso completo. Para producción, considera:

1. **Autenticación de usuarios:**
   - Implementar login con Supabase Auth
   - Restringir acceso solo a usuarios autenticados

2. **Políticas más estrictas:**
```sql
-- Ejemplo: Solo usuarios autenticados pueden leer
CREATE POLICY "Usuarios autenticados pueden leer" ON customers
  FOR SELECT USING (auth.role() = 'authenticated');
```

---

## 📈 Monitoreo y Límites

### **Plan Gratuito incluye:**
- ✅ 500 MB de base de datos
- ✅ 2 GB de bandwidth/mes
- ✅ 50,000 usuarios activos/mes
- ✅ Backups automáticos diarios

### **Monitorear uso:**
1. Dashboard > **"Settings"** > **"Usage"**
2. Revisa el uso de base de datos y bandwidth
3. Configura alertas si te acercas a los límites

---

## 🆘 Solución de Problemas

### **Error: "relation 'customers' does not exist"**
- Las tablas no se crearon correctamente
- Vuelve al Paso 3 y ejecuta el SQL nuevamente

### **Error: "Invalid API key"**
- Verifica que copiaste correctamente la `anon key`
- Asegúrate de que no haya espacios al inicio o final
- Reinicia el servidor de desarrollo

### **Los datos no se guardan**
- Verifica que las políticas RLS estén configuradas
- Revisa la consola del navegador para errores
- Verifica que Supabase esté en línea

### **Error de CORS**
- Ve a **"Project Settings"** > **"API"**
- Agrega tu dominio a **"Allowed origins"**

---

## 📚 Recursos Adicionales

- [Documentación oficial de Supabase](https://supabase.com/docs)
- [Guía de JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Comunidad de Supabase](https://github.com/supabase/supabase/discussions)

---

## ✅ Checklist de Configuración

- [ ] Cuenta de Supabase creada
- [ ] Proyecto creado
- [ ] Tablas creadas (`customers` y `stamp_history`)
- [ ] Credenciales copiadas
- [ ] Variables de entorno configuradas
- [ ] Servidor reiniciado
- [ ] Conexión probada
- [ ] Datos migrados (si aplica)
- [ ] Seguridad configurada

---

**¡Listo!** Tu aplicación ACRILCARD ahora está conectada a Supabase y tus datos están en la nube. 🎉
