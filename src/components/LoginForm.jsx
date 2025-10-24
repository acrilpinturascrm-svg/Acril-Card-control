import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLES } from '../utils/permissions.simple';
import { Button, InputField } from './common';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: USER_ROLES.EMPLOYEE // Por defecto empleado
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const { login, isLoading } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Usuario es requerido';
    }

    if (!formData.password) {
      newErrors.password = 'Contraseña es requerida';
    } else if (formData.password.length < 4) {
      newErrors.password = 'Contraseña debe tener al menos 4 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await login(formData.username, formData.password);

    if (!result.success) {
      setErrors({ general: result.error });
    } else {
      navigate('/');
    }
  };

  const getRoleInfo = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return {
          name: 'Administrador',
          description: 'Acceso completo a todas las funciones',
          color: 'bg-red-100 text-red-800 border-red-200'
        };
      case USER_ROLES.EMPLOYEE:
        return {
          name: 'Empleado',
          description: 'Gestión de clientes y sellos',
          color: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      default:
        return {
          name: 'Usuario',
          description: 'Acceso básico',
          color: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-600 to-yellow-600 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ACRILCARD</h1>
          <p className="text-gray-600">Sistema de Fidelización</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Iniciar Sesión</h2>

          {/* Error General */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
              <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selección de Rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Usuario
              </label>
              <div className="space-y-2">
                {Object.values(USER_ROLES).map((role) => {
                  const roleInfo = getRoleInfo(role);
                  const isSelected = formData.role === role;

                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleInputChange('role', role)}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? `${roleInfo.color} border-current`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{roleInfo.name}</div>
                          <div className="text-sm opacity-75">{roleInfo.description}</div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          isSelected ? 'border-current bg-current' : 'border-gray-300'
                        }`}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Username */}
            <InputField
              label="Usuario"
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Ingrese su usuario"
              error={errors.username}
              leftIcon={<User className="w-4 h-4" />}
              disabled={isLoading}
            />

            {/* Password */}
            <div className="relative">
              <InputField
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Ingrese su contraseña"
                error={errors.password}
                leftIcon={<Lock className="w-4 h-4" />}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2">Credenciales de Prueba</h3>
            <div className="text-sm text-yellow-700 space-y-1">
              <div><strong>Admin:</strong> admin / admin123</div>
              <div><strong>Empleado:</strong> empleado / empleado123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
