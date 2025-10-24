// Archivo de permisos simplificado para evitar errores de sintaxis
export const USER_ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee'
};

export const PERMISSIONS = {
  CUSTOMER_VIEW: 'customer_view',
  CUSTOMER_CREATE: 'customer_create',
  CUSTOMER_EDIT: 'customer_edit',
  CUSTOMER_DELETE: 'customer_delete',
  CUSTOMER_EXPORT: 'customer_export',
  STAMPS_MANAGE: 'stamps_manage',
  STAMPS_CONFIG: 'stamps_config',
  REWARDS_MANAGE: 'rewards_manage',
  REWARDS_CLAIM: 'rewards_claim',
  DATA_IMPORT: 'data_import',
  DATA_EXPORT: 'data_export',
  DATA_NORMALIZE: 'data_normalize',
  DATA_BACKUP: 'data_backup',
  SYSTEM_CONFIG: 'system_config',
  USER_MANAGEMENT: 'user_management',
  SYSTEM_LOGS: 'system_logs',
  SYSTEM_BACKUP: 'system_backup',
  SYSTEM_MAINTENANCE: 'system_maintenance',
  PWA_INSTALL: 'pwa_install',
  OFFLINE_ACCESS: 'offline_access',
  PWA_UPDATE: 'pwa_update',
  WHATSAPP_SEND: 'whatsapp_send',
  NOTIFICATIONS_SEND: 'notifications_send',
  EMAIL_SEND: 'email_send',
  REPORTS_VIEW: 'reports_view',
  REPORTS_ADVANCED: 'reports_advanced',
  ANALYTICS_VIEW: 'analytics_view',
  ANALYTICS_EXPORT: 'analytics_export'
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: Object.values(PERMISSIONS),
  [USER_ROLES.EMPLOYEE]: [
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.CUSTOMER_CREATE,
    PERMISSIONS.CUSTOMER_EDIT,
    PERMISSIONS.STAMPS_MANAGE,
    PERMISSIONS.REWARDS_MANAGE,
    PERMISSIONS.REWARDS_CLAIM,
    PERMISSIONS.PWA_INSTALL,
    PERMISSIONS.OFFLINE_ACCESS,
    PERMISSIONS.WHATSAPP_SEND,
    PERMISSIONS.NOTIFICATIONS_SEND,
    PERMISSIONS.REPORTS_VIEW
  ]
};

export class PermissionChecker {
  constructor(userPermissions = []) {
    this.userPermissions = new Set(userPermissions);
  }

  hasPermission(permission) {
    return this.userPermissions.has(permission);
  }

  hasAllPermissions(permissions) {
    return permissions.every(permission => this.hasPermission(permission));
  }

  hasAnyPermission(permissions) {
    return permissions.some(permission => this.hasPermission(permission));
  }

  canPerformAction(action, context = {}) {
    const permission = this.getPermissionForAction(action, context);
    return permission ? this.hasPermission(permission) : false;
  }

  getPermissionForAction(action, context = {}) {
    const actionPermissionMap = {
      'view_customers': PERMISSIONS.CUSTOMER_VIEW,
      'create_customer': PERMISSIONS.CUSTOMER_CREATE,
      'edit_customer': PERMISSIONS.CUSTOMER_EDIT,
      'delete_customer': PERMISSIONS.CUSTOMER_DELETE,
      'export_customers': PERMISSIONS.CUSTOMER_EXPORT,
      'manage_stamps': PERMISSIONS.STAMPS_MANAGE,
      'configure_stamps': PERMISSIONS.STAMPS_CONFIG,
      'manage_rewards': PERMISSIONS.REWARDS_MANAGE,
      'claim_rewards': PERMISSIONS.REWARDS_CLAIM,
      'import_data': PERMISSIONS.DATA_IMPORT,
      'export_data': PERMISSIONS.DATA_EXPORT,
      'normalize_data': PERMISSIONS.DATA_NORMALIZE,
      'backup_data': PERMISSIONS.DATA_BACKUP,
      'configure_system': PERMISSIONS.SYSTEM_CONFIG,
      'manage_users': PERMISSIONS.USER_MANAGEMENT,
      'view_logs': PERMISSIONS.SYSTEM_LOGS,
      'backup_system': PERMISSIONS.SYSTEM_BACKUP,
      'maintain_system': PERMISSIONS.SYSTEM_MAINTENANCE,
      'install_pwa': PERMISSIONS.PWA_INSTALL,
      'access_offline': PERMISSIONS.OFFLINE_ACCESS,
      'update_pwa': PERMISSIONS.PWA_UPDATE,
      'send_whatsapp': PERMISSIONS.WHATSAPP_SEND,
      'send_notifications': PERMISSIONS.NOTIFICATIONS_SEND,
      'send_email': PERMISSIONS.EMAIL_SEND,
      'view_reports': PERMISSIONS.REPORTS_VIEW,
      'view_advanced_reports': PERMISSIONS.REPORTS_ADVANCED,
      'view_analytics': PERMISSIONS.ANALYTICS_VIEW,
      'export_analytics': PERMISSIONS.ANALYTICS_EXPORT
    };
    return actionPermissionMap[action];
  }

