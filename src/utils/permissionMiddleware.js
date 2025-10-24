// Middleware de Control de Acceso para ACRILCARD
// Implementa verificaciones de permisos de manera eficiente y reutilizable

import { PERMISSIONS, PermissionChecker } from './permissions.simple';

/**
 * 🛡️ MIDDLEWARE DE CONTROL DE ACCESO
 * Funciones estáticas para verificar permisos de manera eficiente
 */
export class PermissionMiddleware {
  /**
   * Verificar si un usuario tiene un permiso específico
   */
  static hasPermission(userPermissions, permission) {
    if (!userPermissions || !Array.isArray(userPermissions)) {
      return false;
    }
    return userPermissions.includes(permission);
  }

  /**
   * Verificar múltiples permisos (AND lógico)
   */
  static hasAllPermissions(userPermissions, permissions) {
    if (!permissions || permissions.length === 0) return true;
    return permissions.every(permission =>
      PermissionMiddleware.hasPermission(userPermissions, permission)
    );
  }

  /**
   * Verificar múltiples permisos (OR lógico)
   */
  static hasAnyPermission(userPermissions, permissions) {
    if (!permissions || permissions.length === 0) return false;
    return permissions.some(permission =>
      PermissionMiddleware.hasPermission(userPermissions, permission)
    );
  }

  /**
   * Verificar permisos para rutas específicas
   */
  static canAccessRoute(userPermissions, route) {
    const routePermissionMap = {
      '/': [PERMISSIONS.CUSTOMER_VIEW],
      '/customers': [PERMISSIONS.CUSTOMER_VIEW],
      '/cliente': [PERMISSIONS.CUSTOMER_VIEW],
      '/admin': [PERMISSIONS.SYSTEM_CONFIG],
      '/settings': [PERMISSIONS.SYSTEM_CONFIG],
      '/reports': [PERMISSIONS.REPORTS_VIEW],
      '/test-errors': [PERMISSIONS.SYSTEM_LOGS],
      '/analytics': [PERMISSIONS.ANALYTICS_VIEW],
      '/system': [PERMISSIONS.SYSTEM_CONFIG],
      '/users': [PERMISSIONS.USER_MANAGEMENT],
      '/logs': [PERMISSIONS.SYSTEM_LOGS]
    };

    const requiredPermissions = routePermissionMap[route];
    return requiredPermissions ?
      PermissionMiddleware.hasAnyPermission(userPermissions, requiredPermissions) : true;
  }

  /**
   * Verificar permisos para acciones específicas
   */
  static canPerformAction(userPermissions, action, context = {}) {
    const actionPermissionMap = {
      // Gestión de clientes
      'view_customers': PERMISSIONS.CUSTOMER_VIEW,
      'create_customer': PERMISSIONS.CUSTOMER_CREATE,
      'edit_customer': PERMISSIONS.CUSTOMER_EDIT,
      'delete_customer': PERMISSIONS.CUSTOMER_DELETE,
      'export_customers': PERMISSIONS.CUSTOMER_EXPORT,

      // Gestión de sellos
      'manage_stamps': PERMISSIONS.STAMPS_MANAGE,
      'configure_stamps': PERMISSIONS.STAMPS_CONFIG,
      'manage_rewards': PERMISSIONS.REWARDS_MANAGE,
      'claim_rewards': PERMISSIONS.REWARDS_CLAIM,

      // Import/Export
      'import_data': PERMISSIONS.DATA_IMPORT,
      'export_data': PERMISSIONS.DATA_EXPORT,
      'normalize_data': PERMISSIONS.DATA_NORMALIZE,
      'backup_data': PERMISSIONS.DATA_BACKUP,

      // Sistema
      'configure_system': PERMISSIONS.SYSTEM_CONFIG,
      'manage_users': PERMISSIONS.USER_MANAGEMENT,
      'view_logs': PERMISSIONS.SYSTEM_LOGS,
      'backup_system': PERMISSIONS.SYSTEM_BACKUP,
      'maintain_system': PERMISSIONS.SYSTEM_MAINTENANCE,

      // PWA
      'install_pwa': PERMISSIONS.PWA_INSTALL,
      'access_offline': PERMISSIONS.OFFLINE_ACCESS,
      'update_pwa': PERMISSIONS.PWA_UPDATE,

      // Comunicaciones
      'send_whatsapp': PERMISSIONS.WHATSAPP_SEND,
      'send_notifications': PERMISSIONS.NOTIFICATIONS_SEND,
      'send_email': PERMISSIONS.EMAIL_SEND,

      // Reportes
      'view_reports': PERMISSIONS.REPORTS_VIEW,
      'view_advanced_reports': PERMISSIONS.REPORTS_ADVANCED,
      'view_analytics': PERMISSIONS.ANALYTICS_VIEW,
      'export_analytics': PERMISSIONS.ANALYTICS_EXPORT,
    };

    const requiredPermission = actionPermissionMap[action];
    return requiredPermission ?
      PermissionMiddleware.hasPermission(userPermissions, requiredPermission) : false;
  }

