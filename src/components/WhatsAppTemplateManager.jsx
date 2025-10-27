import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, Edit2, Trash2, Save, X, Copy, Check, Filter, TrendingUp, Eye, AlertCircle } from 'lucide-react';
import { Button } from './common';
import { 
  getAvailableVariables, 
  validateTemplateVariables, 
  replaceTemplateVariables,
  getTemplateStats 
} from '../utils/templateVariables';

// Plantillas por defecto con categorías (fuera del componente para evitar recreación)
const defaultTemplates = [
    {
      id: 'welcome',
      name: 'Bienvenida',
      description: 'Para clientes nuevos',
      category: 'welcome',
      message: `¡Hola {nombre}! 👋

Bienvenido a {negocio} 💚

Acabas de unirte a nuestro programa de fidelidad. Por cada compra, acumulas sellos y obtienes premios increíbles.

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
      name: 'Sellos Agregados',
      description: 'Después de una compra',
      category: 'purchase',
      message: `¡Hola {nombre}! 👋

Gracias por tu compra en {negocio} 💚

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
      id: 'reward_available',
      name: 'Premio Disponible',
      description: 'Cuando completa una tarjeta',
      category: 'reward',
      message: `¡Hola {nombre}! 🎉

¡FELICIDADES! Has completado tu tarjeta de fidelidad en {negocio} 💚

🎁 Tienes {premios} premio(s) disponible(s) para canjear

Pasa por nuestra tienda para reclamar tu premio.

📱 Ver tu tarjeta:
{link}

¡Gracias por tu preferencia! ⭐`,
      isDefault: true
    },
    {
      id: 'reminder',
      name: 'Recordatorio',
      description: 'Para clientes inactivos',
      category: 'reminder',
      message: `¡Hola {nombre}! 👋

Te extrañamos en {negocio} 💚

Tienes {sellos} sellos acumulados. ¡Estás cerca de tu próximo premio!

🎯 Solo te faltan {sellosFaltantes} sellos más

📱 Ver tu tarjeta:
{link}

¡Esperamos verte pronto! 🎉`,
      isDefault: true
    }
  ];

/**
 * Gestor de plantillas de WhatsApp - Versión Mejorada
 * Incluye: categorización, vista previa, validación y estadísticas
 */
