# 🔄 Guía de Actualización - ACRILCARD

**Proyecto:** ACRILCARD - Sistema de Fidelización Digital  
**Stack:** React + GitHub + Netlify  
**Última actualización:** 24 de Octubre, 2025

---

## 📋 ÍNDICE

1. [Flujo de Trabajo Completo](#flujo-de-trabajo-completo)
2. [Comandos Git Básicos](#comandos-git-básicos)
3. [Buenas Prácticas](#buenas-prácticas)
4. [Ejemplos Prácticos](#ejemplos-prácticos)
5. [Solución de Problemas](#solución-de-problemas)
6. [Recursos Adicionales](#recursos-adicionales)

---

## 🚀 FLUJO DE TRABAJO COMPLETO

### **Proceso en 4 Pasos:**

```
1. EDITAR CÓDIGO → 2. GIT COMMIT → 3. GIT PUSH → 4. NETLIFY DEPLOY (Automático)
```

### **Diagrama Visual:**

```
┌─────────────────────────────────────────────┐
│  PASO 1: EDITAR CÓDIGO                      │
│  - Modificar archivos en VS Code            │
│  - Probar localmente: npm start             │
│  - Verificar que funcione correctamente     │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  PASO 2: AGREGAR CAMBIOS                    │
│  Comando: git add .                         │
│  Agrega todos los archivos modificados      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  PASO 3: HACER COMMIT                       │
│  Comando: git commit -m "mensaje"           │
│  Guarda los cambios con descripción         │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  PASO 4: SUBIR A GITHUB                     │
│  Comando: git push origin master            │
│  Sube el código al repositorio              │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  PASO 5: NETLIFY (AUTOMÁTICO)               │
│  ✅ Detecta cambios automáticamente         │
│  ✅ Ejecuta npm install                     │
│  ✅ Ejecuta npm run build                   │
│  ✅ Publica sitio actualizado               │
│  ⏱️ Tiempo: 2-3 minutos                     │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  ✅ SITIO ACTUALIZADO EN PRODUCCIÓN         │
│  URL: https://tu-sitio.netlify.app         │
└─────────────────────────────────────────────┘
```

---

## 💻 COMANDOS GIT BÁSICOS

### **Comandos Esenciales:**

```bash
# 1. Ver estado actual (qué archivos cambiaron)
git status

# 2. Agregar todos los cambios
git add .

# 3. Hacer commit con mensaje
git commit -m "Descripción de los cambios"

# 4. Subir a GitHub
git push origin master

# 5. Ver historial de commits
git log --oneline -10
```

### **Comando Todo-en-Uno (Rápido):**

```bash
git add . && git commit -m "Actualización rápida" && git push origin master
```

---

## 📝 BUENAS PRÁCTICAS

### **1. Mensajes de Commit Descriptivos**

#### **Formato Recomendado:**

```
tipo: descripción breve

Tipos:
- feat:     Nueva funcionalidad
- fix:      Corrección de bug
- style:    Cambios de diseño/CSS
- refactor: Mejorar código sin cambiar funcionalidad
- docs:     Actualizar documentación
- chore:    Tareas de mantenimiento
- perf:     Mejoras de rendimiento
- test:     Agregar o modificar tests
```

#### **Ejemplos Buenos:**

```bash
✅ git commit -m "feat: Agregar filtro por fecha en reportes"
✅ git commit -m "fix: Corregir cálculo de sellos en CustomerDetails"
✅ git commit -m "style: Mejorar diseño del modal de WhatsApp"
✅ git commit -m "refactor: Optimizar función de búsqueda"
✅ git commit -m "docs: Actualizar README con instrucciones"
```

#### **Ejemplos Malos (Evitar):**

```bash
❌ git commit -m "cambios"
❌ git commit -m "update"
❌ git commit -m "fix"
❌ git commit -m "asdfasdf"
```

### **2. Commits Frecuentes**

✅ **Mejor:** Muchos commits pequeños y específicos
```bash
git commit -m "feat: Agregar botón de exportar"
git commit -m "style: Mejorar colores del botón"
git commit -m "fix: Corregir error al exportar"
```

❌ **Evitar:** Un commit gigante con todo
```bash
git commit -m "Cambios varios del día"
```

### **3. Probar Antes de Subir**

```bash
# Siempre probar localmente antes de push
npm start

# Verificar que no haya errores
npm run build
```

---

## 🎯 EJEMPLOS PRÁCTICOS

### **Ejemplo 1: Actualizar un Componente**

**Escenario:** Modificaste `CustomerDetails.jsx` para mejorar el diseño.

```bash
# 1. Ver qué cambió
git status

# 2. Agregar cambios
git add .

# 3. Commit con mensaje descriptivo
git commit -m "style: Mejorar diseño de CustomerDetails con nuevos colores"

# 4. Subir a GitHub
git push origin master

# 5. Esperar 2-3 minutos
# 6. Verificar en https://tu-sitio.netlify.app
```

### **Ejemplo 2: Corregir un Bug**

**Escenario:** El botón de WhatsApp no funcionaba correctamente.

```bash
git status
git add .
git commit -m "fix: Corregir envío de mensajes de WhatsApp en CustomerDetails"
git push origin master
```

### **Ejemplo 3: Agregar Nueva Funcionalidad**

**Escenario:** Agregaste una nueva página de estadísticas.

```bash
git status
git add .
git commit -m "feat: Agregar página de estadísticas avanzadas con gráficos"
git push origin master
```

### **Ejemplo 4: Actualizar Documentación**

**Escenario:** Actualizaste el README.

```bash
git add .
git commit -m "docs: Actualizar README con instrucciones de instalación"
git push origin master
```

### **Ejemplo 5: Múltiples Archivos**

**Escenario:** Modificaste varios componentes y estilos.

```bash
git status
# Verás algo como:
# modified: src/components/CustomerList.jsx
# modified: src/components/CustomerDetails.jsx
# modified: src/index.css

git add .
git commit -m "refactor: Mejorar estructura de componentes de clientes"
git push origin master
```

---

## 🔍 COMANDOS ÚTILES ADICIONALES

### **Ver Cambios Antes de Commit:**

```bash
# Ver diferencias en archivos modificados
git diff

# Ver diferencias de un archivo específico
git diff src/components/CustomerDetails.jsx
```

### **Deshacer Cambios:**

```bash
# Deshacer cambios en un archivo (antes de add)
git checkout -- archivo.js

# Deshacer todos los cambios (antes de add)
git checkout -- .

# Quitar archivo del staging (después de add, antes de commit)
git restore --staged archivo.js
```

### **Ver Historial:**

```bash
# Ver últimos 10 commits
git log --oneline -10

# Ver historial completo con detalles
git log

# Ver cambios de un commit específico
git show COMMIT_HASH
```

### **Información del Repositorio:**

```bash
# Ver URL del repositorio remoto
git remote -v

# Ver rama actual
git branch

# Ver todos los archivos trackeados
git ls-files
```

---

## 🛠️ SOLUCIÓN DE PROBLEMAS

### **Problema 1: "No se puede hacer push"**

**Error:**
```
! [rejected] master -> master (fetch first)
```

**Solución:**
```bash
# Descargar cambios del servidor primero
git pull origin master

# Luego hacer push
git push origin master
```

### **Problema 2: "Conflictos al hacer pull"**

**Error:**
```
CONFLICT (content): Merge conflict in archivo.js
```

**Solución:**
1. Abre el archivo con conflicto
2. Busca las marcas: `<<<<<<<`, `=======`, `>>>>>>>`
3. Edita manualmente para resolver
4. Guarda el archivo
5. Ejecuta:
```bash
git add .
git commit -m "fix: Resolver conflictos de merge"
git push origin master
```

### **Problema 3: "Olvidé agregar un archivo"**

**Solución:**
```bash
# Agregar el archivo olvidado
git add archivo-olvidado.js

# Modificar el último commit
git commit --amend --no-edit

# Forzar push (solo si no lo han descargado otros)
git push origin master --force
```

### **Problema 4: "Commit con mensaje incorrecto"**

**Solución:**
```bash
# Cambiar mensaje del último commit
git commit --amend -m "Nuevo mensaje correcto"

# Push (puede requerir --force si ya se subió)
git push origin master --force
```

### **Problema 5: "Deploy falla en Netlify"**

**Pasos para diagnosticar:**

1. Ve a Netlify Dashboard
2. Deploys → Ver el deploy fallido
3. Revisa los logs de error
4. Errores comunes:
   - Falta archivo `public/index.html` → Verificar `.gitignore`
   - Error en `npm install` → Verificar `package.json`
   - Error en `npm run build` → Probar localmente primero

**Solución general:**
```bash
# Probar build localmente
npm run build

# Si funciona local pero falla en Netlify:
# - Verificar variables de entorno en Netlify
# - Verificar que todos los archivos estén en GitHub
# - Revisar logs de Netlify para error específico
```

---

## 📊 VERIFICAR DEPLOY EN NETLIFY

### **Opción 1: Dashboard Web**

1. Ve a: https://app.netlify.com
2. Selecciona tu sitio: **Acril-Card-control**
3. Tab **"Deploys"**
4. Verás:
   - 🟢 **Published** - Deploy exitoso
   - 🟡 **Building** - En proceso
   - 🔴 **Failed** - Error (revisar logs)

### **Opción 2: Notificaciones por Email**

Netlify envía emails automáticos:
- ✅ **Deploy succeeded** - Todo bien
- ❌ **Deploy failed** - Revisar error
- ⚠️ **Deploy with warnings** - Funciona pero hay advertencias

### **Opción 3: Ver Logs en Tiempo Real**

1. Netlify Dashboard → Deploys
2. Clic en el deploy en progreso
3. Ver logs en tiempo real
4. Identificar errores si los hay

---

## 🎯 WORKFLOW COMPLETO PASO A PASO

### **Actualización Típica:**

```bash
# 1. Asegurarte de estar en la carpeta correcta
cd c:\Users\USUARIO\Desktop\Editable\Acril-Card-control

# 2. Ver estado actual
git status

# 3. Probar cambios localmente
npm start
# Verificar que todo funcione
# Ctrl+C para detener

# 4. Agregar cambios
git add .

# 5. Ver qué se va a subir
git status

# 6. Hacer commit
git commit -m "feat: Descripción de los cambios"

# 7. Subir a GitHub
git push origin master

# 8. Esperar 2-3 minutos

# 9. Verificar en navegador
# https://tu-sitio.netlify.app

# 10. Verificar en Netlify Dashboard
# https://app.netlify.com
```

---

## 🔐 CONFIGURACIÓN INICIAL (Solo una vez)

### **Configurar Git (Si no lo hiciste):**

```bash
# Configurar nombre
git config --global user.name "Tu Nombre"

# Configurar email
git config --global user.email "tu-email@example.com"

# Verificar configuración
git config --list
```

### **Guardar Credenciales de GitHub:**

```bash
# Windows - Guardar credenciales permanentemente
git config --global credential.helper wincred

# Después del primer push, no pedirá contraseña de nuevo
```

---

## 📚 RECURSOS ADICIONALES

### **Documentación Oficial:**

- **Git:** https://git-scm.com/doc
- **GitHub:** https://docs.github.com
- **Netlify:** https://docs.netlify.com
- **React:** https://react.dev

### **Herramientas Visuales:**

#### **GitHub Desktop** (Recomendado para principiantes)
- **Descarga:** https://desktop.github.com/
- **Ventajas:**
  - Interfaz visual (sin comandos)
  - Ver cambios fácilmente
  - Hacer commits con clicks
  - Sincronizar con GitHub

#### **VS Code Git Integration**
- Ya integrado en VS Code
- Panel "Source Control" (Ctrl+Shift+G)
- Ver cambios, hacer commits, push
- Extensiones recomendadas:
  - GitLens
  - Git Graph
  - Git History

### **Cheat Sheets:**

- **Git Cheat Sheet:** https://education.github.com/git-cheat-sheet-education.pdf
- **GitHub Flow:** https://guides.github.com/introduction/flow/

---

## ⚡ ATAJOS Y TIPS

### **Alias Útiles (Opcional):**

Agregar al archivo `.gitconfig`:

```bash
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = log --graph --oneline --all
```

Uso:
```bash
git st      # En lugar de git status
git ci -m   # En lugar de git commit -m
git last    # Ver último commit
```

### **Comandos Rápidos:**

```bash
# Ver cambios + agregar + commit + push (todo en uno)
git status && git add . && git commit -m "Actualización" && git push origin master

# Ver últimos 5 commits con detalles
git log --oneline --graph -5

# Buscar en commits
git log --grep="WhatsApp"

# Ver archivos modificados en último commit
git show --name-only
```

---

## 📞 CONTACTO Y SOPORTE

### **Si Tienes Problemas:**

1. **Revisar esta guía** - La mayoría de problemas están documentados
2. **Ver logs de Netlify** - Identificar error específico
3. **Probar localmente** - `npm start` y `npm run build`
4. **Revisar GitHub** - Verificar que archivos se subieron
5. **Buscar el error** - Google + Stack Overflow

### **Recursos de Ayuda:**

- **Stack Overflow:** https://stackoverflow.com/questions/tagged/git
- **GitHub Community:** https://github.community/
- **Netlify Support:** https://answers.netlify.com/

---

## ✅ CHECKLIST DE ACTUALIZACIÓN

Usa este checklist cada vez que actualices:

- [ ] Código modificado y probado localmente (`npm start`)
- [ ] Build funciona sin errores (`npm run build`)
- [ ] Cambios agregados (`git add .`)
- [ ] Commit con mensaje descriptivo (`git commit -m "..."`)
- [ ] Push a GitHub (`git push origin master`)
- [ ] Verificar deploy en Netlify (2-3 minutos)
- [ ] Probar sitio en producción
- [ ] Verificar funcionalidad modificada
- [ ] Probar en móvil (si aplica)

---

## 🎉 RESUMEN RÁPIDO

**Para actualizar tu sitio en producción:**

```bash
# 1. Edita código
# 2. Prueba localmente
npm start

# 3. Sube a GitHub
git add .
git commit -m "Descripción de cambios"
git push origin master

# 4. Espera 2-3 minutos
# 5. ¡Sitio actualizado!
```

**URLs Importantes:**
- **Repositorio:** https://github.com/acrilpinturascrm-svg/Acril-Card-control
- **Netlify Dashboard:** https://app.netlify.com
- **Sitio en Producción:** https://tu-sitio.netlify.app

---

## 📝 NOTAS FINALES

- ✅ **Siempre probar localmente** antes de hacer push
- ✅ **Commits frecuentes** son mejores que uno grande
- ✅ **Mensajes descriptivos** ayudan a entender el historial
- ✅ **Netlify es automático** - solo haz push y espera
- ✅ **Guarda esta guía** para referencia futura

---

**Última actualización:** 24 de Octubre, 2025  
**Versión:** 1.0  
**Autor:** Documentación ACRILCARD  
**Proyecto:** Sistema de Fidelización Digital

---

**¡Éxito con tus actualizaciones!** 🚀
