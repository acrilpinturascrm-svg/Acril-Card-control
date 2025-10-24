import React, { useState, useRef } from 'react';
import { 
  Save, 
  Download, 
  Upload, 
  Settings, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Cloud,
  HardDrive,
  Shield,
  RotateCcw,
  Trash2,
  Info,
  HelpCircle,
  BookOpen,
  Lightbulb,
  AlertCircle,
  FileText,
  RefreshCw
} from 'lucide-react';
import { Button } from './common';
import useAutoBackup from '../hooks/useAutoBackup';
import { useJsonExport, useJsonImport } from '../hooks/useJsonImportExport';
import useBackupAlert from '../hooks/useBackupAlert';

const BackupManager = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [activeHelpTip, setActiveHelpTip] = useState(null);
  const fileInputRef = useRef(null);
  
  const {
    backupSettings,
    backupHistory,
    googleDriveState,
    createBackup,
    restoreFromBackup,
    setBackupSettings,
    cleanOldBackups,
    getBackupStats,
    checkIfBackupNeeded,
    clearBackupHistory,
    initializeGoogleDrive,
    signInToGoogleDrive,
    signOutFromGoogleDrive,
    syncWithGoogleDrive
  } = useAutoBackup();

  const { exportCustomersToJSON } = useJsonExport();
  const { handleJsonImported } = useJsonImport();
  const { showSuccessAlert } = useBackupAlert();
  const stats = getBackupStats();

  const handleManualBackup = async (destination = 'local') => {
    try {
      await createBackup('manual', destination);
      // Mostrar alerta de éxito
      const message = destination === 'google-drive' 
        ? 'Backup guardado en Google Drive exitosamente'
        : 'Backup local descargado exitosamente';
      showSuccessAlert(message);
    } catch (error) {
      console.error('Manual backup failed:', error);
    }
  };

  const handleSettingsChange = (key, value) => {
    setBackupSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Función para manejar la importación de archivos JSON locales
  const handleFileImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Verificar que sea un archivo JSON
    if (!file.name.toLowerCase().endsWith('.json')) {
      alert('Por favor selecciona un archivo JSON válido');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        handleJsonImported(jsonData);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        alert('Error al leer el archivo JSON. Verifica que el formato sea correcto.');
      }
    };
    reader.readAsText(file);
    
    // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
    event.target.value = '';
  };

  // Función para limpiar el historial de backups
  const handleClearHistory = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar todo el historial de backups? Esta acción no se puede deshacer.')) {
      clearBackupHistory();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const helpTips = {
    backupLocal: {
      title: "Backup Local",
      content: "Crea una copia de seguridad en tu dispositivo. Es rápido y no requiere internet, pero solo estará disponible en este navegador.",
      icon: HardDrive,
      color: "blue"
    },
    backupCloud: {
      title: "Backup Google Drive",
      content: "Guarda tus datos en la nube de Google. Podrás acceder desde cualquier dispositivo, pero requiere configuración adicional.",
      icon: Cloud,
      color: "green"
    },
    backupComplete: {
      title: "Backup Completo",
      content: "Incluye todos los datos, configuraciones y metadatos del sistema. Recomendado antes de actualizaciones importantes.",
      icon: Shield,
      color: "purple"
    },
    autoBackup: {
      title: "Backup Automático",
      content: "El sistema creará backups automáticamente según la frecuencia configurada. Ideal para protección continua sin intervención manual.",
      icon: Clock,
      color: "orange"
    },
    restore: {
      title: "Restaurar Datos",
      content: "Recupera información desde un backup anterior. ADVERTENCIA: Esto reemplazará todos los datos actuales.",
      icon: RotateCcw,
      color: "red"
    },
    importJson: {
      title: "Importar JSON",
      content: "Importa datos desde archivos JSON guardados localmente. Ideal para recuperar backups locales o migrar datos desde otros sistemas.",
      icon: Upload,
      color: "green"
    }
  };

  const HelpTip = ({ tipKey, children }) => {
    const tip = helpTips[tipKey];
    if (!tip) return children;

    return (
      <div className="relative inline-block">
        {children}
        <button
          onClick={() => setActiveHelpTip(activeHelpTip === tipKey ? null : tipKey)}
          className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors"
          title="Ver ayuda"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
        
        {activeHelpTip === tipKey && (
          <div className="absolute z-10 w-80 p-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2 mb-2">
              <tip.icon className={`w-5 h-5 text-${tip.color}-600`} />
              <h4 className="font-medium text-gray-900">{tip.title}</h4>
            </div>
            <p className="text-sm text-gray-700">{tip.content}</p>
            <button
              onClick={() => setActiveHelpTip(null)}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Save className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-800">Sistema de Backup</h2>
            <p className="text-sm text-gray-600">
              Protege tus datos con backups automáticos y manuales
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHelp(!showHelp)}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Guía
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-600"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Notificación de backup recomendado */}
      {checkIfBackupNeeded() && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg animate-pulse">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 animate-bounce" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-yellow-800">
                ⚠️ Backup Recomendado
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                Han pasado más de {backupSettings.backupInterval} horas desde el último backup automático. 
                Se recomienda crear un backup manual para proteger tus datos.
              </p>
              <p className="text-xs text-yellow-600 mt-2">
                💡 Tip: Activa el backup automático para no preocuparte por esto.
              </p>
            </div>
            <Button
              onClick={() => handleManualBackup(backupSettings.googleDriveEnabled && googleDriveState.isSignedIn ? 'both' : 'local')}
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg"
            >
              🚀 Crear Backup Ahora
            </Button>
          </div>
        </div>
      )}

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Exitosos</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{stats.successfulBackups}</p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">Fallidos</span>
          </div>
          <p className="text-2xl font-bold text-red-900">{stats.failedBackups}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Último</span>
          </div>
          <p className="text-xs font-medium text-green-900">
            {stats.lastBackup ? formatDate(stats.lastBackup.timestamp) : 'Nunca'}
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Estado</span>
          </div>
          <p className="text-xs font-bold text-purple-900">
            {backupSettings.autoBackupEnabled ? (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                Automático
              </span>
            ) : (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
                Manual
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Acciones principales */}
      <div className="flex flex-wrap gap-3 mb-6">
        <HelpTip tipKey="backupLocal">
          <Button
            onClick={() => handleManualBackup('local')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <HardDrive className="w-4 h-4 mr-2" />
            Backup Local
          </Button>
        </HelpTip>
        
        <HelpTip tipKey="backupCloud">
          <Button
            onClick={() => handleManualBackup('google-drive')}
            disabled={!backupSettings.googleDriveEnabled || !googleDriveState.isSignedIn || googleDriveState.isLoading}
            className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400"
          >
            {googleDriveState.isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Cloud className="w-4 h-4 mr-2" />
            )}
            {googleDriveState.isLoading ? 'Procesando...' : 'Backup Google Drive'}
          </Button>
        </HelpTip>
        
        <HelpTip tipKey="backupComplete">
          <Button
            onClick={() => handleManualBackup('both')}
            disabled={!backupSettings.googleDriveEnabled || !googleDriveState.isSignedIn || googleDriveState.isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-400"
          >
            <Save className="w-4 h-4 mr-2" />
            Backup Completo
          </Button>
        </HelpTip>

        <HelpTip tipKey="syncBidirectional">
          <Button
            onClick={syncWithGoogleDrive}
            disabled={!googleDriveState.isSignedIn || googleDriveState.isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-400"
          >
            {googleDriveState.isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4 mr-2" />
            )}
            {googleDriveState.isLoading ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
        </HelpTip>
        
        <Button
          onClick={exportCustomersToJSON}
          variant="outline"
          className="border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar JSON
        </Button>
        
        <HelpTip tipKey="importJson">
          <Button
            onClick={handleFileImport}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar JSON
          </Button>
        </HelpTip>
        
        <HelpTip tipKey="restore">
          <Button
            onClick={() => setShowHistory(!showHistory)}
            variant="outline"
            className="border-gray-600 text-gray-600 hover:bg-gray-50"
          >
            <Clock className="w-4 h-4 mr-2" />
            Historial
          </Button>
        </HelpTip>

        {/* Input oculto para seleccionar archivos */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Panel de Google Drive */}
      {backupSettings.googleDriveEnabled && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Cloud className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-green-900">Estado de Google Drive</h3>
            </div>
            {googleDriveState.error && (
              <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                Error: {googleDriveState.error}
              </span>
            )}
          </div>
          
          {googleDriveState.isSignedIn ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {googleDriveState.userInfo?.imageUrl && (
                  <img 
                    src={googleDriveState.userInfo.imageUrl} 
                    alt="Avatar" 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Conectado como {googleDriveState.userInfo?.name}
                  </p>
                  <p className="text-xs text-green-700">
                    {googleDriveState.userInfo?.email}
                  </p>
                </div>
              </div>
              <Button
                onClick={signOutFromGoogleDrive}
                variant="outline"
                size="sm"
                className="border-red-600 text-red-600 hover:bg-red-50"
                disabled={googleDriveState.isLoading}
              >
                Cerrar Sesión
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800 mb-1">
                  No conectado a Google Drive
                </p>
                <p className="text-xs text-green-600">
                  Inicia sesión para habilitar backup en la nube
                </p>
              </div>
              <Button
                onClick={signInToGoogleDrive}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
                disabled={googleDriveState.isLoading}
              >
                {googleDriveState.isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4 mr-2" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Panel de ayuda contextual */}
      {showHelp && (
        <div className="border-t pt-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
            Guía Rápida de Backup
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <HardDrive className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">¿Cuándo usar Backup Local?</h4>
                </div>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Para respaldos rápidos diarios</li>
                  <li>• Cuando no tienes internet</li>
                  <li>• Para pruebas y desarrollo</li>
                  <li>• Como backup de emergencia</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Cloud className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-green-900">¿Cuándo usar Google Drive?</h4>
                </div>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Para acceso desde múltiples dispositivos</li>
                  <li>• Como backup principal seguro</li>
                  <li>• Para compartir con tu equipo</li>
                  <li>• Protección contra pérdida de datos</li>
                  <li>• <strong>Sincronización automática</strong> entre dispositivos</li>
                </ul>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <RotateCcw className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-medium text-indigo-900">Sincronización Bidireccional</h4>
                </div>
                <ul className="text-sm text-indigo-800 space-y-1">
                  <li>• Compara archivos locales con remotos</li>
                  <li>• Sube archivos faltantes en la nube</li>
                  <li>• Descarga archivos nuevos desde otros dispositivos</li>
                  <li>• Mantiene consistencia entre navegadores</li>
                  <li>• Reporta conflictos y errores encontrados</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <h4 className="font-medium text-orange-900">Configuración Recomendada</h4>
                </div>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• <strong>Uso intensivo:</strong> Backup cada 6 horas</li>
                  <li>• <strong>Uso normal:</strong> Backup cada 24 horas</li>
                  <li>• <strong>Mantener:</strong> 5-10 backups históricos</li>
                  <li>• <strong>Antes de cambios:</strong> Backup manual</li>
                </ul>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h4 className="font-medium text-red-900">⚠️ Importante</h4>
                </div>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Restaurar reemplaza TODOS los datos actuales</li>
                  <li>• Siempre crea un backup antes de restaurar</li>
                  <li>• Verifica la fecha del backup a restaurar</li>
                  <li>• Los backups locales solo funcionan en este navegador</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Info className="w-5 h-5 mr-2 text-gray-600" />
              Consejos de Uso
            </h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
              <div>
                <p className="font-medium mb-1">📅 Rutina Diaria</p>
                <p>Activa el backup automático y olvídate. El sistema se encarga de todo.</p>
              </div>
              <div>
                <p className="font-medium mb-1">🔄 Antes de Cambios</p>
                <p>Siempre crea un backup manual antes de hacer cambios importantes.</p>
              </div>
              <div>
                <p className="font-medium mb-1">🧹 Limpieza Regular</p>
                <p>Usa "Limpiar Backups Antiguos" para liberar espacio periódicamente.</p>
              </div>
              <div>
                <p className="font-medium mb-1">📁 Importar JSON</p>
                <p>Importa backups locales o datos desde archivos JSON guardados en tu dispositivo.</p>
              </div>
              <div>
                <p className="font-medium mb-1">🗑️ Control de Historial</p>
                <p>Limpia éxitos y fallidos cuando necesites un mejor control de versiones.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panel de configuraciones */}
      {showSettings && (
        <div className="border-t pt-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Configuración de Backup</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <HelpTip tipKey="autoBackup">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Backup Automático
                  </label>
                  <input
                    type="checkbox"
                    checked={backupSettings.autoBackupEnabled}
                    onChange={(e) => handleSettingsChange('autoBackupEnabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </HelpTip>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intervalo (horas)
                </label>
                <select
                  value={backupSettings.backupInterval}
                  onChange={(e) => handleSettingsChange('backupInterval', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>Cada hora</option>
                  <option value={6}>Cada 6 horas</option>
                  <option value={12}>Cada 12 horas</option>
                  <option value={24}>Cada 24 horas</option>
                  <option value={72}>Cada 3 días</option>
                  <option value={168}>Cada semana</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo backups locales
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={backupSettings.maxLocalBackups}
                  onChange={(e) => handleSettingsChange('maxLocalBackups', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Google Drive
                  <span className="text-xs text-green-600 block">
                    {googleDriveState.isSignedIn ? 'Conectado' : 'Disponible'}
                  </span>
                </label>
                <input
                  type="checkbox"
                  checked={backupSettings.googleDriveEnabled}
                  onChange={(e) => handleSettingsChange('googleDriveEnabled', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Cifrado
                  <span className="text-xs text-gray-500 block">Próximamente</span>
                </label>
                <input
                  type="checkbox"
                  checked={backupSettings.encryptionEnabled}
                  onChange={(e) => handleSettingsChange('encryptionEnabled', e.target.checked)}
                  disabled
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={cleanOldBackups}
                  variant="outline"
                  size="sm"
                  className="w-full border-red-600 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpiar Backups Antiguos
                </Button>
                
                <Button
                  onClick={handleClearHistory}
                  variant="outline"
                  size="sm"
                  className="w-full border-orange-600 text-orange-600 hover:bg-orange-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Limpiar Historial Completo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historial de backups */}
      {showHistory && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Historial de Backups</h3>
          
          {backupHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay backups registrados</p>
              <p className="text-sm">Crea tu primer backup para comenzar</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {backupHistory.map((backup) => (
                <div
                  key={backup.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    backup.status === 'success' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {backup.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    
                    <div>
                      <p className="font-medium text-sm">
                        Backup {backup.type} - {formatDate(backup.timestamp)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {backup.customerCount} clientes • {formatFileSize(backup.size || 0)} • {backup.destination}
                      </p>
                      {backup.error && (
                        <p className="text-xs text-red-600 mt-1">{backup.error}</p>
                      )}
                    </div>
                  </div>
                  
                  {backup.status === 'success' && (
                    <Button
                      onClick={() => restoreFromBackup(backup.id)}
                      variant="outline"
                      size="sm"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Restaurar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Próximo backup automático */}
      {backupSettings.autoBackupEnabled && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Próximo backup automático: {formatDate(stats.nextAutoBackup)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupManager;