  canCRUD(resource) {
    const crudPermissions = {
      customer: {
        create: PERMISSIONS.CUSTOMER_CREATE,
        read: PERMISSIONS.CUSTOMER_VIEW,
        update: PERMISSIONS.CUSTOMER_EDIT,
        delete: PERMISSIONS.CUSTOMER_DELETE
      },
      stamps: {
        create: PERMISSIONS.STAMPS_MANAGE,
        read: PERMISSIONS.STAMPS_MANAGE,
        update: PERMISSIONS.STAMPS_MANAGE,
        delete: null
      },
      rewards: {
        create: PERMISSIONS.REWARDS_MANAGE,
        read: PERMISSIONS.REWARDS_MANAGE,
        update: PERMISSIONS.REWARDS_MANAGE,
        delete: null
      }
    };
    return crudPermissions[resource] || {};
  }

  hasModuleAccess(module) {
    const modulePermissions = {
      customers: [PERMISSIONS.CUSTOMER_VIEW, PERMISSIONS.CUSTOMER_CREATE, PERMISSIONS.CUSTOMER_EDIT, PERMISSIONS.CUSTOMER_DELETE],
      stamps: [PERMISSIONS.STAMPS_MANAGE, PERMISSIONS.STAMPS_CONFIG, PERMISSIONS.REWARDS_MANAGE, PERMISSIONS.REWARDS_CLAIM],
      system: [PERMISSIONS.SYSTEM_CONFIG, PERMISSIONS.USER_MANAGEMENT, PERMISSIONS.SYSTEM_LOGS, PERMISSIONS.SYSTEM_BACKUP, PERMISSIONS.SYSTEM_MAINTENANCE],
      data: [PERMISSIONS.DATA_IMPORT, PERMISSIONS.DATA_EXPORT, PERMISSIONS.DATA_NORMALIZE, PERMISSIONS.DATA_BACKUP],
      reports: [PERMISSIONS.REPORTS_VIEW, PERMISSIONS.REPORTS_ADVANCED, PERMISSIONS.ANALYTICS_VIEW, PERMISSIONS.ANALYTICS_EXPORT],
      communications: [PERMISSIONS.WHATSAPP_SEND, PERMISSIONS.NOTIFICATIONS_SEND, PERMISSIONS.EMAIL_SEND],
      pwa: [PERMISSIONS.PWA_INSTALL, PERMISSIONS.OFFLINE_ACCESS, PERMISSIONS.PWA_UPDATE]
    };
    const requiredPermissions = modulePermissions[module];
    return requiredPermissions ? this.hasAnyPermission(requiredPermissions) : false;
  }
}

