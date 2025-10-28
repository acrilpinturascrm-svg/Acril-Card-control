import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  PermissionChecker,
  createAdvancedPermissionCheck,
  getRolePermissionStats
} from '../utils/permissions.simple';
import { PermissionMiddleware, PermissionValidators, SecurityValidators } from '../utils/permissionMiddleware';

// Definir USER_ROLES localmente para evitar problemas de importación
export const USER_ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee'
};

// Usuario por defecto para desarrollo con permisos granulares
const DEFAULT_USERS = [
  {
    id: 'admin-1',
    username: 'Acrilgroup',
    password: 'ACRILCARD2025',
    role: USER_ROLES.ADMIN,
    name: 'Administrador',
    email: 'admin@acrilcard.com',
    permissions: ROLE_PERMISSIONS[USER_ROLES.ADMIN], // Todos los permisos
    createdAt: new Date().toISOString(),
    lastLogin: null
  },
  {
    id: 'emp-1',
    username: 'empleado',
    password: 'empleado123',
    role: USER_ROLES.EMPLOYEE,
    name: 'Empleado Ventas',
    email: 'ventas@acrilcard.com',
    permissions: ROLE_PERMISSIONS[USER_ROLES.EMPLOYEE], // Permisos limitados
    createdAt: new Date().toISOString(),
    lastLogin: null
  }
];

