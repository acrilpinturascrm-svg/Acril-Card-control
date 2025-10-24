🔐 SISTEMA DE RESET - INSTRUCCIONES QUE ME DISTE
Activación del Reset:
Combinación de teclas: Ctrl + Shift + D presionado 3 veces seguidas en la pantalla de login
Código secreto: Debe ser configurable y fácil de cambiar por el desarrollador
Ejemplo de código: RESET_STAMPCARD_2025
Funcionalidad:
Al presionar Ctrl + Shift + D x3, debe aparecer un modal/campo oculto
El usuario debe ingresar el código secreto
Si el código es correcto, se muestra un modal de confirmación con:
Estadísticas del sistema actual (clientes, usuarios, etc.)
Opción de hacer backup antes de resetear
Botón de confirmación final
Si falla 3 veces, bloquear por 5 minutos
Seguridad:
El código NO debe estar visible en DevTools
El código NO debe estar en localStorage
Debe estar en un archivo de configuración separado (resetConfig.js)
Fácil de cambiar por el desarrollador sin tocar el código principal
Backup Pre-Reset:
Opcional pero recomendado
Descarga automática de JSON con todos los datos
Nombre del archivo con timestamp

🔐 CREDENCIALES POR DEFECTO - ELIMINADAS EN v1.2.1
❌ Credenciales Antiguas (REMOVIDAS):
Admin: admin/admin123 (28 permisos)
Empleado: empleado/empleado123 (8 permisos)
✅ Sistema Actual (v1.2.1):
⚠️ ELIMINADAS EN v1.2.1 (Producción-Ready)
- Sistema ahora requiere InitialSetup obligatorio
- No hay usuarios por defecto
- No hay credenciales hardcodeadas
- Para resetear: Ctrl+Shift+D x3 + código secreto
- Código secreto: RESET_STAMPCARD_2025 (configurable en resetConfig.js)
