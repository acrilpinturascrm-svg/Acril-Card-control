import React, { useState, useEffect } from 'react';
import { X, Send, Edit2, MessageCircle, Phone, User, Copy, Check, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './common';
import { replaceTemplateVariables, trackTemplateUsage } from '../utils/templateVariables';
import { getAllTemplates } from '../utils/whatsappTemplates';

/**
 * Modal de vista previa para mensajes de WhatsApp
 * Permite ver y editar el mensaje antes de enviarlo
 * Incluye selector de plantillas integrado
 */
const WhatsAppPreviewModal = ({ 
  isOpen, 
  onClose, 
  onSend, 
  customerName, 
  customerPhone,
  message,
  onMessageChange,
  customerData // Datos del cliente para reemplazar variables
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState([]);

  // Función para obtener icono según categoría
  const getCategoryIcon = (category) => {
    const icons = {
      'welcome': '👋',
      'purchase': '🛍️',
      'discount': '💰',
      'reward': '🎁',
      'reminder': '⏰',
      'custom': '✨'
    };
    return icons[category] || '📝';
  };

  // Cargar plantillas del sistema centralizado
  useEffect(() => {
    const loadedTemplates = getAllTemplates();
    setTemplates(loadedTemplates);
  }, []);

  useEffect(() => {
    setEditedMessage(message);
    setIsEditing(false);
  }, [message, isOpen]);

  if (!isOpen) return null;

  const handleSend = async () => {
    setSending(true);
    try {
      await onSend(isEditing ? editedMessage : message);
      onClose();
    } catch (error) {
      console.error('Error al enviar:', error);
    } finally {
      setSending(false);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(isEditing ? editedMessage : message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    if (isEditing && onMessageChange) {
      onMessageChange(editedMessage);
    }
    setIsEditing(!isEditing);
  };

  const handleTemplateSelect = (template) => {
    if (!customerData) {
      // Si no hay datos del cliente, usar la plantilla tal cual
      setEditedMessage(template.message);
      if (onMessageChange) {
        onMessageChange(template.message);
      }
    } else {
      // Reemplazar variables con datos del cliente
      const filledMessage = replaceTemplateVariables(template.message, customerData);
      setEditedMessage(filledMessage);
      if (onMessageChange) {
        onMessageChange(filledMessage);
      }
    }
    
    // Registrar uso de la plantilla
    trackTemplateUsage(template.id);
    setShowTemplates(false);
    // Activar modo de edición automáticamente para permitir modificaciones
    setIsEditing(true);
  };

  const formatPhoneDisplay = (phone) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+58 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Vista Previa - WhatsApp</h2>
                <p className="text-green-100 text-sm">Revisa el mensaje antes de enviar</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-green-600 rounded-full p-2 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Información del Cliente */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Información del Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Nombre:</span>
                <span className="font-medium text-gray-900">{customerName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-900">{formatPhoneDisplay(customerPhone)}</span>
              </div>
            </div>
          </div>

          {/* Selector de Plantillas */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Usar Plantilla Predefinida</span>
              </div>
              {showTemplates ? (
                <ChevronUp className="w-5 h-5 text-blue-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-blue-600" />
              )}
            </button>
            
            {showTemplates && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="text-left p-3 bg-white rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xl">{getCategoryIcon(template.category)}</span>
                      <span className="font-medium text-gray-900 text-sm">{template.name}</span>
                      {template.isDefault && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                          Predeterminada
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {template.message.substring(0, 60)}...
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vista Previa del Mensaje */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
                Mensaje a Enviar
              </h3>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleCopyMessage}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copiar
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleEdit}
                  variant={isEditing ? "primary" : "outline"}
                  size="sm"
                  className="text-xs"
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  {isEditing ? 'Guardar' : 'Editar'}
                </Button>
              </div>
            </div>

            {/* Mensaje */}
            <div className="relative">
              {isEditing ? (
                <textarea
                  value={editedMessage}
                  onChange={(e) => setEditedMessage(e.target.value)}
                  className="w-full h-64 p-4 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm resize-none"
                  placeholder="Escribe tu mensaje aquí..."
                />
              ) : (
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-200 min-h-[16rem]">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
                      {message}
                    </pre>
                  </div>
                  
                  {/* Simulación de burbuja de WhatsApp */}
                  <div className="mt-2 flex justify-end">
                    <div className="text-xs text-gray-500 flex items-center space-x-1">
                      <span>{new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                      <Check className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Contador de caracteres */}
              <div className="mt-2 text-xs text-gray-500 text-right">
                {(isEditing ? editedMessage : message).length} caracteres
              </div>
            </div>
          </div>

          {/* Advertencias */}
          {message.includes('localhost') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <span className="text-yellow-600 text-xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">
                    Advertencia: URL Local Detectada
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    El mensaje contiene una URL localhost. El cliente no podrá acceder al enlace.
                    Configure REACT_APP_PUBLIC_BASE_URL para producción.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer con botones */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>El mensaje se abrirá en WhatsApp Web o la app</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={onClose}
                variant="outline"
                disabled={sending}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleSend}
                disabled={sending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar por WhatsApp
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppPreviewModal;
