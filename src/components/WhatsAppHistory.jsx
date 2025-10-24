import React from 'react';
import { MessageCircle, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

/**
 * Componente para mostrar el historial de mensajes de WhatsApp
 */
const WhatsAppHistory = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 text-sm">
          No hay mensajes de WhatsApp enviados aún
        </p>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'sent':
        return 'Enviado';
      case 'error':
        return 'Error';
      case 'pending':
        return 'Pendiente';
      default:
        return 'Desconocido';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTemplateLabel = (template) => {
    const templates = {
      'welcome': 'Bienvenida',
      'stamps_added': 'Sellos Agregados',
      'reward_available': 'Premio Disponible',
      'reminder': 'Recordatorio',
      'custom': 'Personalizado'
    };
    return templates[template] || 'Mensaje';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Ordenar por fecha descendente (más reciente primero)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
          Historial de WhatsApp
        </h3>
        <span className="text-sm text-gray-600">
          {history.length} mensaje{history.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sortedHistory.map((entry) => (
          <div
            key={entry.id}
            className={`border rounded-lg p-3 transition-all hover:shadow-sm ${getStatusColor(entry.status)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(entry.status)}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {getTemplateLabel(entry.template)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatDate(entry.date)} • {formatTime(entry.date)}
                  </p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                entry.status === 'sent' ? 'bg-green-100 text-green-700' :
                entry.status === 'error' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {getStatusText(entry.status)}
              </span>
            </div>

            {entry.message && (
              <div className="mt-2 p-2 bg-white rounded text-xs text-gray-700 max-h-20 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans">
                  {entry.message.substring(0, 150)}
                  {entry.message.length > 150 && '...'}
                </pre>
              </div>
            )}

            {entry.error && (
              <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
                <p className="font-medium">Error:</p>
                <p>{entry.error}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhatsAppHistory;