  /**
   * Verificar permisos CRUD para un recurso
   */
  static canCRUD(userPermissions, resource, operation) {
    const crudPermissions = {
      customer: {
        create: PERMISSIONS.CUSTOMER_CREATE,
        read: PERMISSIONS.CUSTOMER_VIEW,
        update: PERMISSIONS.CUSTOMER_EDIT,
        delete: PERMISSIONS.CUSTOMER_DELETE,
      },
      stamps: {
        create: PERMISSIONS.STAMPS_MANAGE,
        read: PERMISSIONS.STAMPS_MANAGE,
        update: PERMISSIONS.STAMPS_MANAGE,
        delete: null,
      },
      rewards: {
        create: PERMISSIONS.REWARDS_MANAGE,
        read: PERMISSIONS.REWARDS_MANAGE,
        update: PERMISSIONS.REWARDS_MANAGE,
        delete: null,
      }
    };

    const resourcePermissions = crudPermissions[resource];
    if (!resourcePermissions) return false;

    const requiredPermission = resourcePermissions[operation];
    return requiredPermission ?
      PermissionMiddleware.hasPermission(userPermissions, requiredPermission) : false;
  }

  /**
   * Verificar permisos para módulos específicos
   */
  static hasModuleAccess(userPermissions, module) {
    const modulePermissions = {
      customers: [
        PERMISSIONS.CUSTOMER_VIEW,
        PERMISSIONS.CUSTOMER_CREATE,
        PERMISSIONS.CUSTOMER_EDIT,
        PERMISSIONS.CUSTOMER_DELETE
      ],
      stamps: [
        PERMISSIONS.STAMPS_MANAGE,
        PERMISSIONS.STAMPS_CONFIG,
        PERMISSIONS.REWARDS_MANAGE,
        PERMISSIONS.REWARDS_CLAIM
      ],
      system: [
        PERMISSIONS.SYSTEM_CONFIG,
        PERMISSIONS.USER_MANAGEMENT,
        PERMISSIONS.SYSTEM_LOGS,
        PERMISSIONS.SYSTEM_BACKUP,
        PERMISSIONS.SYSTEM_MAINTENANCE
      ],
      data: [
        PERMISSIONS.DATA_IMPORT,
        PERMISSIONS.DATA_EXPORT,
        PERMISSIONS.DATA_NORMALIZE,
        PERMISSIONS.DATA_BACKUP
      ],
      reports: [
        PERMISSIONS.REPORTS_VIEW,
        PERMISSIONS.REPORTS_ADVANCED,
        PERMISSIONS.ANALYTICS_VIEW,
        PERMISSIONS.ANALYTICS_EXPORT
      ],
      communications: [
        PERMISSIONS.WHATSAPP_SEND,
        PERMISSIONS.NOTIFICATIONS_SEND,
        PERMISSIONS.EMAIL_SEND
      ],
      pwa: [
        PERMISSIONS.PWA_INSTALL,
        PERMISSIONS.OFFLINE_ACCESS,
        PERMISSIONS.PWA_UPDATE
      ]
    };

    const requiredPermissions = modulePermissions[module];
    return requiredPermissions ?
      PermissionMiddleware.hasAnyPermission(userPermissions, requiredPermissions) : false;
  }
}

/**
 * 🎯 FUNCIONES DE VERIFICACIÓN ESPECÍFICAS
 * Para casos de uso comunes y críticos
 */
