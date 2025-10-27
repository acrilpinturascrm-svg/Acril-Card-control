import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Save, 
  X, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Calendar,
  Cloud,
  HardDrive
} from 'lucide-react';
import { Button } from './common';
import useBackupAlert from '../hooks/useBackupAlert';
import useAutoBackup from '../hooks/useAutoBackup';
import { useAuth, USER_ROLES } from '../contexts/AuthContext';

const BackupFloatingAlert = () => {
  const [showBackupModal, setShowBackupModal] = useState(false);
  const {
    isVisible,
    type,
    title,
    message,
    dismissAlert,
    snoozeAlert,
    hideAlert,
    daysSinceLastBackup
  } = useBackupAlert();

  const { createBackup, googleDriveState } = useAutoBackup();
  const { role } = useAuth();
  
  const isAdmin = role === USER_ROLES.ADMIN;
  const isEmployee = role === USER_ROLES.EMPLOYEE;

  // No renderizar si no es visible
  if (!isVisible) return null;

  // Configuración de estilos por tipo
  const alertStyles = {
    warning: {
      bgColor: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
      icon: AlertTriangle
    },
    urgent: {
      bgColor: 'bg-red-50 border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
      buttonColor: 'bg-red-600 hover:bg-red-700',
      icon: AlertTriangle
    },
    success: {
      bgColor: 'bg-green-50 border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      icon: CheckCircle
    },
    info: {
      bgColor: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      icon: Info
    }
  };

  const currentStyle = alertStyles[type] || alertStyles.warning;
  const IconComponent = currentStyle.icon;

  // Manejar backup rápido
  const handleQuickBackup = async (destination = 'local') => {
    try {
      await createBackup('manual', destination);
      hideAlert();
      setShowBackupModal(false);
    } catch (error) {
      console.error('Error en backup rápido:', error);
    }
  };

  // Modal de opciones de backup
  const BackupOptionsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            💾 Opciones de Backup
          </h3>
          <button
            onClick={() => setShowBackupModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Backup Local */}
          <button
            onClick={() => handleQuickBackup('local')}
            className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <HardDrive className="w-5 h-5 text-gray-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Backup Local</div>
              <div className="text-sm text-gray-500">Descargar archivo JSON</div>
            </div>
          </button>

          {/* Backup Google Drive */}
          <button
            onClick={() => handleQuickBackup('google-drive')}
            disabled={!googleDriveState.isSignedIn}
            className={`w-full flex items-center space-x-3 p-3 border rounded-lg transition-colors ${
              googleDriveState.isSignedIn
                ? 'border-gray-200 hover:bg-gray-50'
                : 'border-gray-100 bg-gray-50 cursor-not-allowed'
            }`}
          >
            <Cloud className={`w-5 h-5 ${
              googleDriveState.isSignedIn ? 'text-blue-600' : 'text-gray-400'
            }`} />
            <div className="text-left">
              <div className={`font-medium ${
                googleDriveState.isSignedIn ? 'text-gray-900' : 'text-gray-400'
              }`}>
                Backup Google Drive
              </div>
              <div className="text-sm text-gray-500">
                {googleDriveState.isSignedIn 
                  ? 'Guardar en la nube' 
                  : 'Requiere autenticación'
                }
              </div>
            </div>
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowBackupModal(false)}
            className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );

  const alertContent = (
    <>
      {/* Alerta Principal */}
      <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className={`${currentStyle.bgColor} border-l-4 border-r border-t border-b rounded-lg shadow-lg p-4`}>
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <IconComponent className={`w-5 h-5 ${currentStyle.iconColor} mt-0.5 flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-medium ${currentStyle.textColor}`}>
                  {title}
                </h4>
                <p className={`text-xs ${currentStyle.textColor} opacity-90 mt-1`}>
                  {message}
                </p>
              </div>
            </div>
            <button
              onClick={dismissAlert}
              className={`${currentStyle.textColor} opacity-60 hover:opacity-100 transition-opacity ml-2`}
              title={isAdmin ? 'Cerrar permanentemente' : 'Posponer por 1 hora'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Información adicional */}
          <div className="mt-2 space-y-1">
            {daysSinceLastBackup !== Infinity && (
              <div className={`text-xs ${currentStyle.textColor} opacity-75 flex items-center space-x-1`}>
                <Calendar className="w-3 h-3" />
                <span>
                  {daysSinceLastBackup === 0 
                    ? 'Backup hoy' 
                    : `Último backup: hace ${daysSinceLastBackup} día${daysSinceLastBackup > 1 ? 's' : ''}`
                  }
                </span>
              </div>
            )}
            
            {/* Indicador de comportamiento por rol */}
            {type !== 'success' && (
              <div className={`text-xs ${currentStyle.textColor} opacity-60 flex items-center space-x-1`}>
                <span>
                  {isAdmin 
                    ? '💡 Admin: Cerrar (X) oculta permanentemente' 
                    : '🔄 Empleado: Cerrar (X) pospone por 1 hora - Alerta persistente'
                  }
                </span>
              </div>
            )}
          </div>

          {/* Acciones */}
          {type !== 'success' && (
            <div className="flex items-center space-x-2 mt-3">
              <Button
                onClick={() => setShowBackupModal(true)}
                className={`${currentStyle.buttonColor} text-white text-xs px-3 py-1.5 flex items-center space-x-1`}
                size="sm"
              >
                <Save className="w-3 h-3" />
                <span>Backup Ahora</span>
              </Button>
              
              <button
                onClick={() => snoozeAlert(1)}
                className={`${currentStyle.textColor} opacity-75 hover:opacity-100 text-xs px-2 py-1.5 flex items-center space-x-1 transition-opacity`}
              >
                <Clock className="w-3 h-3" />
                <span>1h después</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de opciones */}
      {showBackupModal && <BackupOptionsModal />}
    </>
  );

  // Renderizar usando portal para estar fuera del DOM normal
  return createPortal(alertContent, document.body);
};

export default BackupFloatingAlert;