export const createAdvancedPermissionCheck = (userPermissions) => {
  const checker = new PermissionChecker(userPermissions);
  return {
    canManageSystemSettings: () => checker.hasPermission(PERMISSIONS.SYSTEM_CONFIG),
    canManageUsers: () => checker.hasPermission(PERMISSIONS.USER_MANAGEMENT),
    canViewSystemLogs: () => checker.hasPermission(PERMISSIONS.SYSTEM_LOGS),
    canBackupSystem: () => checker.hasPermission(PERMISSIONS.SYSTEM_BACKUP),
    canPerformMaintenance: () => checker.hasPermission(PERMISSIONS.SYSTEM_MAINTENANCE),
    canPerformAdminTasks: () => checker.hasAllPermissions([PERMISSIONS.SYSTEM_CONFIG, PERMISSIONS.DATA_NORMALIZE, PERMISSIONS.DATA_EXPORT, PERMISSIONS.USER_MANAGEMENT]),
    canManageAllData: () => checker.hasAllPermissions([PERMISSIONS.DATA_IMPORT, PERMISSIONS.DATA_EXPORT, PERMISSIONS.DATA_NORMALIZE, PERMISSIONS.DATA_BACKUP]),
    canManageCustomers: () => checker.hasAllPermissions([PERMISSIONS.CUSTOMER_VIEW, PERMISSIONS.CUSTOMER_CREATE, PERMISSIONS.CUSTOMER_EDIT, PERMISSIONS.CUSTOMER_DELETE]),
    canViewCustomersOnly: () => checker.hasPermission(PERMISSIONS.CUSTOMER_VIEW) && !checker.hasPermission(PERMISSIONS.CUSTOMER_EDIT),
    canManageStamps: () => checker.hasAllPermissions([PERMISSIONS.STAMPS_MANAGE, PERMISSIONS.REWARDS_MANAGE, PERMISSIONS.REWARDS_CLAIM]),
    canConfigureStamps: () => checker.hasPermission(PERMISSIONS.STAMPS_CONFIG),
    canSendCommunications: () => checker.hasAllPermissions([PERMISSIONS.WHATSAPP_SEND, PERMISSIONS.NOTIFICATIONS_SEND, PERMISSIONS.EMAIL_SEND]),
    canSendWhatsAppOnly: () => checker.hasPermission(PERMISSIONS.WHATSAPP_SEND) && !checker.hasPermission(PERMISSIONS.EMAIL_SEND),
    canViewReports: () => checker.hasPermission(PERMISSIONS.REPORTS_VIEW),
    canViewAdvancedReports: () => checker.hasPermission(PERMISSIONS.REPORTS_ADVANCED),
    canViewAnalytics: () => checker.hasPermission(PERMISSIONS.ANALYTICS_VIEW),
    canExportAnalytics: () => checker.hasPermission(PERMISSIONS.ANALYTICS_EXPORT),
    canInstallPWA: () => checker.hasPermission(PERMISSIONS.PWA_INSTALL),
    canAccessOffline: () => checker.hasPermission(PERMISSIONS.OFFLINE_ACCESS),
    canUpdatePWA: () => checker.hasPermission(PERMISSIONS.PWA_UPDATE),
    hasModuleAccess: (module) => checker.hasModuleAccess(module),
    canPerformOperation: (operation, context) => checker.canPerformAction(operation, context),
    canDeleteCustomers: () => checker.hasPermission(PERMISSIONS.CUSTOMER_DELETE),
    canExportData: () => checker.hasPermission(PERMISSIONS.DATA_EXPORT),
    canImportData: () => checker.hasPermission(PERMISSIONS.DATA_IMPORT),
    canHandleData: () => checker.hasAnyPermission([PERMISSIONS.DATA_IMPORT, PERMISSIONS.DATA_EXPORT, PERMISSIONS.DATA_NORMALIZE, PERMISSIONS.DATA_BACKUP]),
    canModifyCriticalData: () => checker.hasAllPermissions([PERMISSIONS.DATA_NORMALIZE, PERMISSIONS.DATA_BACKUP, PERMISSIONS.SYSTEM_MAINTENANCE]),
    canAccessSensitiveInfo: () => checker.hasAllPermissions([PERMISSIONS.USER_MANAGEMENT, PERMISSIONS.SYSTEM_LOGS, PERMISSIONS.SYSTEM_BACKUP]),
    canSendMassCommunications: () => checker.hasAllPermissions([PERMISSIONS.NOTIFICATIONS_SEND, PERMISSIONS.EMAIL_SEND]),
    getAvailablePermissions: () => Array.from(checker.userPermissions),
    getPermissionCount: () => checker.userPermissions.size,
    getPermissionsByCategory: () => {
      const categories = {
        customers: [PERMISSIONS.CUSTOMER_VIEW, PERMISSIONS.CUSTOMER_CREATE, PERMISSIONS.CUSTOMER_EDIT, PERMISSIONS.CUSTOMER_DELETE, PERMISSIONS.CUSTOMER_EXPORT],
        stamps: [PERMISSIONS.STAMPS_MANAGE, PERMISSIONS.STAMPS_CONFIG, PERMISSIONS.REWARDS_MANAGE, PERMISSIONS.REWARDS_CLAIM],
        system: [PERMISSIONS.SYSTEM_CONFIG, PERMISSIONS.USER_MANAGEMENT, PERMISSIONS.SYSTEM_LOGS, PERMISSIONS.SYSTEM_BACKUP, PERMISSIONS.SYSTEM_MAINTENANCE],
        data: [PERMISSIONS.DATA_IMPORT, PERMISSIONS.DATA_EXPORT, PERMISSIONS.DATA_NORMALIZE, PERMISSIONS.DATA_BACKUP],
        reports: [PERMISSIONS.REPORTS_VIEW, PERMISSIONS.REPORTS_ADVANCED, PERMISSIONS.ANALYTICS_VIEW, PERMISSIONS.ANALYTICS_EXPORT],
        communications: [PERMISSIONS.WHATSAPP_SEND, PERMISSIONS.NOTIFICATIONS_SEND, PERMISSIONS.EMAIL_SEND],
        pwa: [PERMISSIONS.PWA_INSTALL, PERMISSIONS.OFFLINE_ACCESS, PERMISSIONS.PWA_UPDATE]
      };
      const result = {};
      Object.entries(categories).forEach(([category, perms]) => {
        result[category] = perms.filter(p => checker.hasPermission(p));
      });
      return result;
    }
  };
};