export const PermissionValidators = {
  // Validar permisos para configuración crítica del sistema
  canModifyCriticalSettings: (userPermissions) => {
    return PermissionMiddleware.hasAllPermissions(userPermissions, [
      PERMISSIONS.SYSTEM_CONFIG,
      PERMISSIONS.STAMPS_CONFIG
    ]);
  },

  // Validar permisos para operaciones masivas de datos
  canPerformBulkOperations: (userPermissions) => {
    return PermissionMiddleware.hasAllPermissions(userPermissions, [
      PERMISSIONS.DATA_IMPORT,
      PERMISSIONS.DATA_EXPORT,
      PERMISSIONS.DATA_NORMALIZE
    ]);
  },

  // Validar permisos para gestión completa de usuarios
  canManageUsers: (userPermissions) => {
    return PermissionMiddleware.hasPermission(userPermissions, PERMISSIONS.USER_MANAGEMENT);
  },

  // Validar permisos para funcionalidades avanzadas
  canAccessAdvancedFeatures: (userPermissions) => {
    return PermissionMiddleware.hasAnyPermission(userPermissions, [
      PERMISSIONS.REPORTS_ADVANCED,
      PERMISSIONS.ANALYTICS_VIEW,
      PERMISSIONS.SYSTEM_LOGS,
      PERMISSIONS.USER_MANAGEMENT
    ]);
  },

  // Validar permisos para eliminar datos
  canDeleteData: (userPermissions) => {
    return PermissionMiddleware.hasPermission(userPermissions, PERMISSIONS.CUSTOMER_DELETE);
  },

  // Validar permisos para exportar datos sensibles
  canExportSensitiveData: (userPermissions) => {
    return PermissionMiddleware.hasAllPermissions(userPermissions, [
      PERMISSIONS.DATA_EXPORT,
      PERMISSIONS.ANALYTICS_EXPORT
    ]);
  },

  // Validar permisos para comunicaciones masivas
  canSendMassCommunications: (userPermissions) => {
    return PermissionMiddleware.hasAllPermissions(userPermissions, [
      PERMISSIONS.EMAIL_SEND,
      PERMISSIONS.NOTIFICATIONS_SEND
    ]);
  }
};

/**
 * 📊 ESTADÍSTICAS Y AUDITORÍA
 * Funciones para análisis y debugging de permisos
 */
export const PermissionAnalytics = {
  // Obtener estadísticas de permisos por usuario
  getUserPermissionStats: (userPermissions) => {
    const totalPermissions = userPermissions.length;
    const categories = {
      read: userPermissions.filter(p => p.includes('view') || p.includes('access')).length,
      write: userPermissions.filter(p => p.includes('create') || p.includes('edit') || p.includes('manage')).length,
      delete: userPermissions.filter(p => p.includes('delete')).length,
      admin: userPermissions.filter(p => p.includes('config') || p.includes('system') || p.includes('management')).length,
      communication: userPermissions.filter(p => p.includes('send') || p.includes('notification')).length,
      data: userPermissions.filter(p => p.includes('import') || p.includes('export') || p.includes('backup')).length
    };

    return {
      total: totalPermissions,
      byCategory: categories,
      utilizationRate: totalPermissions > 0 ? ((categories.read + categories.write) / totalPermissions * 100).toFixed(1) + '%' : '0%'
    };
  },

  // Comparar permisos entre roles
  compareRolePermissions: (userPermissions, role) => {
    const { ROLE_PERMISSIONS } = require('./permissions.simple');
    const rolePermissions = ROLE_PERMISSIONS[role] || [];

    const userSet = new Set(userPermissions);
    const roleSet = new Set(rolePermissions);

    const common = rolePermissions.filter(p => userSet.has(p));
    const userOnly = userPermissions.filter(p => !roleSet.has(p));
    const roleOnly = rolePermissions.filter(p => !userSet.has(p));

    return {
      common: common.length,
      userOnly: userOnly.length,
      roleOnly: roleOnly.length,
      coverage: ((common.length / rolePermissions.length) * 100).toFixed(1) + '%'
    };
  },

  // Identificar permisos no utilizados
  getUnusedPermissions: (userPermissions, lastActivity = {}) => {
    // Esta función podría analizar logs de actividad para identificar permisos no utilizados
    // Por simplicidad, retorna una estimación basada en categorías
    const unused = [];

    if (!userPermissions.includes(PERMISSIONS.CUSTOMER_DELETE)) {
      unused.push('Eliminar clientes');
    }

    if (!userPermissions.includes(PERMISSIONS.DATA_EXPORT)) {
      unused.push('Exportar datos');
    }

    if (!userPermissions.includes(PERMISSIONS.SYSTEM_CONFIG)) {
      unused.push('Configurar sistema');
    }

    return unused;
  }
};

