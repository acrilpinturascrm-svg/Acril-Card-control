import { useState, useEffect, useCallback } from 'react';
import { useCustomers } from '../contexts/CustomerContext';
import { useNotification } from '../contexts/NotificationContext';
import googleDriveService from '../services/googleDriveBackup';

/**
 * Hook para manejo automático de backups
 * Extiende la funcionalidad existente de import/export
 */
export const useAutoBackup = () => {
  const { customers } = useCustomers();
  const { showSuccess, showError, showWarning } = useNotification();
  
  const [backupSettings, setBackupSettings] = useState(() => {
    const stored = localStorage.getItem('backupSettings');
    return stored ? JSON.parse(stored) : {
      autoBackupEnabled: process.env.REACT_APP_AUTO_BACKUP === 'true' || true,
      backupInterval: parseInt(process.env.REACT_APP_BACKUP_INTERVAL) || 24, // horas
      maxLocalBackups: parseInt(process.env.REACT_APP_MAX_LOCAL_BACKUPS) || 7,
      lastBackupDate: null,
      googleDriveEnabled: process.env.REACT_APP_GOOGLE_DRIVE_ENABLED === 'true' || false,
      encryptionEnabled: false
    };
  });

  const [backupHistory, setBackupHistory] = useState(() => {
    const stored = localStorage.getItem('backupHistory');
    return stored ? JSON.parse(stored) : [];
  });

  const [googleDriveState, setGoogleDriveState] = useState(() => ({
    isInitialized: false,
    isSignedIn: false,
    userInfo: null,
    isLoading: false,
    error: null
  }));

  // Guardar configuraciones cuando cambien
  useEffect(() => {
    localStorage.setItem('backupSettings', JSON.stringify(backupSettings));
  }, [backupSettings]);

  /**
   * Inicializar Google Drive automáticamente al cargar el componente
   */
  useEffect(() => {
    const initializeGoogleDriveOnLoad = async () => {
      if (backupSettings.googleDriveEnabled) {
        try {
          // Verificar si hay una sesión guardada
          const savedSession = localStorage.getItem('googleDriveSession');
          if (savedSession) {
            const sessionData = JSON.parse(savedSession);
            
            // Verificar si la sesión no ha expirado (1 hora)
            if (Date.now() < sessionData.expiresAt) {
              console.log('🔄 Restaurando sesión previa de Google Drive...');
              await initializeGoogleDrive();
              return;
            } else {
              // Sesión expirada, limpiar
              localStorage.removeItem('googleDriveSession');
            }
          }

          // Inicializar Google Drive (aunque no esté autenticado)
          console.log('🔄 Inicializando Google Drive API...');
          await initializeGoogleDrive();
          
        } catch (error) {
          console.error('Error inicializando Google Drive:', error);
          // No mostrar error al usuario, solo en consola
        }
      }
    };

    // Inicializar después de un breve delay para evitar conflictos con la carga inicial
    const initTimeout = setTimeout(initializeGoogleDriveOnLoad, 1000);

    return () => clearTimeout(initTimeout);
  }, [backupSettings.googleDriveEnabled]); // ✅ CORREGIDO: Eliminada dependencia circular

  /**
   * Inicializar Google Drive API
   */
  const initializeGoogleDrive = useCallback(async () => {
    try {
      setGoogleDriveState(prev => ({ ...prev, isLoading: true, error: null }));

      await googleDriveService.initialize();
      const userInfo = googleDriveService.getUserInfo();

      setGoogleDriveState(prev => ({
        ...prev,
        isInitialized: true,
        isSignedIn: !!userInfo,
        userInfo,
        isLoading: false
      }));

      if (userInfo) {
        showSuccess(`Conectado a Google Drive como ${userInfo.name}`);
      }

    } catch (error) {
      setGoogleDriveState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
        isInitialized: false,
        isSignedIn: false
      }));
      showError(`Error inicializando Google Drive: ${error.message}`);
      throw error;
    }
  }, [showSuccess, showError]);

  /**
   * Crear backup manual o automático
   */
  const createBackup = useCallback(async (type = 'manual', destination = 'local') => {
    try {
      const timestamp = new Date().toISOString();
      const backupData = {
        metadata: {
          version: '1.0.0',
          createdAt: timestamp,
          type, // 'manual' | 'automatic'
          destination, // 'local' | 'googledrive' | 'both'
          customerCount: customers.length,
          appVersion: process.env.REACT_APP_VERSION || '1.0.0'
        },
        customers,
        settings: {
          stampsPerReward: localStorage.getItem('stampsPerReward') || 10
        }
      };

      const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Backup local (siempre)
      if (destination === 'local' || destination === 'both') {
        await saveLocalBackup(backupId, backupData);
      }

      // Backup Google Drive (si está habilitado)
      if ((destination === 'google-drive' || destination === 'both') && backupSettings.googleDriveEnabled) {
        await saveToGoogleDrive(backupId, backupData);
      }

      // Actualizar historial
      const historyEntry = {
        id: backupId,
        timestamp,
        type,
        destination,
        customerCount: customers.length,
        size: JSON.stringify(backupData).length,
        status: 'success'
      };

      setBackupHistory(prev => {
        const updated = [historyEntry, ...prev];
        // Mantener solo los últimos backups según configuración
        return updated.slice(0, backupSettings.maxLocalBackups);
      });

      // Actualizar última fecha de backup
      setBackupSettings(prev => ({
        ...prev,
        lastBackupDate: timestamp
      }));

      showSuccess(`Backup ${type} creado exitosamente`);
      return backupId;

    } catch (error) {
      console.error('Error creating backup:', error);
      showError(`Error al crear backup: ${error.message}`);
      
      // Registrar error en historial
      const errorEntry = {
        id: `error_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type,
        destination,
        customerCount: customers.length,
        status: 'error',
        error: error.message
      };
      
      setBackupHistory(prev => [errorEntry, ...prev.slice(0, backupSettings.maxLocalBackups - 1)]);
      throw error;
    }
  }, [customers, backupSettings, showSuccess, showError]);

  /**
   * Guardar backup localmente (descarga automática)
   */
  const saveLocalBackup = useCallback(async (backupId, backupData) => {
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    
    a.href = url;
    a.download = `acrilcard-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    // Guardar referencia local para restauración rápida
    localStorage.setItem(`backup_${backupId}`, JSON.stringify(backupData));
  }, []);

  /**
   * Guardar en Google Drive (implementación completa)
   */
  const saveToGoogleDrive = useCallback(async (backupId, backupData) => {
    try {
      if (!backupSettings.googleDriveEnabled) {
        throw new Error('Google Drive no está habilitado en la configuración');
      }

      setGoogleDriveState(prev => ({ ...prev, isLoading: true, error: null }));

      // Inicializar Google Drive si no está inicializado
      if (!googleDriveState.isInitialized) {
        console.log('🔄 Inicializando Google Drive antes de subir backup...');
        try {
          await initializeGoogleDrive();
        } catch (initError) {
          throw new Error(`No se pudo inicializar Google Drive: ${initError.message}`);
        }
      }

      // Verificar si está autenticado
      if (!googleDriveState.isSignedIn) {
        throw new Error('Debes iniciar sesión en Google Drive primero. Haz clic en "Iniciar Sesión" en el panel de Google Drive.');
      }

      // Subir backup
      console.log('📤 Subiendo backup a Google Drive...');
      const result = await googleDriveService.uploadBackup(backupId, backupData);
      
      setGoogleDriveState(prev => ({ ...prev, isLoading: false }));
      showSuccess(`✅ Backup subido a Google Drive: ${result.fileName}`);
      
      return result;

    } catch (error) {
      setGoogleDriveState(prev => ({ ...prev, isLoading: false, error: error.message }));
      console.error('❌ Error saving to Google Drive:', error);
      showError(`Error al guardar en Google Drive: ${error.message}`);
      throw error;
    }
  }, [backupSettings.googleDriveEnabled, googleDriveState.isInitialized, googleDriveState.isSignedIn, showSuccess, showError, initializeGoogleDrive]);

  /**
   * Autenticar con Google Drive
   */
  const signInToGoogleDrive = useCallback(async () => {
    try {
      setGoogleDriveState(prev => ({ ...prev, isLoading: true, error: null }));

      if (!googleDriveState.isInitialized) {
        console.log('🔄 Inicializando Google Drive antes de autenticar...');
        await initializeGoogleDrive();
      }

      console.log('🔐 Iniciando proceso de autenticación...');
      const userInfo = await googleDriveService.signIn();

      // Guardar sesión para persistencia entre navegadores
      const sessionData = {
        userInfo,
        timestamp: Date.now(),
        expiresAt: Date.now() + (60 * 60 * 1000) // 1 hora
      };
      localStorage.setItem('googleDriveSession', JSON.stringify(sessionData));

      setGoogleDriveState(prev => ({
        ...prev,
        isSignedIn: true,
        userInfo,
        isLoading: false,
        error: null
      }));

      showSuccess(`✅ Autenticado en Google Drive como ${userInfo.name}`);
      return userInfo;

    } catch (error) {
      console.error('❌ Error en signInToGoogleDrive:', error);
      
      // Extraer mensaje de error legible
      const errorMessage = error?.message || 'Error desconocido al iniciar sesión';
      
      setGoogleDriveState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage,
        isSignedIn: false
      }));
      
      // Solo mostrar error si no fue cancelado por el usuario
      if (!errorMessage.includes('cancelado')) {
        showError(errorMessage);
      }
      
      // No lanzar el error para evitar que se propague
      console.log('ℹ️ Autenticación no completada:', errorMessage);
    }
  }, [googleDriveState.isInitialized, initializeGoogleDrive, showSuccess, showError]);

  /**
   * Cerrar sesión de Google Drive
   */
  const signOutFromGoogleDrive = useCallback(async () => {
    try {
      await googleDriveService.signOut();

      // Limpiar sesión guardada
      localStorage.removeItem('googleDriveSession');

      setGoogleDriveState(prev => ({
        ...prev,
        isSignedIn: false,
        userInfo: null,
        error: null
      }));

      showSuccess('Sesión cerrada en Google Drive');

    } catch (error) {
      showError(`Error cerrando sesión: ${error.message}`);
    }
  }, [showSuccess, showError]);

  /**
   * Restaurar desde backup
   */
  const restoreFromBackup = useCallback(async (backupId) => {
    try {
      const backupData = localStorage.getItem(`backup_${backupId}`);
      if (!backupData) {
        throw new Error('Backup no encontrado');
      }

      const parsed = JSON.parse(backupData);
      
      // Validar estructura del backup
      if (!parsed.customers || !Array.isArray(parsed.customers)) {
        throw new Error('Formato de backup inválido');
      }

      // Confirmar restauración
      const confirmed = window.confirm(
        `¿Estás seguro de restaurar el backup del ${new Date(parsed.metadata.createdAt).toLocaleString()}?\n\n` +
        `Esto reemplazará ${customers.length} clientes actuales con ${parsed.customers.length} clientes del backup.`
      );

      if (!confirmed) return;

      // Crear backup de seguridad antes de restaurar
      await createBackup('pre-restore', 'local');

      // Restaurar datos
      localStorage.setItem('customers', JSON.stringify(parsed.customers));
      
      if (parsed.settings?.stampsPerReward) {
        localStorage.setItem('stampsPerReward', parsed.settings.stampsPerReward);
      }

      showSuccess(`Backup restaurado exitosamente. ${parsed.customers.length} clientes cargados.`);
      
      // Recargar página para aplicar cambios
      window.location.reload();

    } catch (error) {
      console.error('Error restoring backup:', error);
      showError(`Error al restaurar backup: ${error.message}`);
    }
  }, [customers.length, createBackup, showSuccess, showError]);

  /**
   * Verificar manualmente si es necesario un backup automático
   */
  const checkIfBackupNeeded = useCallback(() => {
    if (!backupSettings.autoBackupEnabled) return false;
    
    const now = new Date();
    const lastBackup = backupSettings.lastBackupDate ? new Date(backupSettings.lastBackupDate) : null;
    
    return !lastBackup || (now - lastBackup) >= (backupSettings.backupInterval * 60 * 60 * 1000);
  }, [backupSettings]);

  /**
   * Programar backup automático mejorado
   */
  useEffect(() => {
    if (!backupSettings.autoBackupEnabled) return;

    const checkAutoBackup = async () => {
      const now = new Date();
      const lastBackup = backupSettings.lastBackupDate ? new Date(backupSettings.lastBackupDate) : null;
      
      if (!lastBackup || (now - lastBackup) >= (backupSettings.backupInterval * 60 * 60 * 1000)) {
        try {
          // Mostrar notificación de que se va a crear backup automático
          showWarning('Creando backup automático...', { duration: 3000 });
          
          await createBackup('automatic', backupSettings.googleDriveEnabled ? 'both' : 'local');
        } catch (error) {
          console.error('Auto backup failed:', error);
          showError(`Backup automático falló: ${error.message}`);
        }
      }
    };

    // Verificar inmediatamente al cargar (después de 5 segundos para evitar interferir con la carga inicial)
    const initialTimeout = setTimeout(() => {
      if (checkIfBackupNeeded()) {
        showWarning(`Se necesita un backup automático. Última copia: ${backupSettings.lastBackupDate ? new Date(backupSettings.lastBackupDate).toLocaleString() : 'Nunca'}`, { duration: 5000 });
      }
    }, 5000);

    // Programar verificaciones periódicas cada hora
    const interval = setInterval(checkAutoBackup, 60 * 60 * 1000);
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [backupSettings, createBackup, checkIfBackupNeeded, showWarning, showError]);

  /**
   * Limpiar backups antiguos
   */
  const cleanOldBackups = useCallback(() => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('backup_'));
    const sortedKeys = keys.sort().reverse(); // Más recientes primero
    
    // Eliminar backups que excedan el límite
    const toDelete = sortedKeys.slice(backupSettings.maxLocalBackups);
    toDelete.forEach(key => localStorage.removeItem(key));
    
    if (toDelete.length > 0) {
      showSuccess(`${toDelete.length} backups antiguos eliminados`);
    }
  }, [backupSettings.maxLocalBackups, showSuccess]);

  /**
   * Limpiar todo el historial de backups
   */
  const clearBackupHistory = useCallback(() => {
    setBackupHistory([]);
    showSuccess('Historial de backups limpiado correctamente');
  }, [showSuccess]);

  /**
   * Obtener estadísticas de backup
   */
  const getBackupStats = useCallback(() => {
    const totalBackups = backupHistory.length;
    const successfulBackups = backupHistory.filter(b => b.status === 'success').length;
    const failedBackups = backupHistory.filter(b => b.status === 'error').length;
    const lastBackup = backupHistory[0];
    
    return {
      totalBackups,
      successfulBackups,
      failedBackups,
      lastBackup,
      nextAutoBackup: backupSettings.lastBackupDate ? 
        new Date(new Date(backupSettings.lastBackupDate).getTime() + (backupSettings.backupInterval * 60 * 60 * 1000)) : 
        new Date(),
      backupNeeded: checkIfBackupNeeded()
    };
  }, [backupHistory, backupSettings, checkIfBackupNeeded]);

  /**
   * Sincronización bidireccional con Google Drive
   */
  const syncWithGoogleDrive = useCallback(async () => {
    try {
      if (!googleDriveState.isSignedIn) {
        throw new Error('Usuario no autenticado en Google Drive');
      }

      setGoogleDriveState(prev => ({ ...prev, isLoading: true, error: null }));

      // Obtener historial local para sincronización
      const localBackups = backupHistory
        .filter(b => b.status === 'success')
        .map(b => {
          const localData = localStorage.getItem(`backup_${b.id}`);
          return localData ? JSON.parse(localData) : null;
        })
        .filter(Boolean);

      const syncResults = await googleDriveService.syncWithGoogleDrive(localBackups);

      setGoogleDriveState(prev => ({ ...prev, isLoading: false }));

      if (syncResults.errors.length > 0) {
        showWarning(`Sincronización completada con ${syncResults.errors.length} errores`);
      } else {
        showSuccess(`Sincronización completada: ${syncResults.uploaded.length} subidos, ${syncResults.downloaded.length} descargados`);
      }

      return syncResults;

    } catch (error) {
      setGoogleDriveState(prev => ({ ...prev, isLoading: false, error: error.message }));
      showError(`Error en sincronización: ${error.message}`);
      throw error;
    }
  }, [googleDriveState.isSignedIn, backupHistory, showSuccess, showWarning, showError]);

  return {
    // Estado
    backupSettings,
    backupHistory,
    googleDriveState,

    // Acciones principales
    createBackup,
    restoreFromBackup,

    // Configuración
    setBackupSettings,
    cleanOldBackups,
    clearBackupHistory,

    // Utilidades
    getBackupStats,
    checkIfBackupNeeded,

    // Google Drive (completamente funcional)
    saveToGoogleDrive,
    initializeGoogleDrive,
    signInToGoogleDrive,
    signOutFromGoogleDrive,
    syncWithGoogleDrive
  };
};

export default useAutoBackup;