export const getRolePermissionStats = () => {
  const adminCount = ROLE_PERMISSIONS[USER_ROLES.ADMIN].length;
  const employeeCount = ROLE_PERMISSIONS[USER_ROLES.EMPLOYEE].length;
  return {
    [USER_ROLES.ADMIN]: {
      totalPermissions: adminCount,
      permissions: ROLE_PERMISSIONS[USER_ROLES.ADMIN],
      description: 'Acceso completo a todas las funcionalidades'
    },
    [USER_ROLES.EMPLOYEE]: {
      totalPermissions: employeeCount,
      permissions: ROLE_PERMISSIONS[USER_ROLES.EMPLOYEE],
      description: 'Acceso limitado a operaciones diarias'
    },
    permissionDifference: adminCount - employeeCount,
    summary: {
      adminVsEmployee: `${adminCount} vs ${employeeCount} permisos`,
      ratio: `${((employeeCount / adminCount) * 100).toFixed(1)}% de permisos del admin`
    }
  };
};

export const DEFAULT_PERMISSIONS = {
  [USER_ROLES.ADMIN]: ROLE_PERMISSIONS[USER_ROLES.ADMIN],
  [USER_ROLES.EMPLOYEE]: ROLE_PERMISSIONS[USER_ROLES.EMPLOYEE]
};

