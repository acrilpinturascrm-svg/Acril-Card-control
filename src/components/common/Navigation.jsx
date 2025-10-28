import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gift, RefreshCw, Download, Upload, LogOut, User, Settings, BarChart3, Users, FileText, Save, Shield, Database } from 'lucide-react';
import { useAuth, USER_ROLES } from '../../contexts/AuthContext';
import { Button, DropdownMenu, UserInfo } from './';

const Navigation = ({
  onExit,
  showMainPanel,
  normalizeCustomerIds,
  onExportCustomersToJSON,
  onImportCustomersFromJSON,
  customers = [],
  stampsPerReward,
  setStampsPerReward,
}) => {
  const {
    logout,
    user,
    role,
    hasPermission,
    canManageSystemSettings,
    canPerformAdminTasks,
    canManageCustomers,
    canHandleData,
    canViewReports,
    canViewAdvancedReports,
    canViewAnalytics,
    canExportSensitiveData,
    canModifyCriticalSettings,
    PERMISSIONS
  } = useAuth();

  const navigate = useNavigate();

  // Mostrar información del usuario si está autenticado
  const showUserInfo = user && role;

  // Verificar permisos granulares para mostrar funcionalidades específicas
  const canManageSettings = canManageSystemSettings();
  const canExportData = canHandleData() && canExportSensitiveData();
  const canNormalizeIds = canHandleData();
  
  const canViewReportsMenu = canViewReports();
  const canViewAdvancedReportsMenu = canViewAdvancedReports();
  const canViewAnalyticsMenu = canViewAnalytics();
  const canModifyStampsConfig = canModifyCriticalSettings();

  const handleLogout = () => {
    logout();
    if (onExit) onExit();
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-red-800 to-yellow-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y título */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Gift className="w-8 h-8 text-white" />
                <span className="text-white text-xl font-bold tracking-tight">ACRILCARD</span>
              </div>
            </div>

            {/* Contenido principal de navegación */}
            {showUserInfo && (
              <div className="flex items-center space-x-4">
                {/* Información del usuario */}
                <UserInfo user={user} role={role} />

                {/* Configuraciones y acciones administrativas */}
                {(canExportData || canNormalizeIds || canViewReportsMenu || canManageSettings) && (
                  <div className="flex items-center space-x-3">
                    {/* Configuración de sellos (solo para quienes pueden modificar configuración crítica) */}
                    {canModifyStampsConfig && (
                      <div className="hidden md:flex items-center space-x-2">
                        <span className="text-sm text-white">Sellos para premio:</span>
                        <input
                          type="number"
                          value={stampsPerReward}
                          onChange={(e) => setStampsPerReward(Math.max(1, parseInt(e.target.value) || 10))}
                          className="w-16 px-2 py-1 rounded text-black text-center border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    {/* Menú desplegable con funcionalidades administrativas */}
                    {(canExportData || canNormalizeIds || canViewReportsMenu || canManageSettings) && (
                      <DropdownMenu>
                        {/* Gestión de datos */}
                        {canExportData && (
                          <>
                            <div className="px-3 py-2 text-xs font-bold text-red-600 uppercase tracking-wider border-b border-red-100 bg-red-50">
                              <Database size={14} className="inline mr-1.5 mb-0.5" />
                              Gestión de Datos
                            </div>
                            <Button
                              onClick={onExportCustomersToJSON}
                              variant="outline"
                              size="sm"
                              className="text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:text-red-700 text-sm w-full justify-start transition-all duration-200 border-0 rounded-none"
                            >
                              <Download size={16} className="mr-2 text-red-600" />
                              <span className="flex-1 text-left">Exportar a JSON</span>
                              <span className="text-xs text-gray-400">{customers.length}</span>
                            </Button>
                            {onImportCustomersFromJSON && (
                              <Button
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = '.json';
                                  input.onchange = (e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        try {
                                          const jsonData = JSON.parse(event.target.result);
                                          onImportCustomersFromJSON(jsonData);
                                        } catch (error) {
                                          console.error('Error parsing JSON:', error);
                                          alert('Error al leer el archivo JSON');
                                        }
                                      };
                                      reader.readAsText(file);
                                    }
                                  };
                                  input.click();
                                }}
                                variant="outline"
                                size="sm"
                                className="text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:text-red-700 text-sm w-full justify-start transition-all duration-200 border-0 rounded-none"
                              >
                                <Upload size={16} className="mr-2 text-orange-600" />
                                <span className="flex-1 text-left">Importar desde JSON</span>
                              </Button>
                            )}
                          </>
                        )}
                        
                        {canNormalizeIds && (
                          <>
                            {canExportData && <div className="border-t border-gray-200 my-1"></div>}
                            <Button
                              onClick={normalizeCustomerIds}
                              variant="outline"
                              size="sm"
                              className="text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:text-red-700 text-sm w-full justify-start transition-all duration-200 border-0 rounded-none"
                            >
                              <RefreshCw size={16} className="mr-2 text-blue-600" />
                              <span className="flex-1 text-left">Normalizar IDs</span>
                            </Button>
                          </>
                        )}

                        {/* Separador */}
                        {(canViewReportsMenu || canManageSettings) && (
                          <div className="border-t-2 border-gray-200 my-1"></div>
                        )}

                        {/* Reportes */}
                        {canViewReportsMenu && (
                          <div className="px-3 py-2 text-xs font-bold text-red-600 uppercase tracking-wider border-b border-red-100 bg-red-50">
                            <BarChart3 size={14} className="inline mr-1.5 mb-0.5" />
                            Reportes
                          </div>
                        )}

                        {canViewReportsMenu && (
                          <Button
                            onClick={() => navigate('/reports')}
                            variant="outline"
                            size="sm"
                            className="text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:text-red-700 text-sm w-full justify-start transition-all duration-200 border-0 rounded-none"
                          >
                            <FileText size={16} className="mr-2 text-green-600" />
                            <span className="flex-1 text-left">Reportes Básicos</span>
                          </Button>
                        )}

                        {canViewAdvancedReportsMenu && (
                          <Button
                            onClick={() => navigate('/advanced-reports')}
                            variant="outline"
                            size="sm"
                            className="text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:text-red-700 text-sm w-full justify-start transition-all duration-200 border-0 rounded-none"
                          >
                            <BarChart3 size={16} className="mr-2 text-purple-600" />
                            <span className="flex-1 text-left">Reportes Avanzados</span>
                          </Button>
                        )}

                        {canViewAnalyticsMenu && (
                          <Button
                            onClick={() => navigate('/analytics')}
                            variant="outline"
                            size="sm"
                            className="text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:text-red-700 text-sm w-full justify-start transition-all duration-200 border-0 rounded-none"
                          >
                            <BarChart3 size={16} className="mr-2 text-indigo-600" />
                            <span className="flex-1 text-left">Analytics</span>
                          </Button>
                        )}

                        {/* Separador para configuración */}
                        {canManageSettings && (
                          <div className="border-t-2 border-gray-200 my-1"></div>
                        )}

                        {/* Configuración del sistema */}
                        {canManageSettings && (
                          <>
                            <div className="px-3 py-2 text-xs font-bold text-red-600 uppercase tracking-wider border-b border-red-100 bg-red-50">
                              <Settings size={14} className="inline mr-1.5 mb-0.5" />
                              Sistema
                            </div>
                            <Button
                              onClick={() => navigate('/settings')}
                              variant="outline"
                              size="sm"
                              className="text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:text-red-700 text-sm w-full justify-start transition-all duration-200 border-0 rounded-none"
                            >
                              <Settings size={16} className="mr-2 text-gray-600" />
                              <span className="flex-1 text-left">Configuración</span>
                            </Button>
                          </>
                        )}
                      </DropdownMenu>
                    )}
                  </div>
                )}

                {/* Separador */}
                <div className="h-6 w-px bg-white bg-opacity-30"></div>

                {/* Botón de logout */}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="text-white hover:bg-white hover:bg-opacity-20 text-sm font-medium flex items-center"
                >
                  <LogOut size={16} className="mr-2" />
                  {showMainPanel ? 'Cerrar sesión' : 'Iniciar'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
