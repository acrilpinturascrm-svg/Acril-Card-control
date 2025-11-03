/**
 * Utilidades para codificar/decodificar datos de clientes en URLs
 * Usado como fallback cuando Supabase no está disponible
 * Optimizado: Compresión + Solo datos esenciales (sin historial)
 */

import pako from 'pako';

/**
 * Codifica los datos del cliente con compresión para URLs cortas
 * @param {Object} customer - Objeto del cliente
 * @returns {string} - Datos comprimidos y codificados en base64
 */
export function encodeCustomerData(customer) {
  try {
    // Seleccionar SOLO los datos esenciales (sin historial de compras)
    const publicData = {
      n: customer.name || '',        // n = name (acortado)
      c: customer.code || '',         // c = code (acortado)
      s: customer.stamps || 0         // s = stamps (acortado)
    };

    // Convertir a JSON
    const jsonString = JSON.stringify(publicData);
    
    // Comprimir con pako (gzip)
    const compressed = pako.deflate(jsonString);
    
    // Convertir a base64 URL-safe
    const base64 = btoa(String.fromCharCode.apply(null, compressed));
    const urlSafe = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    
    return urlSafe;
  } catch (error) {
    console.error('Error al codificar datos del cliente:', error);
    return null;
  }
}

/**
 * Decodifica los datos del cliente desde formato comprimido
 * @param {string} encodedData - Datos comprimidos y codificados
 * @returns {Object|null} - Objeto del cliente o null si falla
 */
export function decodeCustomerData(encodedData) {
  try {
    if (!encodedData) return null;

    // Convertir de URL-safe base64 a base64 normal
    let base64 = encodedData.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    // Decodificar de base64
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Descomprimir con pako
    const decompressed = pako.inflate(bytes, { to: 'string' });
    
    // Parsear JSON
    const customerData = JSON.parse(decompressed);

    // Convertir propiedades acortadas a nombres completos
    const fullData = {
      name: customerData.n || '',
      code: customerData.c || '',
      stamps: customerData.s || 0,
      purchaseHistory: [] // Sin historial en URL
    };

    // Validar que tenga los campos mínimos requeridos
    if (!fullData.name || !fullData.code) {
      console.error('Datos del cliente incompletos');
      return null;
    }

    return fullData;
  } catch (error) {
    console.error('Error al decodificar datos del cliente:', error);
    return null;
  }
}

/**
 * Genera un enlace completo simplificado con el código del cliente
 * @param {string} baseUrl - URL base de la aplicación
 * @param {Object} customer - Objeto del cliente
 * @returns {string} - URL completa simplificada
 */
export function generateCustomerLink(baseUrl, customer) {
  try {
    // Link simplificado con solo el código del cliente (parámetro corto 'c')
    return `${baseUrl}/card?c=${encodeURIComponent(customer.code)}`;
  } catch (error) {
    console.error('Error al generar enlace del cliente:', error);
    // Fallback seguro
    return `${baseUrl}/card?c=${encodeURIComponent(customer.code || customer.id)}`;
  }
}
