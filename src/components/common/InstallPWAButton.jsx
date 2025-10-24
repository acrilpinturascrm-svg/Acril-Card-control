import React, { useState } from 'react';
import { Download, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { Button } from './common';
import { usePWA, useNetworkStatus, useServiceWorker } from '../hooks/usePWA';

const InstallPWAButton = () => {
  const { canInstall, installPWA, dismissInstallPrompt } = usePWA();
  const { isOnline, connectionType, isSlowConnection } = useNetworkStatus();
  const { updateAvailable, updateServiceWorker, clearCache } = useServiceWorker();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  const handleInstallClick = async () => {
    if (canInstall) {
      const installed = await installPWA();
      if (installed) {
        setShowInstallPrompt(false);
      }
    }
  };

  const handleDismissInstall = () => {
    dismissInstallPrompt();
    setShowInstallPrompt(false);
  };

  if (!canInstall && !updateAvailable && !isSlowConnection) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowInstallPrompt(!showInstallPrompt)}
        className="text-white border-white hover:bg-white hover:text-red-800 relative"
      >
        <Smartphone className="w-4 h-4 mr-2" />
        {updateAvailable ? 'Actualizar' : 'Instalar'}
        {updateAvailable && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span>
        )}
      </Button>

      {showInstallPrompt && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {updateAvailable ? 'Actualización Disponible' : 'Instalar ACRILCARD'}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {updateAvailable
                  ? 'Hay una nueva versión disponible. ¿Deseas actualizar ahora?'
                  : 'Instala ACRILCARD en tu dispositivo para un acceso más rápido y funcionalidades offline.'
                }
              </p>

              {/* Estado de conexión */}
              <div className="flex items-center space-x-2 mb-3">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className="text-xs text-gray-500">
                  {isOnline
                    ? `Conectado (${connectionType.toUpperCase()})`
                    : 'Sin conexión'
                  }
                  {isSlowConnection && isOnline && (
                    <span className="text-yellow-600"> - Conexión lenta</span>
                  )}
                </span>
              </div>

              {/* Opciones adicionales */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={updateAvailable ? updateServiceWorker : handleInstallClick}
                  className="flex-1"
                >
                  {updateAvailable ? 'Actualizar Ahora' : 'Instalar App'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDismissInstall}
                >
                  Cancelar
                </Button>
              </div>

              {updateAvailable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCache}
                  className="w-full mt-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Limpiar Cache
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallPWAButton;