const WhatsAppTemplateManager = ({ onTemplateSelect }) => {
  const [templates, setTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showStats, setShowStats] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Datos de ejemplo para vista previa
  const previewData = {
    customerName: 'Juan Pérez',
    businessName: 'ACRIL Pinturas',
    totalStamps: 17,
    stampsPerReward: 10,
    currentStamps: 7,
    totalRewards: 1,
    link: 'https://acrilcard.netlify.app/card?customer=CLI-001'
  };

  // Categorías de plantillas
  const categories = [
    { id: 'all', name: 'Todas', icon: '📋' },
    { id: 'welcome', name: 'Bienvenida', icon: '👋' },
    { id: 'purchase', name: 'Compra', icon: '🛍️' },
    { id: 'reward', name: 'Premio', icon: '🎁' },
    { id: 'reminder', name: 'Recordatorio', icon: '⏰' },
    { id: 'custom', name: 'Personalizado', icon: '✨' }
  ];

  // Cargar plantillas del localStorage
  useEffect(() => {
    const savedTemplates = localStorage.getItem('whatsapp_templates');
    if (savedTemplates) {
      try {
        const parsed = JSON.parse(savedTemplates);
        setTemplates([...defaultTemplates, ...parsed]);
      } catch (error) {
        console.error('Error al cargar plantillas:', error);
        setTemplates(defaultTemplates);
      }
    } else {
      setTemplates(defaultTemplates);
    }
  }, []);

  // Guardar plantillas personalizadas
  const saveTemplates = (newTemplates) => {
    const customTemplates = newTemplates.filter(t => !t.isDefault);
    localStorage.setItem('whatsapp_templates', JSON.stringify(customTemplates));
    setTemplates(newTemplates);
  };

  const handleCreateTemplate = () => {
    const newTemplate = {
      id: `custom_${Date.now()}`,
      name: 'Nueva Plantilla',
      description: 'Descripción de la plantilla',
      category: 'custom',
      message: '¡Hola {nombre}! 👋\n\n',
      isDefault: false
    };
    setEditingTemplate(newTemplate);
    setIsCreating(true);
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;

    // Validar variables
    const validation = validateTemplateVariables(editingTemplate.message);
    if (!validation.valid) {
      alert(`Variables inválidas encontradas: ${validation.invalidVariables.join(', ')}\n\nUsa solo variables válidas.`);
      return;
    }

    let updatedTemplates;
    if (isCreating) {
      updatedTemplates = [...templates, editingTemplate];
    } else {
      updatedTemplates = templates.map(t => 
        t.id === editingTemplate.id ? editingTemplate : t
      );
    }

    saveTemplates(updatedTemplates);
    setEditingTemplate(null);
    setIsCreating(false);
  };

  const handleEditTemplate = (template) => {
    // Permitir editar plantillas predeterminadas creando una copia personalizada
    if (template.isDefault) {
      const customTemplate = {
        ...template,
        id: `custom_${template.id}_${Date.now()}`,
        name: `${template.name} (Personalizada)`,
        isDefault: false
      };
      setEditingTemplate(customTemplate);
      setIsCreating(true);
    } else {
      setEditingTemplate(template);
      setIsCreating(false);
    }
  };

  const handleDeleteTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template?.isDefault) {
      alert('No puedes eliminar plantillas predeterminadas. Puedes crear una copia personalizada para modificarla.');
      return;
    }

    if (confirm('¿Estás seguro de eliminar esta plantilla?')) {
      const updatedTemplates = templates.filter(t => t.id !== templateId);
      saveTemplates(updatedTemplates);
    }
  };

  const handleCopyTemplate = (template) => {
    navigator.clipboard.writeText(template.message);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePreview = (template) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  // Filtrar plantillas por categoría
  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  // Obtener estadísticas
  const stats = getTemplateStats();
  const variables = getAvailableVariables();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
            Plantillas de WhatsApp
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Personaliza los mensajes que se envían a tus clientes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowStats(!showStats)}
            variant="outline"
            size="sm"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Estadísticas
          </Button>
          <Button
            onClick={handleCreateTemplate}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Plantilla
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      {showStats && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Estadísticas de Uso
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {templates.map(template => {
              const templateStats = stats[template.id];
              if (!templateStats) return null;
              
              return (
                <div key={template.id} className="bg-white rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-700">{template.name}</p>
                  <p className="text-2xl font-bold text-blue-600">{templateStats.count}</p>
                  <p className="text-[10px] text-gray-500">usos</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filtros por categoría */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              selectedCategory === category.id
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-1">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* Variables disponibles */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2 text-sm">
          📝 Variables Disponibles
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          {variables.map((variable) => (
            <div key={variable.name} className="bg-white rounded px-2 py-1">
              <code className="text-blue-700 font-mono text-[10px]">{variable.name}</code>
              <p className="text-gray-600 text-[9px]">{variable.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de plantillas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => {
          const validation = validateTemplateVariables(template.message);
          const templateStats = stats[template.id];
          
          return (
            <div
              key={template.id}
              className={`border-2 rounded-lg p-4 transition-all ${
                editingTemplate?.id === template.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {editingTemplate?.id === template.id ? (
                // Modo edición
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Nombre de la plantilla"
                  />
                  <input
                    type="text"
                    value={editingTemplate.description}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Descripción"
                  />
                  <select
                    value={editingTemplate.category}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {categories.filter(c => c.id !== 'all').map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={editingTemplate.message}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, message: e.target.value })}
                    rows="8"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                    placeholder="Mensaje de la plantilla"
                  />
                  
                  {/* Validación en tiempo real */}
                  {editingTemplate.message && (() => {
                    const val = validateTemplateVariables(editingTemplate.message);
                    return !val.valid && (
                      <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                        Variables inválidas: {val.invalidVariables.join(', ')}
                      </div>
                    );
                  })()}
                  
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      onClick={() => {
                        setEditingTemplate(null);
                        setIsCreating(false);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSaveTemplate}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Guardar
                    </Button>
                  </div>
                </div>
              ) : (
                // Modo vista
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        {template.name}
                        {template.isDefault && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            Predeterminada
                          </span>
                        )}
                        {templateStats && (
                          <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                            {templateStats.count} usos
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600">{template.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {categories.find(c => c.id === template.category)?.icon} {categories.find(c => c.id === template.category)?.name}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded p-3 max-h-32 overflow-y-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">
                      {template.message.substring(0, 150)}
                      {template.message.length > 150 && '...'}
                    </pre>
                  </div>

                  {!validation.valid && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-700">
                      <AlertCircle className="w-3 h-3 inline mr-1" />
                      Contiene variables inválidas
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div className="flex items-center space-x-1">
                      <Button
                        onClick={() => onTemplateSelect && onTemplateSelect(template)}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        Usar
                      </Button>
                      <Button
                        onClick={() => handlePreview(template)}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        onClick={() => handleCopyTemplate(template)}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        {copiedId === template.id ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                      <Button
                        onClick={() => handleEditTemplate(template)}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        title={template.isDefault ? "Crear copia personalizada" : "Editar plantilla"}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      {!template.isDefault && (
                        <Button
                          onClick={() => handleDeleteTemplate(template.id)}
                          variant="outline"
                          size="sm"
                          className="text-xs text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de Vista Previa */}
      {showPreview && previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Vista Previa: {previewTemplate.name}
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
                  {replaceTemplateVariables(previewTemplate.message, previewData)}
                </pre>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-600 bg-gray-50 rounded p-3">
              <p className="font-medium mb-1">Datos de ejemplo usados:</p>
              <ul className="space-y-1">
                <li>• Nombre: {previewData.customerName}</li>
                <li>• Sellos: {previewData.totalStamps}</li>
                <li>• Premios: {previewData.totalRewards}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppTemplateManager;
