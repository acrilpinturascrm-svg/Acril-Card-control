/**
 * Utilidad mejorada para enviar la tarjeta del cliente por WhatsApp Web.
 * - Configuración automática para producción
 * - Soporte para múltiples países y códigos de área
 * - Detección inteligente de plataforma
 * - Fallbacks robustos para diferentes escenarios
 *
 * Configuración de la URL pública (prioridad):
 * 1) opciones.baseUrl (parámetro)
 * 2) window.__PUBLIC_BASE_URL__ (variable global)
 * 3) process.env.REACT_APP_PUBLIC_BASE_URL (variable de entorno)
 * 4) Detección automática de dominio de producción
 * 5) window.location.origin (fallback para desarrollo local)
 */

import { encodeCustomerData } from './customerDataEncoder.js';
import { getPublicBaseUrl as getPublicBaseUrlUtil } from './publicUrl.js';

// Referencia global para la ventana de WhatsApp
let whatsappWindow = null;

// Configuración de países soportados
const COUNTRY_CONFIGS = {
  VE: { code: '58', name: 'Venezuela', phoneLength: 10 },
  MX: { code: '52', name: 'México', phoneLength: 10 },
  CO: { code: '57', name: 'Colombia', phoneLength: 10 },
  AR: { code: '54', name: 'Argentina', phoneLength: 10 },
  PE: { code: '51', name: 'Perú', phoneLength: 9 },
  EC: { code: '593', name: 'Ecuador', phoneLength: 9 },
  CL: { code: '56', name: 'Chile', phoneLength: 9 },
  US: { code: '1', name: 'Estados Unidos', phoneLength: 10 }
};

// Detectar país basado en configuración o ubicación
function detectCountry() {
  // Prioridad: variable de entorno
  const envCountry = process.env.REACT_APP_COUNTRY_CODE;
  if (envCountry && COUNTRY_CONFIGS[envCountry.toUpperCase()]) {
    return envCountry.toUpperCase();
  }

  // Detectar por zona horaria (aproximado)
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.includes('Caracas') || timezone.includes('Venezuela')) return 'VE';
    if (timezone.includes('Mexico') || timezone.includes('Tijuana')) return 'MX';
    if (timezone.includes('Bogota') || timezone.includes('Colombia')) return 'CO';
    if (timezone.includes('Argentina') || timezone.includes('Buenos_Aires')) return 'AR';
    if (timezone.includes('Lima') || timezone.includes('Peru')) return 'PE';
    if (timezone.includes('Guayaquil') || timezone.includes('Ecuador')) return 'EC';
    if (timezone.includes('Santiago') || timezone.includes('Chile')) return 'CL';
    if (timezone.includes('New_York') || timezone.includes('Los_Angeles')) return 'US';
  } catch (error) {
    console.warn('No se pudo detectar zona horaria:', error);
  }

  // Por defecto: Venezuela (país original del proyecto)
  return 'VE';
}

function getPublicBaseUrl(overrideBaseUrl) {
  // Usar la utilidad centralizada que maneja correctamente GitHub Pages
  return getPublicBaseUrlUtil(overrideBaseUrl);
}

function toDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

/**
 * Envía por WhatsApp el link a la tarjeta de sellos del cliente.
 * @param {string} telefonoCliente - Número de 10 dígitos, sin símbolos (ej: "5512345678")
 * @param {string} nombreCliente - Nombre del cliente (ej: "Ana García")
 * @param {string|number} idCliente - ID del cliente (ej: "123")
 * @param {Object} [opciones]
 * @param {string} [opciones.baseUrl] - URL pública base (ej: "https://xxxx.ngrok.io")
 * @param {number} [opciones.sellos] - Cantidad de sellos actuales (por defecto 5)
 * @param {Array} [opciones.purchaseHistory] - Historial de compras del cliente
 * @param {number} [opciones.stamps] - Sellos totales del cliente
 * @param {number} [opciones.stampsPerReward] - Sellos necesarios para un premio
 */
