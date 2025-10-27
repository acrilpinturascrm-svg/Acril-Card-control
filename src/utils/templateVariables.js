/**
 * Utilidades para manejo de variables en plantillas de WhatsApp
 */

/**
 * Reemplaza las variables en una plantilla con los datos del cliente
 * @param {string} template - Plantilla con variables
 * @param {Object} data - Datos para reemplazar
 * @returns {string} - Mensaje con variables reemplazadas
 */
export function replaceTemplateVariables(template, data) {
  if (!template) return '';
  
  const {
    customerName = '',
    businessName = 'ACRIL Pinturas',
    totalStamps = 0,
    stampsPerReward = 10,
    currentStamps = 0,
    totalRewards = 0,
    link = '',
    purchaseAmount = 0,
    purchaseDate = new Date().toLocaleDateString('es-ES')
  } = data;

  // Calcular valores derivados
  const stampsNeeded = stampsPerReward - currentStamps;
  const stampsInCurrentCard = totalStamps % stampsPerReward;

  // Mapa de reemplazos
  const replacements = {
    '{nombre}': customerName,
    '{negocio}': businessName,
    '{sellos}': totalStamps.toString(),
    '{sellosEnTarjeta}': stampsInCurrentCard.toString(),
    '{sellosFaltantes}': stampsNeeded > 0 ? stampsNeeded.toString() : '0',
    '{stampsPerReward}': stampsPerReward.toString(),
    '{premios}': totalRewards.toString(),
    '{link}': link,
    '{monto}': purchaseAmount > 0 ? `$${purchaseAmount.toLocaleString()}` : '',
    '{fecha}': purchaseDate
  };

  // Reemplazar todas las variables
  let result = template;
  Object.entries(replacements).forEach(([variable, value]) => {
    result = result.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
  });

  return result;
}

/**
 * Extrae las variables usadas en una plantilla
 * @param {string} template - Plantilla
 * @returns {Array} - Lista de variables encontradas
 */
export function extractVariables(template) {
  if (!template) return [];
  
  const regex = /\{([^}]+)\}/g;
  const variables = [];
  let match;
  
  while ((match = regex.exec(template)) !== null) {
    if (!variables.includes(match[0])) {
      variables.push(match[0]);
    }
  }
  
  return variables;
}

/**
 * Valida que todas las variables en la plantilla sean válidas
 * @param {string} template - Plantilla
 * @returns {Object} - { valid: boolean, invalidVariables: [] }
 */
export function validateTemplateVariables(template) {
  const validVariables = [
    '{nombre}',
    '{negocio}',
    '{sellos}',
    '{sellosEnTarjeta}',
    '{sellosFaltantes}',
    '{stampsPerReward}',
    '{premios}',
    '{link}',
    '{monto}',
    '{fecha}'
  ];

  const usedVariables = extractVariables(template);
  const invalidVariables = usedVariables.filter(v => !validVariables.includes(v));

  return {
    valid: invalidVariables.length === 0,
    invalidVariables,
    usedVariables
  };
}

/**
 * Obtiene información de todas las variables disponibles
 * @returns {Array} - Lista de variables con descripción
 */
export function getAvailableVariables() {
  return [
    { name: '{nombre}', desc: 'Nombre del cliente', example: 'Juan Pérez' },
    { name: '{negocio}', desc: 'Nombre del negocio', example: 'ACRIL Pinturas' },
    { name: '{sellos}', desc: 'Sellos totales', example: '15' },
    { name: '{sellosEnTarjeta}', desc: 'Sellos en tarjeta actual', example: '5' },
    { name: '{sellosFaltantes}', desc: 'Sellos faltantes para premio', example: '5' },
    { name: '{stampsPerReward}', desc: 'Sellos necesarios por premio', example: '10' },
    { name: '{premios}', desc: 'Premios disponibles', example: '1' },
    { name: '{link}', desc: 'Link a la tarjeta', example: 'https://...' },
    { name: '{monto}', desc: 'Monto de compra', example: '$1,500' },
    { name: '{fecha}', desc: 'Fecha actual', example: '27/10/2025' }
  ];
}

/**
 * Sugiere plantilla según el contexto
 * @param {Object} context - Contexto del cliente
 * @returns {string} - ID de plantilla sugerida
 */
export function suggestTemplate(context) {
  const { totalStamps = 0, stampsPerReward = 10, isNewCustomer = false } = context;
  
  const currentStamps = totalStamps % stampsPerReward;
  const hasReward = Math.floor(totalStamps / stampsPerReward) > 0;

  // Cliente nuevo
  if (isNewCustomer || totalStamps === 0) {
    return 'welcome';
  }

  // Tiene premio disponible
  if (hasReward) {
    return 'reward_available';
  }

  // Acaba de agregar sellos
  if (currentStamps > 0) {
    return 'stamps_added';
  }

  // Cliente inactivo o recordatorio
  return 'reminder';
}

/**
 * Registra el uso de una plantilla (para estadísticas)
 * @param {string} templateId - ID de la plantilla
 */
export function trackTemplateUsage(templateId) {
  try {
    const stats = JSON.parse(localStorage.getItem('template_stats') || '{}');
    
    if (!stats[templateId]) {
      stats[templateId] = {
        count: 0,
        lastUsed: null,
        firstUsed: new Date().toISOString()
      };
    }

    stats[templateId].count += 1;
    stats[templateId].lastUsed = new Date().toISOString();

    localStorage.setItem('template_stats', JSON.stringify(stats));
  } catch (error) {
    console.error('Error al registrar uso de plantilla:', error);
  }
}

/**
 * Obtiene estadísticas de uso de plantillas
 * @returns {Object} - Estadísticas por plantilla
 */
export function getTemplateStats() {
  try {
    return JSON.parse(localStorage.getItem('template_stats') || '{}');
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return {};
  }
}