export const OPTIMIZED_PERMISSIONS = {
  READ_ONLY: [PERMISSIONS.CUSTOMER_VIEW, PERMISSIONS.REPORTS_VIEW, PERMISSIONS.ANALYTICS_VIEW, PERMISSIONS.OFFLINE_ACCESS, PERMISSIONS.PWA_INSTALL],
  WRITE_PERMISSIONS: [PERMISSIONS.CUSTOMER_CREATE, PERMISSIONS.CUSTOMER_EDIT, PERMISSIONS.STAMPS_MANAGE, PERMISSIONS.REWARDS_MANAGE, PERMISSIONS.REWARDS_CLAIM, PERMISSIONS.WHATSAPP_SEND, PERMISSIONS.NOTIFICATIONS_SEND],
  ADMIN_PERMISSIONS: [PERMISSIONS.CUSTOMER_DELETE, PERMISSIONS.CUSTOMER_EXPORT, PERMISSIONS.STAMPS_CONFIG, PERMISSIONS.DATA_IMPORT, PERMISSIONS.DATA_EXPORT, PERMISSIONS.DATA_NORMALIZE, PERMISSIONS.DATA_BACKUP, PERMISSIONS.SYSTEM_CONFIG, PERMISSIONS.USER_MANAGEMENT, PERMISSIONS.SYSTEM_LOGS, PERMISSIONS.SYSTEM_BACKUP, PERMISSIONS.SYSTEM_MAINTENANCE, PERMISSIONS.REPORTS_ADVANCED, PERMISSIONS.ANALYTICS_EXPORT, PERMISSIONS.EMAIL_SEND, PERMISSIONS.PWA_UPDATE],
  CONFIG_PERMISSIONS: [PERMISSIONS.STAMPS_CONFIG, PERMISSIONS.SYSTEM_CONFIG, PERMISSIONS.PWA_UPDATE],
  EXPORT_PERMISSIONS: [PERMISSIONS.CUSTOMER_EXPORT, PERMISSIONS.DATA_EXPORT, PERMISSIONS.ANALYTICS_EXPORT]
};

export const FUNCTIONAL_PERMISSIONS = {
  customerManagement: [PERMISSIONS.CUSTOMER_VIEW, PERMISSIONS.CUSTOMER_CREATE, PERMISSIONS.CUSTOMER_EDIT, PERMISSIONS.CUSTOMER_DELETE, PERMISSIONS.CUSTOMER_EXPORT],
  loyaltyManagement: [PERMISSIONS.STAMPS_MANAGE, PERMISSIONS.STAMPS_CONFIG, PERMISSIONS.REWARDS_MANAGE, PERMISSIONS.REWARDS_CLAIM],
  adminManagement: [PERMISSIONS.SYSTEM_CONFIG, PERMISSIONS.USER_MANAGEMENT, PERMISSIONS.SYSTEM_LOGS, PERMISSIONS.SYSTEM_BACKUP, PERMISSIONS.SYSTEM_MAINTENANCE],
  dataManagement: [PERMISSIONS.DATA_IMPORT, PERMISSIONS.DATA_EXPORT, PERMISSIONS.DATA_NORMALIZE, PERMISSIONS.DATA_BACKUP],
  reportingManagement: [PERMISSIONS.REPORTS_VIEW, PERMISSIONS.REPORTS_ADVANCED, PERMISSIONS.ANALYTICS_VIEW, PERMISSIONS.ANALYTICS_EXPORT],
  communicationManagement: [PERMISSIONS.WHATSAPP_SEND, PERMISSIONS.NOTIFICATIONS_SEND, PERMISSIONS.EMAIL_SEND],
  pwaManagement: [PERMISSIONS.PWA_INSTALL, PERMISSIONS.OFFLINE_ACCESS, PERMISSIONS.PWA_UPDATE]
};

export const PERMISSION_VALIDATORS = {
  canModifyCriticalSettings: (userPermissions) => {
    const checker = new PermissionChecker(userPermissions);
    return checker.hasAllPermissions([PERMISSIONS.SYSTEM_CONFIG, PERMISSIONS.STAMPS_CONFIG]);
  },
  canPerformBulkOperations: (userPermissions) => {
    const checker = new PermissionChecker(userPermissions);
    return checker.hasAllPermissions([PERMISSIONS.DATA_IMPORT, PERMISSIONS.DATA_EXPORT, PERMISSIONS.DATA_NORMALIZE]);
  },
  canManageUsers: (userPermissions) => {
    const checker = new PermissionChecker(userPermissions);
    return checker.hasPermission(PERMISSIONS.USER_MANAGEMENT);
  },
  canAccessAdvancedFeatures: (userPermissions) => {
    const checker = new PermissionChecker(userPermissions);
    return checker.hasAnyPermission([PERMISSIONS.REPORTS_ADVANCED, PERMISSIONS.ANALYTICS_VIEW, PERMISSIONS.SYSTEM_LOGS]);
  }
};
