/**
 * Utilidad centralizada para obtener la URL pública correcta de la aplicación
 * Maneja correctamente GitHub Pages con subdirectorios
 */

/**
 * Obtiene la URL pública base de la aplicación
 * Prioridad:
 * 1. REACT_APP_PUBLIC_BASE_URL (variable de entorno)
 * 2. window.__PUBLIC_BASE_URL__ (variable global)
 * 3. Construcción automática desde window.location + basename
 * 
 * @param {string} overrideUrl - URL opcional para sobrescribir
 * @returns {string} URL pública completa (sin trailing slash)
 */
export function getPublicBaseUrl(overrideUrl = null) {
  // 1. Override manual
  if (overrideUrl) {
    return String(overrideUrl).replace(/\/$/, '');
  }

  // 2. Variable de entorno (RECOMENDADO para producción)
  if (process.env.REACT_APP_PUBLIC_BASE_URL) {
    return String(process.env.REACT_APP_PUBLIC_BASE_URL).replace(/\/$/, '');
  }

  // 3. Variable global
  if (typeof window !== 'undefined' && window.__PUBLIC_BASE_URL__) {
    return String(window.__PUBLIC_BASE_URL__).replace(/\/$/, '');
  }

  // 4. Construcción automática para GitHub Pages
  if (typeof window !== 'undefined' && window.location) {
    const { origin, pathname } = window.location;
    
    // Detectar si estamos en GitHub Pages
    if (origin.includes('github.io')) {
      // Extraer el nombre del repositorio del pathname
      // Ejemplo: /Acril-Card-control/card -> /Acril-Card-control
      const pathParts = pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        const repoName = pathParts[0];
        return `${origin}/${repoName}`;
      }
    }

    // Para otros dominios de producción
    if (origin.includes('netlify.app') || 
        origin.includes('vercel.app') || 
        origin.includes('herokuapp.com') ||
        origin.includes('firebase.app') ||
        (!origin.includes('localhost') && !origin.includes('127.0.0.1'))) {
      return origin;
    }

    // Desarrollo local
    return origin;
  }

  // Fallback
  return 'http://localhost:3000';
}

/**
 * Valida si la URL pública está correctamente configurada
 * @returns {Object} Resultado de la validación
 */
export function validatePublicUrl() {
  const url = getPublicBaseUrl();
  const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');
  const isProduction = !isLocalhost;
  const hasEnvVar = Boolean(process.env.REACT_APP_PUBLIC_BASE_URL);

  return {
    url,
    isLocalhost,
    isProduction,
    hasEnvVar,
    isValid: isProduction || hasEnvVar,
    warnings: isLocalhost && !hasEnvVar ? [
      'URL base es localhost - los clientes no podrán acceder a sus tarjetas',
      'Configure REACT_APP_PUBLIC_BASE_URL en .env.production'
    ] : []
  };
}

/**
 * Obtiene la URL completa para la tarjeta de un cliente
 * @param {string} customerCode - Código del cliente
 * @param {Object} options - Opciones adicionales
 * @returns {string} URL completa de la tarjeta
 */
export function getCustomerCardUrl(customerCode, options = {}) {
  const baseUrl = getPublicBaseUrl(options.baseUrl);
  const params = new URLSearchParams();
  
  params.set('customer', customerCode);
  
  // Agregar parámetros de tracking si se especifican
  if (options.utm_source) params.set('utm_source', options.utm_source);
  if (options.utm_medium) params.set('utm_medium', options.utm_medium);
  if (options.utm_campaign) params.set('utm_campaign', options.utm_campaign);
  if (options.ref) params.set('ref', options.ref);
  
  // Agregar datos codificados si existen
  if (options.encodedData) params.set('data', options.encodedData);
  
  return `${baseUrl}/card?${params.toString()}`;
}

export default {
  getPublicBaseUrl,
  validatePublicUrl,
  getCustomerCardUrl
};