export function enviarTarjetaPorWhatsApp(telefonoCliente, nombreCliente, idCliente, opciones = {}) {
  try {
    // Si hay un mensaje personalizado, usarlo directamente
    if (opciones.customMessage) {
      const base = getPublicBaseUrl(opciones.baseUrl);
      const country = detectCountry();
      const countryConfig = COUNTRY_CONFIGS[country];
      const countryCodeFromConfig = opciones.countryCode || countryConfig.code;
      const phoneDigits = toDigits(telefonoCliente);
      const normalizedPhone = phoneDigits.slice(-countryConfig.phoneLength);
      const numeroWhatsApp = `${countryCodeFromConfig}${normalizedPhone}`;
      
      const ua = (typeof navigator !== 'undefined' ? navigator.userAgent : '') || '';
      const isDesktop = /Windows|Macintosh|Linux/i.test(ua) && !/Mobile/i.test(ua);
      
      let targetUrl = '';
      if (isDesktop) {
        targetUrl = `https://web.whatsapp.com/send?phone=${encodeURIComponent(numeroWhatsApp)}&text=${encodeURIComponent(opciones.customMessage)}`;
      } else {
        targetUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(numeroWhatsApp)}&text=${encodeURIComponent(opciones.customMessage)}`;
      }
      
      if (targetUrl) {
        // Verificar si la ventana anterior sigue abierta y es válida
        if (whatsappWindow && !whatsappWindow.closed) {
          try {
            // Reutilizar la ventana existente
            whatsappWindow.location.href = targetUrl;
            whatsappWindow.focus();
            return true;
          } catch (error) {
            // Si hay error de acceso, la ventana no es válida
            console.warn('No se pudo reutilizar ventana de WhatsApp:', error);
            whatsappWindow = null;
          }
        }
        
        // Abrir nueva ventana y guardar referencia
        whatsappWindow = window.open(targetUrl, 'acrilcard_whatsapp', 'noopener,noreferrer');
        
        if (whatsappWindow) {
          whatsappWindow.focus();
          return true;
        }
      }
      return false;
    }
    
    const base = getPublicBaseUrl(opciones.baseUrl);
    
    // Detectar configuración del país
    const country = detectCountry();
    const countryConfig = COUNTRY_CONFIGS[country];
    const countryCodeFromConfig = opciones.countryCode || countryConfig.code;
    const expectedPhoneLength = countryConfig.phoneLength;

    // Normalizar número según el país
    const phoneDigits = toDigits(telefonoCliente);
    let normalizedPhone = phoneDigits;

    // Validar longitud según el país
    if (phoneDigits.length < expectedPhoneLength) {
      alert(`El número debe tener al menos ${expectedPhoneLength} dígitos para ${countryConfig.name}.`);
      return false;
    }

    // Tomar los últimos dígitos según el país
    normalizedPhone = phoneDigits.slice(-expectedPhoneLength);

    // Construir número completo para WhatsApp
    const numeroWhatsApp = `${countryCodeFromConfig}${normalizedPhone}`;

    // Validar que el link funcionará en producción
    if (base.includes('localhost') && !opciones.allowLocalhost) {
      const shouldContinue = confirm(
        '⚠️ ADVERTENCIA: Está usando localhost. El cliente no podrá ver su tarjeta.\n\n' +
        '¿Desea continuar de todas formas? (Para producción, configure REACT_APP_PUBLIC_BASE_URL)'
      );
      if (!shouldContinue) return false;
    }

    // Construir datos del cliente para codificar en URL (sistema híbrido optimizado)
    // Solo datos esenciales: nombre, código y sellos (sin historial)
    const customerData = {
      name: nombreCliente,
      code: opciones.customerCode || idCliente,
      stamps: opciones.stamps || 0
      // Historial eliminado para URLs más cortas
    };
    
    // Codificar datos con compresión usando función importada
    let encodedData = '';
    try {
      encodedData = encodeCustomerData(customerData);
    } catch (error) {
      console.warn('No se pudieron codificar datos del cliente:', error);
      // Fallback: codificación simple sin compresión
      try {
        const jsonString = JSON.stringify(customerData);
        encodedData = btoa(encodeURIComponent(jsonString));
      } catch (fallbackError) {
        console.error('Error en fallback de codificación:', fallbackError);
      }
    }
    
    // Construir link público con parámetros adicionales para mejor tracking
    const linkParams = new URLSearchParams({
      utm_source: 'whatsapp',
      utm_medium: 'message',
      utm_campaign: 'loyalty_card',
      ref: 'wa'
    });
    
    // Usar customerCode si está disponible, sino usar idCliente como fallback
    const customerIdentifier = opciones.customerCode || idCliente;
    
    // Usar ruta /card para vista pública (no requiere autenticación)
    // Incluir datos codificados para sistema híbrido
    let linkTarjeta = `${base}/card?customer=${encodeURIComponent(customerIdentifier)}`;
    if (encodedData) {
      linkTarjeta += `&data=${encodedData}`;
    }
    linkTarjeta += `&${linkParams.toString()}`;

    // Datos del cliente para mensaje personalizado
    const sellosActuales = Number.isFinite(opciones.stamps) ? opciones.stamps : 0;
    const stampsPerReward = Number.isFinite(opciones.stampsPerReward) ? opciones.stampsPerReward : 10;
    const purchaseHistory = Array.isArray(opciones.purchaseHistory) ? opciones.purchaseHistory : [];
    const businessName = opciones.businessName || 'ACRIL Pinturas';

    // Calcular información del premio
    const premiosCompletos = Math.floor(sellosActuales / stampsPerReward);
    const sellosEnTarjetaActual = sellosActuales % stampsPerReward;
    const sellosFaltantes = stampsPerReward - sellosEnTarjetaActual;
    const tienePremioPendiente = premiosCompletos > 0;

    // Obtener información de la última compra
    const ultimaCompra = purchaseHistory.length > 0 ? purchaseHistory[purchaseHistory.length - 1] : null;
    const montoUltimaCompra = ultimaCompra && ultimaCompra.amount > 0 ? 
      `$${ultimaCompra.amount.toLocaleString()}` : null;

    // Saludo personalizado por hora y país
    const ahora = new Date();
    const hora = ahora.getHours();
    let saludo = '¡Hola';
    
    if (country === 'VE' || country === 'CO') {
      if (hora >= 6 && hora < 12) saludo = '¡Buenos días';
      else if (hora >= 12 && hora < 18) saludo = '¡Buenas tardes';
      else saludo = '¡Buenas noches';
    } else if (country === 'MX') {
      if (hora >= 6 && hora < 12) saludo = '¡Buenos días';
      else if (hora >= 12 && hora < 20) saludo = '¡Buenas tardes';
      else saludo = '¡Buenas noches';
    }

    // Construir mensaje dinámico e inteligente
    const nombre = (nombreCliente || 'cliente').toString().trim();
    let mensaje = `${saludo} ${nombre}! 👋\n\n`;
    
    // Agregar información de compra si está disponible
    if (montoUltimaCompra) {
      mensaje += `Gracias por tu compra de ${montoUltimaCompra} en ${businessName} 💚\n\n`;
    } else {
      mensaje += `Gracias por visitarnos en ${businessName} 💚\n\n`;
    }

    // Información de sellos
    mensaje += `🎯 *Tu tarjeta de fidelidad:*\n`;
    mensaje += `📍 Sellos actuales: *${sellosActuales}*\n`;
    
    if (tienePremioPendiente) {
      mensaje += `🎁 ¡Tienes *${premiosCompletos}* premio${premiosCompletos > 1 ? 's' : ''} disponible${premiosCompletos > 1 ? 's' : ''}!\n`;
    }
    
    if (sellosEnTarjetaActual > 0) {
      mensaje += `⭐ En tu tarjeta actual: ${sellosEnTarjetaActual}/${stampsPerReward}\n`;
      mensaje += `🎯 Te faltan *${sellosFaltantes}* sellos para tu próximo premio\n`;
    } else if (!tienePremioPendiente) {
      mensaje += `🎯 Necesitas ${stampsPerReward} sellos para tu primer premio\n`;
    }

    mensaje += `\n📱 *Ver tu tarjeta completa:*\n${linkTarjeta}\n\n`;
    mensaje += `¡Sigue acumulando sellos y obtén más premios! 🎉`;

    // Detectar plataforma y configurar URL apropiada
    const ua = (typeof navigator !== 'undefined' ? navigator.userAgent : '') || '';
    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isDesktop = /Windows|Macintosh|Linux/i.test(ua) && !/Mobile/i.test(ua);
    const preferBusiness = Boolean(opciones.preferBusiness);

    let targetUrl = '';
    let openMethod = 'redirect';

    if (isDesktop) {
      // Escritorio: WhatsApp Web
      targetUrl = `https://web.whatsapp.com/send?phone=${encodeURIComponent(numeroWhatsApp)}&text=${encodeURIComponent(mensaje)}`;
    } else if (isAndroid) {
      if (preferBusiness) {
        // Intentar WhatsApp Business primero
        try {
          const businessIntent = `intent://send?phone=${encodeURIComponent(numeroWhatsApp)}&text=${encodeURIComponent(mensaje)}#Intent;scheme=smsto;package=com.whatsapp.w4b;end`;
          window.location.href = businessIntent;
          return true;
        } catch (error) {
          console.warn('WhatsApp Business no disponible, usando WhatsApp normal');
        }
      }
      // WhatsApp normal para Android
      targetUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(numeroWhatsApp)}&text=${encodeURIComponent(mensaje)}`;
    } else if (isIOS) {
      // iOS: usar esquema de URL nativo si está disponible
      targetUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(numeroWhatsApp)}&text=${encodeURIComponent(mensaje)}`;
    } else {
      // Fallback general
      targetUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(numeroWhatsApp)}&text=${encodeURIComponent(mensaje)}`;
    }

    // Abrir WhatsApp reutilizando la misma pestaña si ya existe
    if (targetUrl) {
      // Verificar si la ventana anterior sigue abierta y es válida
      if (whatsappWindow && !whatsappWindow.closed) {
        try {
          // Reutilizar la ventana existente
          whatsappWindow.location.href = targetUrl;
          whatsappWindow.focus();
          return true;
        } catch (error) {
          // Si hay error de acceso, la ventana no es válida
          console.warn('No se pudo reutilizar ventana de WhatsApp:', error);
          whatsappWindow = null;
        }
      }
      
      // Abrir nueva ventana y guardar referencia
      whatsappWindow = window.open(targetUrl, 'acrilcard_whatsapp', 'noopener,noreferrer');
      
      if (whatsappWindow) {
        whatsappWindow.focus();
      }
      
      // Verificar si se abrió correctamente
      if (!whatsappWindow || whatsappWindow.closed || typeof whatsappWindow.closed === 'undefined') {
        // Si no se pudo abrir (bloqueador de pop-ups), mostrar opciones al usuario
        const userChoice = confirm(
          '⚠️ No se pudo abrir WhatsApp en una nueva pestaña.\n\n' +
          'Esto puede deberse a un bloqueador de ventanas emergentes.\n\n' +
          '¿Desea copiar el enlace de WhatsApp para abrirlo manualmente?\n\n' +
          '• Presione "Aceptar" para copiar el enlace\n' +
          '• Presione "Cancelar" para intentar de nuevo'
        );
        
        if (userChoice) {
          // Copiar enlace al portapapeles
          try {
            navigator.clipboard.writeText(targetUrl);
            alert('✅ Enlace de WhatsApp copiado al portapapeles.\n\nPégalo en una nueva pestaña para enviar el mensaje.');
          } catch (clipboardError) {
            // Fallback: mostrar el enlace para copiar manualmente
            prompt('Copie este enlace de WhatsApp:', targetUrl);
          }
        }
        
        return false;
      }
      
      return true;
    }

    return false;

  } catch (err) {
    console.error('Error al intentar abrir WhatsApp:', err);
    
    // Error más informativo para el usuario
    const errorMsg = `No se pudo abrir WhatsApp. Posibles causas:
    
• WhatsApp no está instalado
• El navegador bloqueó la ventana emergente
• Número de teléfono inválido: ${telefonoCliente}
• Problema de conexión

¿Desea copiar el número para contactar manualmente?`;

    if (confirm(errorMsg)) {
      // Copiar número al portapapeles
      const country = detectCountry();
      const countryConfig = COUNTRY_CONFIGS[country];
      const phoneDigits = toDigits(telefonoCliente).slice(-countryConfig.phoneLength);
      const fullNumber = `+${opciones.countryCode || countryConfig.code}${phoneDigits}`;
      
      try {
        navigator.clipboard.writeText(fullNumber);
        alert(`Número copiado: ${fullNumber}`);
      } catch (clipboardError) {
        prompt('Copie este número:', fullNumber);
      }
    }
    
    return false;
  }
}

// Función auxiliar para validar configuración de WhatsApp
export function validateWhatsAppConfig() {
  const issues = [];
  
  // Verificar URL base
  const baseUrl = getPublicBaseUrl();
  if (baseUrl.includes('localhost')) {
    issues.push({
      type: 'warning',
      message: 'URL base es localhost - los clientes no podrán acceder a sus tarjetas',
      solution: 'Configure REACT_APP_PUBLIC_BASE_URL con su dominio de producción'
    });
  }

  // Verificar país
  const country = detectCountry();
  const countryConfig = COUNTRY_CONFIGS[country];
  
  return {
    isValid: issues.filter(i => i.type === 'error').length === 0,
    issues,
    config: {
      baseUrl,
      country,
      countryName: countryConfig.name,
      countryCode: countryConfig.code,
      phoneLength: countryConfig.phoneLength
    }
  };
}

// Función para probar configuración de WhatsApp
export function testWhatsAppConfig() {
  const validation = validateWhatsAppConfig();
  
  console.group('🔧 Configuración de WhatsApp');
  console.log('URL Base:', validation.config.baseUrl);
  console.log('País:', validation.config.countryName);
  console.log('Código País:', validation.config.countryCode);
  console.log('Longitud Teléfono:', validation.config.phoneLength);
  
  if (validation.issues.length > 0) {
    console.warn('Problemas encontrados:');
    validation.issues.forEach(issue => {
      console.warn(`${issue.type.toUpperCase()}: ${issue.message}`);
      if (issue.solution) console.info(`Solución: ${issue.solution}`);
    });
  } else {
    console.log('✅ Configuración correcta');
  }
  
  console.groupEnd();
  
  return validation;
}
