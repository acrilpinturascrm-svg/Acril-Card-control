import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, Edit2, Trash2, Save, X, Copy, Check } from 'lucide-react';
import { Button } from './common';

/**
 * Gestor de plantillas de WhatsApp
 * Permite crear, editar y eliminar plantillas personalizadas
 */
const WhatsAppTemplateManager = ({ onTemplateSelect }) => {
  const [templates, setTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Plantillas por defecto
  const defaultTemplates = [
    {
      id: 'welcome',
      name: 'Bienvenida',
      description: 'Para clientes nuevos',
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
      message: '¡Hola {nombre}! 👋\n\n',
      isDefault: false
    };
    setEditingTemplate(newTemplate);
    setIsCreating(true);
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;

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

  const handleDeleteTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template?.isDefault) {
      alert('No puedes eliminar plantillas predeterminadas');
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

  const variables = [
    { name: '{nombre}', desc: 'Nombre del cliente' },
    { name: '{negocio}', desc: 'Nombre del negocio' },
    { name: '{sellos}', desc: 'Sellos totales' },
    { name: '{sellosEnTarjeta}', desc: 'Sellos en tarjeta actual' },
    { name: '{sellosFaltantes}', desc: 'Sellos faltantes para premio' },
    { name: '{stampsPerReward}', desc: 'Sellos necesarios por premio' },
    { name: '{premios}', desc: 'Premios disponibles' },
    { name: '{link}', desc: 'Link a la tarjeta' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
            Plantillas de WhatsApp
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Personaliza los mensajes que se envían a tus clientes
          </p>
        </div>
        <Button
          onClick={handleCreateTemplate}
          className="bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Plantilla
        </Button>
      </div>

      {/* Variables disponibles */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2 text-sm">
          📝 Variables Disponibles
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {variables.map((variable) => (
            <div key={variable.name} className="bg-white rounded px-2 py-1">
              <code className="text-blue-700 font-mono">{variable.name}</code>
              <p className="text-gray-600 text-[10px]">{variable.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de plantillas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
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
                <textarea
                  value={editingTemplate.message}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, message: e.target.value })}
                  rows="8"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                  placeholder="Mensaje de la plantilla"
                />
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
                    </h4>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded p-3 max-h-32 overflow-y-auto">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">
                    {template.message.substring(0, 150)}
                    {template.message.length > 150 && '...'}
                  </pre>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <Button
                    onClick={() => onTemplateSelect && onTemplateSelect(template)}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Usar Plantilla
                  </Button>
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
                    {!template.isDefault && (
                      <>
                        <Button
                          onClick={() => setEditingTemplate(template)}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteTemplate(template.id)}
                          variant="outline"
                          size="sm"
                          className="text-xs text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhatsAppTemplateManager;
