/**
 * Utilidades para codificar/decodificar datos de clientes en URLs
 * Usado como fallback cuando Supabase no está disponible
 */

/**
 * Codifica los datos del cliente en base64 para incluir en URL
 * @param {Object} customer - Objeto del cliente
 * @returns {string} - Datos codificados en base64
 */
export function encodeCustomerData(customer) {
  try {
    // Seleccionar solo los datos necesarios para la tarjeta pública
    const publicData = {
      name: customer.name || '',
      code: customer.code || '',
      stamps: customer.stamps || 0,
      // Incluir solo las últimas 5 compras para mantener URL corta
      purchaseHistory: (customer.purchaseHistory || []).slice(-5)
    };

    // Convertir a JSON y codificar en base64
    const jsonString = JSON.stringify(publicData);
    const encoded = btoa(encodeURIComponent(jsonString));
    
    return encoded;
  } catch (error) {
    console.error('Error al codificar datos del cliente:', error);
    return null;
  }
}

/**
 * Decodifica los datos del cliente desde base64
 * @param {string} encodedData - Datos codificados en base64
 * @returns {Object|null} - Objeto del cliente o null si falla
 */
export function decodeCustomerData(encodedData) {
  try {
    if (!encodedData) return null;

    // Decodificar de base64 y parsear JSON
    const jsonString = decodeURIComponent(atob(encodedData));
    const customerData = JSON.parse(jsonString);

    // Validar que tenga los campos mínimos requeridos
    if (!customerData.name || !customerData.code) {
      console.error('Datos del cliente incompletos');
      return null;
    }

    return customerData;
  } catch (error) {
    console.error('Error al decodificar datos del cliente:', error);
    return null;
  }
}

/**
 * Genera un enlace completo con datos del cliente codificados
 * @param {string} baseUrl - URL base de la aplicación
 * @param {Object} customer - Objeto del cliente
 * @returns {string} - URL completa con datos codificados
 */
export function generateCustomerLink(baseUrl, customer) {
  try {
    const encodedData = encodeCustomerData(customer);
    
    if (!encodedData) {
      // Fallback: usar solo el código del cliente
      return `${baseUrl}/card?customer=${encodeURIComponent(customer.code)}`;
    }

    // Incluir tanto el código como los datos codificados
    // El código permite búsqueda en Supabase, los datos son fallback
    return `${baseUrl}/card?customer=${encodeURIComponent(customer.code)}&data=${encodedData}`;
  } catch (error) {
    console.error('Error al generar enlace del cliente:', error);
    // Fallback seguro
    return `${baseUrl}/card?customer=${encodeURIComponent(customer.code)}`;
  }
}