// Estado inicial
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  role: null,
  permissions: [],
  loginAttempts: 0,
  lastActivity: null
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState(initialState);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem('acrilcard_user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            role: user.role,
            permissions: user.permissions || [],
            loginAttempts: 0,
            lastActivity: new Date().toISOString()
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error cargando usuario:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadUser();
  }, []);

  // Función de login con validación de permisos
  const login = useCallback(async (username, password) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));

      // Buscar usuario
      const user = DEFAULT_USERS.find(
        u => u.username === username && u.password === password
      );

      if (!user) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          loginAttempts: prev.loginAttempts + 1
        }));
        throw new Error('Usuario o contraseña incorrectos');
      }

      // Actualizar último login
      const updatedUser = {
        ...user,
        lastLogin: new Date().toISOString()
      };

      // Guardar en localStorage
      localStorage.setItem('acrilcard_user', JSON.stringify(updatedUser));

      // Actualizar estado
      setState({
        user: updatedUser,
        isAuthenticated: true,
        isLoading: false,
        role: updatedUser.role,
        permissions: updatedUser.permissions || [],
        loginAttempts: 0,
        lastActivity: new Date().toISOString()
      });

      return { success: true, user: updatedUser };
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.message };
    }
  }, []);

  // Función de logout
  const logout = useCallback(async () => {
    try {
      // Si el usuario inició sesión con Google, cerrar sesión de Google también
      const savedUser = localStorage.getItem('acrilcard_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        // Usuario cerrado de sesión
      }

      localStorage.removeItem('acrilcard_user');
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        role: null,
        permissions: [],
        loginAttempts: 0,
        lastActivity: null
      });
    } catch (error) {
      console.error('Error en logout:', error);
    }
  }, []);

  // === SISTEMA DE PERMISOS GRANULAR ===

  // Crear verificador de permisos avanzado
  const permissionChecker = new PermissionChecker(state.permissions);

  // Verificar si tiene un permiso específico
  const hasPermission = useCallback((permission) => {
    return PermissionMiddleware.hasPermission(state.permissions, permission);
  }, [state.permissions]);

  // Verificar múltiples permisos (AND lógico)
  const hasAllPermissions = useCallback((permissions) => {
    return PermissionMiddleware.hasAllPermissions(state.permissions, permissions);
  }, [state.permissions]);

  // Verificar múltiples permisos (OR lógico)
  const hasAnyPermission = useCallback((permissions) => {
    return PermissionMiddleware.hasAnyPermission(state.permissions, permissions);
  }, [state.permissions]);

  // Verificar si puede realizar una acción específica
  const canPerformAction = useCallback((action, context = {}) => {
    return PermissionMiddleware.canPerformAction(state.permissions, action, context);
  }, [state.permissions]);

  // Verificar si puede acceder a una ruta específica
  const canAccessRoute = useCallback((route) => {
    if (!state.isAuthenticated) return false;

    const routePermissions = {
      // Rutas administrativas (solo admin)
      '/admin': [PERMISSIONS.SYSTEM_CONFIG],
      '/settings': [PERMISSIONS.SYSTEM_CONFIG],
      '/reports': [PERMISSIONS.REPORTS_VIEW],
      '/test-errors': [PERMISSIONS.SYSTEM_LOGS],
      '/analytics': [PERMISSIONS.ANALYTICS_VIEW],
      '/system': [PERMISSIONS.SYSTEM_CONFIG],
      '/users': [PERMISSIONS.USER_MANAGEMENT],
      '/logs': [PERMISSIONS.SYSTEM_LOGS],

      // Rutas operativas (admin y empleado)
      '/': [PERMISSIONS.CUSTOMER_VIEW],
      '/customers': [PERMISSIONS.CUSTOMER_VIEW],
      '/cliente': [PERMISSIONS.CUSTOMER_VIEW],
    };

    const requiredPermissions = routePermissions[route] || [PERMISSIONS.CUSTOMER_VIEW];
    return PermissionMiddleware.hasAnyPermission(state.permissions, requiredPermissions);
  }, [state.isAuthenticated, state.permissions]);

  // === FUNCIONES AVANZADAS DE CONTROL DE ACCESO ===

  // Crear verificador avanzado
  const advancedChecker = createAdvancedPermissionCheck(state.permissions);

  // Verificaciones específicas por módulo
  const canManageSystemSettings = useCallback(() => {
    return advancedChecker.canManageSystemSettings();
  }, [state.permissions]);

  const canManageUsers = useCallback(() => {
    return advancedChecker.canManageUsers();
  }, [state.permissions]);

  const canViewSystemLogs = useCallback(() => {
    return advancedChecker.canViewSystemLogs();
  }, [state.permissions]);

  const canPerformAdminTasks = useCallback(() => {
    return advancedChecker.canPerformAdminTasks();
  }, [state.permissions]);

  const canManageCustomers = useCallback(() => {
    return advancedChecker.canManageCustomers();
  }, [state.permissions]);

  const canViewCustomersOnly = useCallback(() => {
    return advancedChecker.canViewCustomersOnly();
  }, [state.permissions]);

  const canHandleData = useCallback(() => {
    return advancedChecker.canHandleData();
  }, [state.permissions]);

  const canDeleteCustomers = useCallback(() => {
    return advancedChecker.canDeleteCustomers();
  }, [state.permissions]);

  const canSendWhatsAppOnly = useCallback(() => {
    return advancedChecker.canSendWhatsAppOnly();
  }, [state.permissions]);

  const canViewReports = useCallback(() => {
    return advancedChecker.canViewReports();
  }, [state.permissions]);

  const canViewAdvancedReports = useCallback(() => {
    return advancedChecker.canViewAdvancedReports();
  }, [state.permissions]);

  const canViewAnalytics = useCallback(() => {
    return advancedChecker.canViewAnalytics();
  }, [state.permissions]);

  const canExportAnalytics = useCallback(() => {
    return advancedChecker.canExportAnalytics();
  }, [state.permissions]);

  // Funciones adicionales para completar la interfaz
  const canManageStamps = useCallback(() => {
    return hasPermission(PERMISSIONS.CUSTOMER_EDIT);
  }, [state.permissions]);

  const canConfigureStamps = useCallback(() => {
    return hasPermission(PERMISSIONS.SYSTEM_CONFIG);
  }, [state.permissions]);

  const canSendCommunications = useCallback(() => {
    return hasPermission(PERMISSIONS.WHATSAPP_SEND);
  }, [state.permissions]);

  const canImportData = useCallback(() => {
    return hasPermission(PERMISSIONS.DATA_IMPORT);
  }, [state.permissions]);

  const canModifyCriticalSettings = useCallback(() => {
    return hasPermission(PERMISSIONS.SYSTEM_CONFIG);
  }, [state.permissions]);

  const hasModuleAccess = useCallback((module) => {
    return advancedChecker.hasModuleAccess(module);
  }, [state.permissions]);

  const getAvailablePermissions = useCallback(() => {
    return advancedChecker.getAvailablePermissions();
  }, [state.permissions]);

  // === FUNCIONES DE UTILIDAD ===

  // Obtener estadísticas de permisos
  const getPermissionStats = useCallback(() => {
    return getRolePermissionStats();
  }, []);

  // Verificar permisos CRUD para un recurso
  const canCRUD = useCallback((resource, operation) => {
    return PermissionMiddleware.canCRUD(state.permissions, resource, operation);
  }, [state.permissions]);

  // Verificar si es administrador
  const isAdmin = useCallback(() => {
    return state.role === USER_ROLES.ADMIN;
  }, [state.role]);

  // Verificar si es empleado
  const isEmployee = useCallback(() => {
    return state.role === USER_ROLES.EMPLOYEE;
  }, [state.role]);

  // === VALIDACIONES ESPECÍFICAS ===

  // Validar si puede realizar operaciones masivas
  const canPerformBulkOperations = useCallback(() => {
    return PermissionValidators.canPerformBulkOperations(state.permissions);
  }, [state.permissions]);

  // Validar si puede exportar datos sensibles
  const canExportSensitiveData = useCallback(() => {
    return PermissionValidators.canExportSensitiveData(state.permissions);
  }, [state.permissions]);

  // Validar si puede enviar comunicaciones masivas
  const canSendMassCommunications = useCallback(() => {
    return PermissionValidators.canSendMassCommunications(state.permissions);
  }, [state.permissions]);

  // Validar si puede acceder a funcionalidades avanzadas
  const canAccessAdvancedFeatures = useCallback(() => {
    return PermissionValidators.canAccessAdvancedFeatures(state.permissions);
  }, [state.permissions]);

  // === FUNCIONES DE SEGURIDAD ===

  // Validar si puede modificar datos críticos
  const canModifyCriticalData = useCallback(() => {
    return SecurityValidators.canModifyCriticalData(state.permissions);
  }, [state.permissions]);

  // Validar si puede acceder a información sensible
  const canAccessSensitiveInfo = useCallback(() => {
    return SecurityValidators.canAccessSensitiveInfo(state.permissions);
  }, [state.permissions]);

  // Validar si puede realizar mantenimiento
  const canPerformMaintenance = useCallback(() => {
    return SecurityValidators.canPerformMaintenance(state.permissions);
  }, [state.permissions]);

  // Validar si puede gestionar el sistema completamente
  const canManageSystem = useCallback(() => {
    return SecurityValidators.canManageSystem(state.permissions);
  }, [state.permissions]);

  const value = {
    // Estado
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    role: state.role,
    permissions: state.permissions,
    loginAttempts: state.loginAttempts,
    lastActivity: state.lastActivity,

    // Acciones básicas
    login,
    logout,

    // Sistema de permisos granular
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    canPerformAction,
    canAccessRoute,

    // Verificaciones específicas por módulo
    canManageSystemSettings,
    canManageUsers,
    canViewSystemLogs,
    canPerformAdminTasks,
    canManageCustomers,
    canViewCustomersOnly,
    canManageStamps,
    canConfigureStamps,
    canHandleData,
    canSendCommunications,
    canSendWhatsAppOnly,
    canViewReports,
    canViewAdvancedReports,
    canViewAnalytics,
    canExportAnalytics,
    canImportData,
    hasModuleAccess,
    getAvailablePermissions,

    // Utilidades
    canCRUD,
    isAdmin,
    isEmployee,
    getPermissionStats,

    // Validaciones específicas
    canModifyCriticalSettings,
    canPerformBulkOperations,
    canDeleteCustomers,
    canExportSensitiveData,
    canSendMassCommunications,
    canAccessAdvancedFeatures,

    // Seguridad avanzada
    canModifyCriticalData,
    canAccessSensitiveInfo,
    canPerformMaintenance,
    canManageSystem,

    // Constantes
    USER_ROLES,
    PERMISSIONS
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
