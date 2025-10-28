/**
 * Cliente de Supabase para ACRILCARD
 * 
 * Este archivo configura y exporta el cliente de Supabase
 * para interactuar con la base de datos en la nube.
 * 
 * Documentación: https://supabase.com/docs/reference/javascript
 */

import { createClient } from '@supabase/supabase-js';

// Obtener credenciales de las variables de entorno
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// DEBUG: Mostrar estado de configuración
console.log('🔍 DEBUG Supabase Config:');
console.log('  URL:', supabaseUrl ? '✅ Configurado' : '❌ NO configurado');
console.log('  Key:', supabaseAnonKey ? '✅ Configurado' : '❌ NO configurado');

// Validar que las credenciales estén configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase no está configurado correctamente. ' +
    'Por favor, configura REACT_APP_SUPABASE_URL y REACT_APP_SUPABASE_ANON_KEY en tu archivo .env'
  );
}

// Crear y exportar el cliente de Supabase
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'acrilcard'
    }
  }
});

// Helper para verificar si Supabase está configurado
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// Helper para manejar errores de Supabase
export const handleSupabaseError = (error) => {
  if (!error) return null;
  
  console.error('Supabase Error:', error);
  
  // Mensajes de error personalizados
  const errorMessages = {
    '23505': 'Este registro ya existe',
    '23503': 'No se puede eliminar porque tiene datos relacionados',
    '42P01': 'La tabla no existe. Por favor, ejecuta las migraciones',
    'PGRST116': 'No se encontraron resultados',
  };
  
  const code = error.code || error.status;
  return errorMessages[code] || error.message || 'Error desconocido';
};

export default supabase;
