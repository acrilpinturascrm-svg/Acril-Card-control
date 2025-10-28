import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gift, RefreshCw, Download, LogOut, User, Settings, BarChart3, Users, FileText, Save, Shield, Database } from 'lucide-react';
import { useAuth, USER_ROLES } from '../../contexts/AuthContext';
import { Button, DropdownMenu, UserInfo } from './';
import BackupManager from '../BackupManager';

const Navigation = ({
  onExit,
  showMainPanel,
  normalizeCustomerIds,
  onExportCustomersToJSON,
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

  // Estado para mostrar/ocultar BackupManager
  const [showBackupManager, setShowBackupManager] = useState(false);
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
                        {canNormalizeIds && (
                          <Button
                            onClick={normalizeCustomerIds}
                            variant="ghost"
                            size="sm"
                            className="text-gray-700 hover:bg-gray-100 text-sm w-full justify-start"
                          >
                            <RefreshCw size={16} className="mr-2" />
                            Corregir prefijos
                          </Button>
                        )}

                        {/* Sistema de Backup */}
                        {canHandleData() && (
                          <Button
                            onClick={() => setShowBackupManager(!showBackupManager)}
                            variant="ghost"
                            size="sm"
                            className="text-gray-700 hover:bg-gray-100 text-sm w-full justify-start"
                          >
                            <Save size={16} className="mr-2" />
                            Sistema de Backup
                          </Button>
                        )}

                        {/* Separador */}
                        {(canViewReportsMenu || canManageSettings) && (
                          <div className="border-t border-gray-200 my-1"></div>
                        )}

                        {/* Reportes */}
                        {canViewReportsMenu && (
                          <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Reportes
                          </div>
                        )}

                        {canViewReportsMenu && (
                          <Button
                            onClick={() => navigate('/reports')}
                            variant="ghost"
                            size="sm"
                            className="text-gray-700 hover:bg-gray-100 text-sm w-full justify-start"
                          >
                            <BarChart3 size={16} className="mr-2" />
                            Ver Reportes
                          </Button>
                        )}

                        {canViewAdvancedReportsMenu && (
                          <Button
                            onClick={() => navigate('/advanced-reports')}
                            variant="ghost"
                            size="sm"
                            className="text-gray-700 hover:bg-gray-100 text-sm w-full justify-start"
                          >
                            <FileText size={16} className="mr-2" />
                            Reportes Avanzados
                          </Button>
                        )}

                        {canViewAnalyticsMenu && (
                          <Button
                            onClick={() => navigate('/analytics')}
                            variant="ghost"
                            size="sm"
                            className="text-gray-700 hover:bg-gray-100 text-sm w-full justify-start"
                          >
                            <BarChart3 size={16} className="mr-2" />
                            Analytics
                          </Button>
                        )}

                        {/* Separador para configuración */}
                        {canManageSettings && (
                          <div className="border-t border-gray-200 my-1"></div>
                        )}

                        {/* Configuración del sistema */}
                        {canManageSettings && (
                          <>
                            <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Sistema
                            </div>
                            <Button
                              onClick={() => navigate('/settings')}
                              variant="ghost"
                              size="sm"
                              className="text-gray-700 hover:bg-gray-100 text-sm w-full justify-start"
                            >
                              <Settings size={16} className="mr-2" />
                              Configuración
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
                  variant="ghost"
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

      {/* Modal del Sistema de Backup */}
      {showBackupManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-blue-600" />
                Sistema de Backup Avanzado
              </h2>
              <Button
                onClick={() => setShowBackupManager(false)}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              <BackupManager />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