/**
 * 🔒 FUNCIONES DE SEGURIDAD AVANZADA
 * Para validaciones críticas de seguridad
 */
export const SecurityValidators = {
  // Validar si puede realizar operaciones que afecten datos críticos
  canModifyCriticalData: (userPermissions) => {
    return PermissionMiddleware.hasAllPermissions(userPermissions, [
      PERMISSIONS.SYSTEM_CONFIG,
      PERMISSIONS.DATA_NORMALIZE,
      PERMISSIONS.DATA_BACKUP
    ]);
  },

  // Validar si puede acceder a información sensible
  canAccessSensitiveInfo: (userPermissions) => {
    return PermissionMiddleware.hasAnyPermission(userPermissions, [
      PERMISSIONS.SYSTEM_LOGS,
      PERMISSIONS.USER_MANAGEMENT,
      PERMISSIONS.ANALYTICS_VIEW
    ]);
  },

  // Validar si puede realizar operaciones de mantenimiento
  canPerformMaintenance: (userPermissions) => {
    return PermissionMiddleware.hasAllPermissions(userPermissions, [
      PERMISSIONS.SYSTEM_MAINTENANCE,
      PERMISSIONS.SYSTEM_BACKUP,
      PERMISSIONS.DATA_BACKUP
    ]);
  },

  // Validar si puede gestionar el sistema completamente
  canManageSystem: (userPermissions) => {
    return PermissionMiddleware.hasAllPermissions(userPermissions, [
      PERMISSIONS.SYSTEM_CONFIG,
      PERMISSIONS.USER_MANAGEMENT,
      PERMISSIONS.SYSTEM_LOGS,
      PERMISSIONS.SYSTEM_BACKUP,
      PERMISSIONS.SYSTEM_MAINTENANCE
    ]);
  }
};

/**
 * 🎨 FUNCIONES DE UI HELPER
 * Para facilitar el uso en componentes React
 */
export const PermissionUIHelpers = {
  // Obtener clases CSS basadas en permisos
  getPermissionBasedClasses: (userPermissions, permission, baseClasses, allowedClasses, deniedClasses) => {
    const hasPerm = PermissionMiddleware.hasPermission(userPermissions, permission);
    return hasPerm ? `${baseClasses} ${allowedClasses}` : `${baseClasses} ${deniedClasses}`;
  },

  // Obtener props condicionales basados en permisos
  getConditionalProps: (userPermissions, permission, allowedProps, deniedProps = {}) => {
    const hasPerm = PermissionMiddleware.hasPermission(userPermissions, permission);
    return hasPerm ? allowedProps : deniedProps;
  },

  // Generar atributos ARIA basados en permisos
  getAriaAttributes: (userPermissions, permission, label) => {
    const hasPerm = PermissionMiddleware.hasPermission(userPermissions, permission);
    return {
      'aria-label': hasPerm ? `${label} disponible` : `${label} no disponible`,
      'aria-disabled': !hasPerm,
      'tabIndex': hasPerm ? 0 : -1
    };
  },

  // Generar tooltips informativos
  getPermissionTooltip: (userPermissions, permission, allowedMessage, deniedMessage) => {
    const hasPerm = PermissionMiddleware.hasPermission(userPermissions, permission);
    return hasPerm ? allowedMessage : deniedMessage;
  }
};

/**
 * ⚡ FUNCIONES DE RENDIMIENTO OPTIMIZADO
 * Para casos donde la verificación de permisos es crítica
 */
export const OptimizedPermissionChecks = {
  // Cache de resultados de permisos (para evitar cálculos repetidos)
  permissionCache: new Map(),

  // Verificar permiso con cache
  cachedHasPermission: (userPermissions, permission, cacheKey = null) => {
    const key = cacheKey || `${userPermissions.sort().join(',')}-${permission}`;

    if (OptimizedPermissionChecks.permissionCache.has(key)) {
      return OptimizedPermissionChecks.permissionCache.get(key);
    }

    const result = PermissionMiddleware.hasPermission(userPermissions, permission);
    OptimizedPermissionChecks.permissionCache.set(key, result);

    // Limpiar cache si es muy grande
    if (OptimizedPermissionChecks.permissionCache.size > 1000) {
      OptimizedPermissionChecks.permissionCache.clear();
    }

    return result;
  },

  // Limpiar cache de permisos
  clearPermissionCache: () => {
    OptimizedPermissionChecks.permissionCache.clear();
  }
};
