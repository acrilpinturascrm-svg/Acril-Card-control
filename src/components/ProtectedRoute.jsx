import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, PERMISSIONS } from '../contexts/AuthContext';

/**
 * Componente para rutas protegidas basado en permisos granulares
 * @param {Object} props
 * @param {React.Component} props.children - Componente hijo a renderizar
 * @param {string} props.requiredPermission - Permiso específico requerido (opcional)
 * @param {Array} props.requiredPermissions - Array de permisos requeridos (opcional)
 * @param {string} props.requiredRole - Rol requerido para acceder (opcional, mantenido por compatibilidad)
 * @param {string} props.redirectTo - Ruta de redirección si no autorizado (por defecto '/login')
 * @param {boolean} props.requireAll - Si requiere todos los permisos (true) o cualquiera (false)
 */
const ProtectedRoute = ({
  children,
  requiredPermission = null,
  requiredPermissions = null,
  requiredRole = null,
  redirectTo = '/login',
  requireAll = false
}) => {
  const {
    isAuthenticated,
    isLoading,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    canAccessRoute,
    role
  } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Verificar acceso por ruta (método más eficiente)
  if (!canAccessRoute(location.pathname)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">No tienes permisos para acceder a esta página.</p>
          <button
            onClick={() => window.history.back()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Verificaciones adicionales por permisos específicos (compatibilidad con versiones anteriores)
  if (requiredRole && role !== requiredRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Rol Insuficiente</h1>
          <p className="text-gray-600 mb-4">Tu rol actual no te permite acceder a esta funcionalidad.</p>
          <button
            onClick={() => window.history.back()}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Verificar permisos específicos
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Permiso Denegado</h1>
          <p className="text-gray-600 mb-4">No tienes el permiso específico requerido para esta acción.</p>
          <button
            onClick={() => window.history.back()}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Verificar múltiples permisos
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAccess = requireAll ?
      hasAllPermissions(requiredPermissions) :
      hasAnyPermission(requiredPermissions);

    if (!hasAccess) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Permisos Insuficientes</h1>
            <p className="text-gray-600 mb-4">
              {requireAll ?
                'No tienes todos los permisos requeridos para esta funcionalidad.' :
                'No tienes ninguno de los permisos requeridos para esta funcionalidad.'
              }
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      );
    }
  }

  // Si todas las verificaciones pasan, renderizar el componente hijo
  return children;
};

/**
 * Componente para mostrar información del usuario actual
 */
const UserInfo = () => {
  const { user, role, USER_ROLES } = useAuth();

  const getRoleDisplayName = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return 'Administrador';
      case USER_ROLES.EMPLOYEE:
        return 'Empleado';
      default:
        return 'Usuario';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return 'bg-red-100 text-red-800';
      case USER_ROLES.EMPLOYEE:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center space-x-3 px-4 py-2 bg-white border-b">
      <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-yellow-600 rounded-full flex items-center justify-center">
        <span className="text-white text-sm font-bold">
          {user.name.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {user.name}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {user.email}
        </p>
      </div>
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(role)}`}>
        {getRoleDisplayName(role)}
      </span>
    </div>
  );
};

export { ProtectedRoute, UserInfo };
