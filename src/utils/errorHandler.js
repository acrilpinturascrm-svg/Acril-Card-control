/**
 * Sistema de manejo de errores completo para ACRILCARD
 * Proporciona logging, recuperación automática y notificaciones al usuario
 */

import { validator } from './validation';

// Tipos de errores
export const ERROR_TYPES = {
  VALIDATION: 'validation',
  NETWORK: 'network',
  STORAGE: 'storage',
  AUTHENTICATION: 'authentication',
  PERMISSION: 'permission',
  BUSINESS_LOGIC: 'business_logic',
  SYSTEM: 'system',
  USER_INPUT: 'user_input'
};

// Severidad de errores
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Estrategias de recuperación
export const RECOVERY_STRATEGIES = {
  RETRY: 'retry',
  FALLBACK: 'fallback',
  USER_ACTION: 'user_action',
  IGNORE: 'ignore',
  RELOAD: 'reload'
};

/**
 * Clase principal para manejo de errores
 */
export class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 1000;
    this.retryAttempts = new Map();
    this.maxRetries = 3;
    this.notificationCallback = null;
    
    // Configurar manejo global de errores
    this.setupGlobalHandlers();
  }

  /**
   * Configurar manejadores globales
   */
  setupGlobalHandlers() {
    // Errores no capturados
    window.addEventListener('error', (event) => {
      this.handleError({
        type: ERROR_TYPES.SYSTEM,
        severity: ERROR_SEVERITY.HIGH,
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString()
      });
    });

    // Promesas rechazadas no manejadas
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: ERROR_TYPES.SYSTEM,
        severity: ERROR_SEVERITY.HIGH,
        message: 'Unhandled Promise Rejection',
        reason: event.reason,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Configurar callback de notificaciones
   */
  setNotificationCallback(callback) {
    this.notificationCallback = callback;
  }

  /**
   * Manejar error principal
   */
  handleError(error, context = {}) {
    try {
      // Normalizar error
      const normalizedError = this.normalizeError(error, context);
      
      // Registrar en log
      this.logError(normalizedError);
      
      // Determinar estrategia de recuperación
      const strategy = this.determineRecoveryStrategy(normalizedError);
      
      // Ejecutar recuperación
      const recovered = this.executeRecovery(normalizedError, strategy);
      
      // Notificar al usuario si es necesario
      if (this.shouldNotifyUser(normalizedError, recovered)) {
        this.notifyUser(normalizedError, strategy);
      }
      
      return {
        error: normalizedError,
        strategy,
        recovered
      };
    } catch (handlerError) {
      console.error('Error in error handler:', handlerError);
      this.fallbackErrorHandling(error);
    }
  }

  /**
   * Normalizar error a formato estándar
   */
  normalizeError(error, context = {}) {
    const baseError = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: context.userId || 'anonymous',
        action: context.action || 'unknown',
        component: context.component || 'unknown',
        ...context
      }
    };

    // Error de JavaScript nativo
    if (error instanceof Error) {
      return {
        ...baseError,
        type: ERROR_TYPES.SYSTEM,
        severity: ERROR_SEVERITY.MEDIUM,
        message: error.message,
        name: error.name,
        stack: error.stack,
        cause: error.cause
      };
    }

    // Error de validación
    if (error.isValidationError || error.type === ERROR_TYPES.VALIDATION) {
      return {
        ...baseError,
        type: ERROR_TYPES.VALIDATION,
        severity: ERROR_SEVERITY.LOW,
        message: error.message || 'Error de validación',
        fields: error.fields || {},
        validationErrors: error.validationErrors || {}
      };
    }

    // Error de red
    if (error.isNetworkError || error.type === ERROR_TYPES.NETWORK) {
      return {
        ...baseError,
        type: ERROR_TYPES.NETWORK,
        severity: ERROR_SEVERITY.MEDIUM,
        message: error.message || 'Error de conexión',
        status: error.status,
        statusText: error.statusText,
        url: error.url
      };
    }

    // Error de almacenamiento
    if (error.isStorageError || error.type === ERROR_TYPES.STORAGE) {
      return {
        ...baseError,
        type: ERROR_TYPES.STORAGE,
        severity: ERROR_SEVERITY.HIGH,
        message: error.message || 'Error de almacenamiento',
        operation: error.operation,
        data: error.data
      };
    }

    // Error genérico
    return {
      ...baseError,
      type: error.type || ERROR_TYPES.SYSTEM,
      severity: error.severity || ERROR_SEVERITY.MEDIUM,
      message: error.message || 'Error desconocido',
      ...error
    };
  }

  /**
   * Registrar error en log
   */
  logError(error) {
    // Agregar al log local
    this.errorLog.unshift(error);
    
    // Mantener tamaño del log
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Guardar en localStorage para persistencia
    try {
      const errorLogForStorage = this.errorLog.slice(0, 100); // Solo últimos 100
      localStorage.setItem('acrilcard_error_log', JSON.stringify(errorLogForStorage));
    } catch (storageError) {
      console.warn('No se pudo guardar log de errores:', storageError);
    }

    // Log en consola para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error ${error.severity.toUpperCase()}: ${error.type}`);
      console.error('Message:', error.message);
      console.error('Context:', error.context);
      if (error.stack) console.error('Stack:', error.stack);
      console.groupEnd();
    }
  }

  /**
   * Determinar estrategia de recuperación
   */
  determineRecoveryStrategy(error) {
    const { type, severity, context } = error;

    // Errores críticos del sistema
    if (severity === ERROR_SEVERITY.CRITICAL) {
      return RECOVERY_STRATEGIES.RELOAD;
    }

    // Errores de red
    if (type === ERROR_TYPES.NETWORK) {
      const retryCount = this.getRetryCount(error.id);
      if (retryCount < this.maxRetries) {
        return RECOVERY_STRATEGIES.RETRY;
      }
      return RECOVERY_STRATEGIES.FALLBACK;
    }

    // Errores de almacenamiento
    if (type === ERROR_TYPES.STORAGE) {
      return RECOVERY_STRATEGIES.FALLBACK;
    }

    // Errores de validación
    if (type === ERROR_TYPES.VALIDATION) {
      return RECOVERY_STRATEGIES.USER_ACTION;
    }

    // Errores de permisos
    if (type === ERROR_TYPES.PERMISSION) {
      return RECOVERY_STRATEGIES.USER_ACTION;
    }

    // Errores de autenticación
    if (type === ERROR_TYPES.AUTHENTICATION) {
      return RECOVERY_STRATEGIES.USER_ACTION;
    }

    // Por defecto, solicitar acción del usuario
    return RECOVERY_STRATEGIES.USER_ACTION;
  }

  /**
   * Ejecutar estrategia de recuperación
   */
  executeRecovery(error, strategy) {
    try {
      switch (strategy) {
        case RECOVERY_STRATEGIES.RETRY:
          return this.executeRetry(error);
          
        case RECOVERY_STRATEGIES.FALLBACK:
          return this.executeFallback(error);
          
        case RECOVERY_STRATEGIES.RELOAD:
          return this.executeReload(error);
          
        case RECOVERY_STRATEGIES.IGNORE:
          return true;
          
        case RECOVERY_STRATEGIES.USER_ACTION:
        default:
          return false; // Requiere acción del usuario
      }
    } catch (recoveryError) {
      console.error('Error en recuperación:', recoveryError);
      return false;
    }
  }

  /**
   * Ejecutar reintento
   */
  executeRetry(error) {
    const retryCount = this.incrementRetryCount(error.id);
    
    if (retryCount > this.maxRetries) {
      return false;
    }

    // Delay exponencial
    const delay = Math.pow(2, retryCount) * 1000;
    
    setTimeout(() => {
      // Reintento basado en el contexto
      if (error.context.retryFunction) {
        error.context.retryFunction();
      }
    }, delay);

    return true;
  }

  /**
   * Ejecutar fallback
   */
  executeFallback(error) {
    const { type, context } = error;

    switch (type) {
      case ERROR_TYPES.STORAGE:
        // Fallback a memoria temporal
        this.enableMemoryFallback();
        return true;

      case ERROR_TYPES.NETWORK:
        // Activar modo offline
        this.enableOfflineMode();
        return true;

      default:
        return false;
    }
  }

  /**
   * Ejecutar recarga
   */
  executeReload(error) {
    // Guardar estado antes de recargar
    this.saveStateBeforeReload();
    
    // Mostrar mensaje al usuario
    if (this.notificationCallback) {
      this.notificationCallback({
        type: 'error',
        title: 'Error Crítico',
        message: 'La aplicación se recargará para recuperarse del error.',
        persistent: true
      });
    }

    // Recargar después de un breve delay
    setTimeout(() => {
      window.location.reload();
    }, 3000);

    return true;
  }

  /**
   * Habilitar fallback de memoria
   */
  enableMemoryFallback() {
    // Crear almacenamiento temporal en memoria
    window.acrilcardTempStorage = window.acrilcardTempStorage || {};
    
    // Notificar que se está usando almacenamiento temporal
    if (this.notificationCallback) {
      this.notificationCallback({
        type: 'warning',
        title: 'Modo Temporal',
        message: 'Los datos se guardan temporalmente. Exporte sus datos cuando sea posible.',
        persistent: true
      });
    }
  }

  /**
   * Habilitar modo offline
   */
  enableOfflineMode() {
    // Marcar aplicación como offline
    window.acrilcardOfflineMode = true;
    
    // Notificar modo offline
    if (this.notificationCallback) {
      this.notificationCallback({
        type: 'info',
        title: 'Modo Offline',
        message: 'Trabajando sin conexión. Los datos se sincronizarán cuando vuelva la conexión.',
        persistent: true
      });
    }
  }

  /**
   * Guardar estado antes de recargar
   */
  saveStateBeforeReload() {
    try {
      const currentState = {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        customers: JSON.parse(localStorage.getItem('customers') || '[]'),
        settings: JSON.parse(localStorage.getItem('backupSettings') || '{}')
      };
      
      localStorage.setItem('acrilcard_recovery_state', JSON.stringify(currentState));
    } catch (error) {
      console.warn('No se pudo guardar estado de recuperación:', error);
    }
  }

  /**
   * Determinar si notificar al usuario
   */
  shouldNotifyUser(error, recovered) {
    const { type, severity } = error;

    // Siempre notificar errores críticos
    if (severity === ERROR_SEVERITY.CRITICAL) {
      return true;
    }

    // Notificar errores altos no recuperados
    if (severity === ERROR_SEVERITY.HIGH && !recovered) {
      return true;
    }

    // Notificar errores de validación
    if (type === ERROR_TYPES.VALIDATION) {
      return true;
    }

    // Notificar errores de permisos y autenticación
    if (type === ERROR_TYPES.PERMISSION || type === ERROR_TYPES.AUTHENTICATION) {
      return true;
    }

    return false;
  }

  /**
   * Notificar al usuario
   */
  notifyUser(error, strategy) {
    if (!this.notificationCallback) return;

    const notification = this.createUserNotification(error, strategy);
    this.notificationCallback(notification);
  }

  /**
   * Crear notificación para el usuario
   */
  createUserNotification(error, strategy) {
    const { type, severity, message } = error;

    // Mensajes amigables para el usuario
    const userMessages = {
      [ERROR_TYPES.VALIDATION]: {
        title: 'Datos Incorrectos',
        message: 'Por favor, revise los datos ingresados.',
        type: 'warning'
      },
      [ERROR_TYPES.NETWORK]: {
        title: 'Problema de Conexión',
        message: 'Verifique su conexión a internet e intente nuevamente.',
        type: 'error'
      },
      [ERROR_TYPES.STORAGE]: {
        title: 'Error de Almacenamiento',
        message: 'No se pudieron guardar los datos. Verifique el espacio disponible.',
        type: 'error'
      },
      [ERROR_TYPES.PERMISSION]: {
        title: 'Sin Permisos',
        message: 'No tiene permisos para realizar esta acción.',
        type: 'warning'
      },
      [ERROR_TYPES.AUTHENTICATION]: {
        title: 'Sesión Expirada',
        message: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
        type: 'error'
      }
    };

    const defaultMessage = userMessages[type] || {
      title: 'Error',
      message: 'Ha ocurrido un error inesperado.',
      type: 'error'
    };

    return {
      ...defaultMessage,
      details: message,
      severity,
      strategy,
      timestamp: new Date().toISOString(),
      persistent: severity === ERROR_SEVERITY.CRITICAL || severity === ERROR_SEVERITY.HIGH
    };
  }

  /**
   * Utilidades para conteo de reintentos
   */
  getRetryCount(errorId) {
    return this.retryAttempts.get(errorId) || 0;
  }

  incrementRetryCount(errorId) {
    const current = this.getRetryCount(errorId);
    const newCount = current + 1;
    this.retryAttempts.set(errorId, newCount);
    return newCount;
  }

  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Manejo de errores de fallback
   */
  fallbackErrorHandling(originalError) {
    console.error('Fallback error handling:', originalError);
    
    // Intentar mostrar notificación básica
    try {
      if (this.notificationCallback) {
        this.notificationCallback({
          type: 'error',
          title: 'Error Crítico',
          message: 'Ha ocurrido un error grave. Por favor, recargue la página.',
          persistent: true
        });
      }
    } catch (notificationError) {
      // Último recurso: alert nativo
      alert('Error crítico en la aplicación. Por favor, recargue la página.');
    }
  }

  /**
   * Obtener estadísticas de errores
   */
  getErrorStats() {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentErrors = this.errorLog.filter(error => 
      new Date(error.timestamp) > last24Hours
    );

    const errorsByType = {};
    const errorsBySeverity = {};

    recentErrors.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
    });

    return {
      totalErrors: this.errorLog.length,
      recentErrors: recentErrors.length,
      errorsByType,
      errorsBySeverity,
      lastError: this.errorLog[0] || null
    };
  }

  /**
   * Limpiar logs antiguos
   */
  clearOldLogs(daysToKeep = 7) {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    this.errorLog = this.errorLog.filter(error => 
      new Date(error.timestamp) > cutoffDate
    );
  }

  /**
   * Exportar logs para debugging
   */
  exportLogs() {
    const exportData = {
      timestamp: new Date().toISOString(),
      version: process.env.REACT_APP_VERSION || '1.0.0',
      userAgent: navigator.userAgent,
      url: window.location.href,
      errors: this.errorLog,
      stats: this.getErrorStats()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acrilcard-error-log-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Instancia singleton
export const errorHandler = new ErrorHandler();

// Funciones de utilidad para manejo rápido de errores
export const handleError = (error, context) => errorHandler.handleError(error, context);

export const createValidationError = (message, fields = {}) => ({
  type: ERROR_TYPES.VALIDATION,
  severity: ERROR_SEVERITY.LOW,
  message,
  fields,
  isValidationError: true
});

export const createNetworkError = (message, status, url) => ({
  type: ERROR_TYPES.NETWORK,
  severity: ERROR_SEVERITY.MEDIUM,
  message,
  status,
  url,
  isNetworkError: true
});

export const createStorageError = (message, operation, data) => ({
  type: ERROR_TYPES.STORAGE,
  severity: ERROR_SEVERITY.HIGH,
  message,
  operation,
  data,
  isStorageError: true
});

// Decorador para funciones que pueden fallar
export const withErrorHandling = (fn, context = {}) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, {
        ...context,
        function: fn.name,
        arguments: args
      });
      throw error;
    }
  };
};

export default ErrorHandler;
