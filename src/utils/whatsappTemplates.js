/**
 * Plantillas predeterminadas de WhatsApp - Centralizadas
 * Este archivo contiene todas las plantillas por defecto del sistema
 * para garantizar consistencia entre componentes.
 * 
 * @module whatsappTemplates
 */

/**
 * Plantillas por defecto con categorías
 * Estas plantillas están optimizadas para el negocio ACRIL Pinturas
 */
export const DEFAULT_TEMPLATES = [
  {
    id: 'welcome',
    name: 'Bienvenida',
    description: 'Para clientes nuevos',
    category: 'welcome',
    message: `¡Hola {nombre}! 👋

En Acril premiamos tu fidelidad, por eso le compartimos su tarjeta Acrilcard que por cada compra en tienda tendrá en su progreso una serie de descuentos del 5% para todos nuestros productos en los puestos 5 y 7 y en el puesto 10 un 5% + obsequio, que la disfrute al máximo, y además, ya contamos con Cashea, somos Acril economía de lujo!

🎯 Tu tarjeta de fidelidad:
📍 Sellos actuales: {sellos}
🎁 Necesitas {stampsPerReward} sellos para tu primer premio

📱 Ver tu tarjeta completa:
{link}

¡Gracias por elegirnos! 🎉`,
    isDefault: true
  },
  {
    id: 'stamps_added',
    name: 'Compra Recurrente',
    description: 'Cliente con compras previas',
    category: 'purchase',
    message: `¡Hola {nombre}! 👋

En Acril premiamos tu fidelidad, por eso le compartimos su avance de la tarjeta Acrilcard que por cada compra en tienda tendrá en su progreso una serie de descuentos del 5% para todos nuestros productos en los puestos 5 y 7 y en el puesto 10 un 5% + obsequio, que la disfrute al máximo, y además, ya contamos con Cashea, somos Acril economía de lujo!

🎯 Tu tarjeta de fidelidad:
📍 Sellos actuales: {sellos}
⭐ En tu tarjeta actual: {sellosEnTarjeta}/{stampsPerReward}
🎯 Te faltan {sellosFaltantes} sellos para tu próximo premio

📱 Ver tu tarjeta completa:
{link}

¡Sigue acumulando sellos! 🎉`,
    isDefault: true
  },
  {
    id: 'discount_5_7',
    name: 'Descuento 5% (Posición 5 o 7)',
    description: 'Cuando alcanza posición 5 o 7',
    category: 'discount',
    message: `¡Felicidades {nombre}! 🎉

¡Has alcanzado el puesto {sellosEnTarjeta} en tu tarjeta Acrilcard!

🎁 Tienes disponible un descuento del 5% en todos nuestros productos

Pasa por nuestra tienda para hacer efectivo tu descuento.

📱 Ver tu tarjeta:
{link}

En Acril premiamos tu fidelidad. ¡Somos Acril economía de lujo! 💚`,
    isDefault: true
  },
  {
    id: 'reward_complete',
    name: 'Premio Completo (Posición 10)',
    description: 'Cuando completa la tarjeta',
    category: 'reward',
    message: `¡FELICIDADES {nombre}! 🎉🎁

¡Has completado tu tarjeta Acrilcard!

🎁 Tienes disponible:
• 5% de descuento en todos nuestros productos
• Un obsequio especial

Pasa por nuestra tienda para reclamar tu premio.

📱 Ver tu tarjeta:
{link}

En Acril premiamos tu fidelidad. ¡Somos Acril economía de lujo! 💚`,
    isDefault: true
  },
  {
    id: 'reminder',
    name: 'Recordatorio',
    description: 'Para clientes inactivos',
    category: 'reminder',
    message: `¡Hola {nombre}! 👋

Te extrañamos en Acril Pinturas 💚

Tienes {sellos} sellos acumulados en tu tarjeta Acrilcard. ¡Estás cerca de obtener descuentos y premios!

🎯 Solo te faltan {sellosFaltantes} sellos para tu próximo beneficio

📱 Ver tu tarjeta:
{link}

¡Esperamos verte pronto! Somos Acril economía de lujo 🎉`,
    isDefault: true
  }
];

/**
 * Obtiene las plantillas predeterminadas
 * @returns {Array} Array de plantillas predeterminadas
 */
export function getDefaultTemplates() {
  // Retornar una copia profunda para evitar mutaciones
  return JSON.parse(JSON.stringify(DEFAULT_TEMPLATES));
}

/**
 * Obtiene todas las plantillas (guardadas + predeterminadas)
 * @returns {Array} Array de todas las plantillas disponibles
 */
export function getAllTemplates() {
  try {
    const savedTemplates = localStorage.getItem('whatsapp_templates');
    
    if (savedTemplates) {
      const parsed = JSON.parse(savedTemplates);
      // Si hay plantillas guardadas, retornarlas (ya incluyen las predeterminadas editadas)
      return parsed;
    }
    
    // Si no hay plantillas guardadas, retornar las predeterminadas
    return getDefaultTemplates();
  } catch (error) {
    console.error('Error al cargar plantillas:', error);
    // En caso de error, retornar las predeterminadas
    return getDefaultTemplates();
  }
}

/**
 * Guarda las plantillas en localStorage
 * @param {Array} templates - Array de plantillas a guardar
 */
export function saveTemplates(templates) {
  try {
    localStorage.setItem('whatsapp_templates', JSON.stringify(templates));
    return true;
  } catch (error) {
    console.error('Error al guardar plantillas:', error);
    return false;
  }
}

/**
 * Restaura las plantillas predeterminadas
 * @returns {boolean} True si se restauraron correctamente
 */
export function restoreDefaultTemplates() {
  try {
    localStorage.removeItem('whatsapp_templates');
    return true;
  } catch (error) {
    console.error('Error al restaurar plantillas:', error);
    return false;
  }
}

/**
 * Busca una plantilla por ID
 * @param {string} templateId - ID de la plantilla
 * @returns {Object|null} Plantilla encontrada o null
 */
export function getTemplateById(templateId) {
  const templates = getAllTemplates();
  return templates.find(t => t.id === templateId) || null;
}

/**
 * Busca plantillas por categoría
 * @param {string} category - Categoría de plantillas
 * @returns {Array} Array de plantillas de la categoría
 */
export function getTemplatesByCategory(category) {
  const templates = getAllTemplates();
  return templates.filter(t => t.category === category);
}
