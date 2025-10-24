import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw,
  Shield,
  Bell,
  Palette,
  Database,
  Users,
  Award,
  MessageCircle,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  Info,
  ArrowLeft
} from 'lucide-react';
import { Button } from './common';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { PERMISSIONS } from '../utils/permissions.simple';
import { useNavigate } from 'react-router-dom';
import WhatsAppTemplateManager from './WhatsAppTemplateManager';
import { testWhatsAppConfig, validateWhatsAppConfig } from '../utils/whatsapp';

const Settings = () => {
  const { user, role, hasPermission, permissions } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  const navigate = useNavigate();
  
  // Debug: Log para verificar permisos
  console.log('Settings - Usuario:', user);
  console.log('Settings - Rol:', role);
  console.log('Settings - Permisos:', permissions);
  console.log('Settings - hasPermission function:', hasPermission);
  console.log('Settings - SYSTEM_CONFIG permission:', PERMISSIONS.SYSTEM_CONFIG);
  console.log('Settings - Has SYSTEM_CONFIG:', hasPermission ? hasPermission(PERMISSIONS.SYSTEM_CONFIG) : 'hasPermission is null');
  
  // Estados para configuraciones
  const [settings, setSettings] = useState({
    // Configuración general
    businessName: 'ACRILCARD',
    businessPhone: '',
    businessEmail: '',
    businessAddress: '',
    
    // Configuración del programa de fidelización
    stampsPerReward: 10,
    rewardDescription: 'Premio por completar tarjeta',
    welcomeMessage: '¡Bienvenido a nuestro programa de fidelización!',
    
    // Configuración de notificaciones
    emailNotifications: true,
    whatsappNotifications: true,
    systemNotifications: true,
    marketingEmails: false,
    
    // Configuración de apariencia
    theme: 'light',
    primaryColor: '#dc2626',
    secondaryColor: '#eab308',
    companyLogo: '',
    
    // Configuración de seguridad
    sessionTimeout: 30,
    requireStrongPasswords: true,
    enableTwoFactor: false,
    autoLogout: true,
    
    // Configuración de backup
    autoBackup: true,
    backupFrequency: 24,
    maxBackups: 10,
    cloudBackup: false,
    
    // Configuración de WhatsApp
    whatsappApiKey: '',
    whatsappTemplate: 'Hola {name}, tienes {stamps} sellos. ¡Sigue coleccionando!',
    autoWhatsappEnabled: false,
    whatsappBusinessPhone: '',
    whatsappBusinessName: 'ACRIL Pinturas',
    whatsappCountryCode: '58'
  });
  
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Cargar configuraciones guardadas
  useEffect(() => {
    const savedSettings = localStorage.getItem('acrilcard_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Detectar cambios
  useEffect(() => {
    const savedSettings = localStorage.getItem('acrilcard_settings');
    const currentSettings = JSON.stringify(settings);
    setHasChanges(savedSettings !== currentSettings);
  }, [settings]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Guardar en localStorage (en producción sería una API)
      localStorage.setItem('acrilcard_settings', JSON.stringify(settings));
      
      // Simular delay de guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccess('Configuración guardada exitosamente');
      setHasChanges(false);
    } catch (error) {
      showError('Error al guardar la configuración');
      console.error('Settings save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const defaultSettings = {
      businessName: 'ACRILCARD',
      stampsPerReward: 10,
      theme: 'light',
      primaryColor: '#dc2626',
      secondaryColor: '#eab308',
      sessionTimeout: 30,
      autoBackup: true,
      backupFrequency: 24,
      maxBackups: 10
    };
    
    setSettings(prev => ({ ...prev, ...defaultSettings }));
    showInfo('Configuración restablecida a valores por defecto');
  };

  // Función de emergencia para limpiar localStorage y forzar nuevo login
  const handleForceReauth = () => {
    localStorage.removeItem('acrilcard_user');
    localStorage.removeItem('acrilcard_settings');
    showInfo('Cache limpiado. Por favor, vuelve a iniciar sesión.');
    window.location.reload();
  };

  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'loyalty', name: 'Fidelización', icon: Award },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'appearance', name: 'Apariencia', icon: Palette },
    { id: 'security', name: 'Seguridad', icon: Shield },
    { id: 'backup', name: 'Backup', icon: Database },
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle }
  ];

  const canModifySettings = hasPermission && hasPermission(PERMISSIONS.SYSTEM_CONFIG);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                size="sm"
                className="border-gray-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <SettingsIcon className="w-8 h-8 text-gray-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
                <p className="text-gray-600">Personaliza tu experiencia en ACRILCARD</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {hasChanges && (
                <div className="flex items-center space-x-2 text-amber-600">
                  <Info className="w-4 h-4" />
                  <span className="text-sm">Cambios sin guardar</span>
                </div>
              )}
              
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                disabled={!canModifySettings}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Restablecer
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={saving || !hasChanges || !canModifySettings}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar de navegación */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Configuración General */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Configuración General</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Negocio
                      </label>
                      <input
                        type="text"
                        value={settings.businessName}
                        onChange={(e) => handleSettingChange('businessName', e.target.value)}
                        disabled={!canModifySettings}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono del Negocio
                      </label>
                      <input
                        type="tel"
                        value={settings.businessPhone}
                        onChange={(e) => handleSettingChange('businessPhone', e.target.value)}
                        disabled={!canModifySettings}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        placeholder="+58 424 123 4567"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email del Negocio
                      </label>
                      <input
                        type="email"
                        value={settings.businessEmail}
                        onChange={(e) => handleSettingChange('businessEmail', e.target.value)}
                        disabled={!canModifySettings}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        placeholder="contacto@empresa.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección
                      </label>
                      <input
                        type="text"
                        value={settings.businessAddress}
                        onChange={(e) => handleSettingChange('businessAddress', e.target.value)}
                        disabled={!canModifySettings}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        placeholder="Calle Principal, Ciudad"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Configuración de Fidelización */}
              {activeTab === 'loyalty' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Programa de Fidelización</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sellos necesarios para premio
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={settings.stampsPerReward}
                        onChange={(e) => handleSettingChange('stampsPerReward', parseInt(e.target.value))}
                        disabled={!canModifySettings}
                        className="w-full md:w-32 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción del premio
                      </label>
                      <input
                        type="text"
                        value={settings.rewardDescription}
                        onChange={(e) => handleSettingChange('rewardDescription', e.target.value)}
                        disabled={!canModifySettings}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        placeholder="Describe qué recibe el cliente"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mensaje de bienvenida
                      </label>
                      <textarea
                        value={settings.welcomeMessage}
                        onChange={(e) => handleSettingChange('welcomeMessage', e.target.value)}
                        disabled={!canModifySettings}
                        rows="3"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        placeholder="Mensaje que verán los nuevos clientes"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Configuración de Notificaciones */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Notificaciones</h2>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'emailNotifications', label: 'Notificaciones por email', desc: 'Recibir alertas importantes por correo' },
                      { key: 'whatsappNotifications', label: 'Notificaciones por WhatsApp', desc: 'Alertas de sistema vía WhatsApp' },
                      { key: 'systemNotifications', label: 'Notificaciones del sistema', desc: 'Alertas dentro de la aplicación' },
                      { key: 'marketingEmails', label: 'Emails de marketing', desc: 'Recibir promociones y novedades' }
                    ].map((notification) => (
                      <div key={notification.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{notification.label}</p>
                          <p className="text-sm text-gray-600">{notification.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings[notification.key]}
                            onChange={(e) => handleSettingChange(notification.key, e.target.checked)}
                            disabled={!canModifySettings}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Configuración de Apariencia */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Apariencia</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tema
                      </label>
                      <select
                        value={settings.theme}
                        onChange={(e) => handleSettingChange('theme', e.target.value)}
                        disabled={!canModifySettings}
                        className="w-full md:w-48 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      >
                        <option value="light">Claro</option>
                        <option value="dark">Oscuro</option>
                        <option value="auto">Automático</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Color primario
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={settings.primaryColor}
                            onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                            disabled={!canModifySettings}
                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
                          />
                          <input
                            type="text"
                            value={settings.primaryColor}
                            onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                            disabled={!canModifySettings}
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Color secundario
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={settings.secondaryColor}
                            onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                            disabled={!canModifySettings}
                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
                          />
                          <input
                            type="text"
                            value={settings.secondaryColor}
                            onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                            disabled={!canModifySettings}
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Configuración de Seguridad */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Seguridad</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tiempo de sesión (minutos)
                      </label>
                      <select
                        value={settings.sessionTimeout}
                        onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                        disabled={!canModifySettings}
                        className="w-full md:w-48 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      >
                        <option value={15}>15 minutos</option>
                        <option value={30}>30 minutos</option>
                        <option value={60}>1 hora</option>
                        <option value={120}>2 horas</option>
                        <option value={480}>8 horas</option>
                      </select>
                    </div>
                    
                    {[
                      { key: 'requireStrongPasswords', label: 'Requerir contraseñas seguras', desc: 'Obligar contraseñas con mayúsculas, números y símbolos' },
                      { key: 'enableTwoFactor', label: 'Autenticación de dos factores', desc: 'Seguridad adicional con código SMS' },
                      { key: 'autoLogout', label: 'Cierre automático de sesión', desc: 'Cerrar sesión automáticamente por inactividad' }
                    ].map((security) => (
                      <div key={security.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{security.label}</p>
                          <p className="text-sm text-gray-600">{security.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings[security.key]}
                            onChange={(e) => handleSettingChange(security.key, e.target.checked)}
                            disabled={!canModifySettings}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Configuración de Backup */}
              {activeTab === 'backup' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Sistema de Backup</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Backup automático</p>
                        <p className="text-sm text-gray-600">Crear copias de seguridad automáticamente</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.autoBackup}
                          onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                          disabled={!canModifySettings}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Frecuencia de backup (horas)
                      </label>
                      <select
                        value={settings.backupFrequency}
                        onChange={(e) => handleSettingChange('backupFrequency', parseInt(e.target.value))}
                        disabled={!canModifySettings || !settings.autoBackup}
                        className="w-full md:w-48 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      >
                        <option value={1}>Cada hora</option>
                        <option value={6}>Cada 6 horas</option>
                        <option value={12}>Cada 12 horas</option>
                        <option value={24}>Cada 24 horas</option>
                        <option value={168}>Cada semana</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Máximo de backups a mantener
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={settings.maxBackups}
                        onChange={(e) => handleSettingChange('maxBackups', parseInt(e.target.value))}
                        disabled={!canModifySettings}
                        className="w-full md:w-32 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Configuración de WhatsApp */}
              {activeTab === 'whatsapp' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Integración WhatsApp</h2>
                      <p className="text-sm text-gray-600 mt-1">Configura cómo se envían los mensajes a tus clientes</p>
                    </div>
                    <Button
                      onClick={() => {
                        const validation = validateWhatsAppConfig();
                        if (validation.isValid) {
                          showSuccess('✅ Configuración de WhatsApp correcta');
                        } else {
                          showWarning('⚠️ Revisa la configuración de WhatsApp');
                        }
                        testWhatsAppConfig();
                      }}
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      🧪 Probar Configuración
                    </Button>
                  </div>
                  
                  {/* Configuración Básica */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-3 text-sm">📱 Configuración de la Empresa</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre del Negocio
                          </label>
                          <input
                            type="text"
                            value={settings.whatsappBusinessName}
                            onChange={(e) => handleSettingChange('whatsappBusinessName', e.target.value)}
                            disabled={!canModifySettings}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                            placeholder="ACRIL Pinturas"
                          />
                          <p className="text-xs text-gray-600 mt-1">Aparecerá en los mensajes</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Teléfono de WhatsApp Business
                          </label>
                          <div className="flex items-center space-x-2">
                            <select
                              value={settings.whatsappCountryCode}
                              onChange={(e) => handleSettingChange('whatsappCountryCode', e.target.value)}
                              disabled={!canModifySettings}
                              className="w-20 border border-gray-300 rounded-md px-2 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                            >
                              <option value="58">+58</option>
                              <option value="57">+57</option>
                              <option value="52">+52</option>
                              <option value="1">+1</option>
                            </select>
                            <input
                              type="tel"
                              value={settings.whatsappBusinessPhone}
                              onChange={(e) => handleSettingChange('whatsappBusinessPhone', e.target.value)}
                              disabled={!canModifySettings}
                              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                              placeholder="424 123 4567"
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-1">Opcional: Para respuestas de clientes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key de WhatsApp
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type={showApiKey ? "text" : "password"}
                          value={settings.whatsappApiKey}
                          onChange={(e) => handleSettingChange('whatsappApiKey', e.target.value)}
                          disabled={!canModifySettings}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          placeholder="Ingresa tu API Key"
                        />
                        <Button
                          onClick={() => setShowApiKey(!showApiKey)}
                          variant="outline"
                          size="sm"
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Gestor de Plantillas */}
                    <div className="border-t border-gray-200 pt-6">
                      <WhatsAppTemplateManager />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Envío automático</p>
                        <p className="text-sm text-gray-600">Enviar mensajes automáticamente al completar sellos</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.autoWhatsappEnabled}
                          onChange={(e) => handleSettingChange('autoWhatsappEnabled', e.target.checked)}
                          disabled={!canModifySettings}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Información de permisos */}
              {!canModifySettings && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Lock className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="text-sm text-yellow-800">
                          No tienes permisos para modificar la configuración del sistema. 
                          Contacta a un administrador para realizar cambios.
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          Usuario: {user?.username} | Rol: {role} | Permisos: {permissions?.length || 0}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleForceReauth}
                      variant="outline"
                      size="sm"
                      className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Limpiar Cache
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
