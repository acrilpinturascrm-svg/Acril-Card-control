import React, { useState, useCallback, useEffect } from 'react';
import { User, Phone, CreditCard, AlertCircle, CheckCircle, Save, X } from 'lucide-react';
import { Button, InputField } from './common';
import { DataValidator, sanitize } from '../utils/validation';
import { errorHandler, createValidationError } from '../utils/errorHandler';
import { useNotification } from '../contexts/NotificationContext';
import { useCustomers } from '../contexts/CustomerContext';

const EnhancedCustomerForm = ({ 
  customer = null, 
  onSave, 
  onCancel,
  isEditing = false 
}) => {
  const { customers } = useCustomers();
  const { showError, showSuccess, showWarning } = useNotification();
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    idType: customer?.idType || 'V',
    idNumber: customer?.idNumber || '',
    email: customer?.email || ''
  });

  // Estado de validación
  const [validationState, setValidationState] = useState({
    errors: {},
    warnings: {},
    isValid: false,
    touched: {}
  });

  // Estado de la UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidationSummary, setShowValidationSummary] = useState(false);

  // Instancia del validador
  const validator = new DataValidator();

  // Configurar manejo de errores
  useEffect(() => {
    errorHandler.setNotificationCallback(({ type, title, message, persistent }) => {
      switch (type) {
        case 'error':
          showError(message, title);
          break;
        case 'warning':
          showWarning(message, title);
          break;
        default:
          showSuccess(message, title);
      }
    });
  }, [showError, showSuccess, showWarning]);

  /**
   * Validar campo individual
   */
  const validateField = useCallback((fieldName, value, showErrors = true) => {
    validator.clear();
    
    const testCustomer = {
      ...formData,
      [fieldName]: value
    };

    // Validaciones específicas por campo
    switch (fieldName) {
      case 'name':
        validator.validateName(value);
        break;
      case 'phone':
        validator.validatePhone(value);
        break;
      case 'idType':
      case 'idNumber':
        validator.validateCedula(
          fieldName === 'idType' ? value : formData.idType,
          fieldName === 'idNumber' ? value : formData.idNumber
        );
        break;
      case 'email':
        validator.validateEmail(value);
        break;
    }

    // Verificar unicidad si es necesario
    if ((fieldName === 'idType' || fieldName === 'idNumber') && 
        formData.idType && formData.idNumber) {
      validator.validateUniqueness(testCustomer, customers);
    }

    const fieldErrors = {};
    const fieldWarnings = {};

    // Extraer errores específicos del campo
    Object.keys(validator.errors).forEach(key => {
      if (key === fieldName || key.startsWith(fieldName)) {
        fieldErrors[key] = validator.errors[key];
      }
    });

    // Extraer warnings específicos del campo
    Object.keys(validator.warnings).forEach(key => {
      if (key === fieldName || key.startsWith(fieldName)) {
        fieldWarnings[key] = validator.warnings[key];
      }
    });

    if (showErrors) {
      setValidationState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          ...fieldErrors,
          // Limpiar errores del campo si no hay nuevos
          ...(Object.keys(fieldErrors).length === 0 && {
            [fieldName]: undefined,
            [`${fieldName}Type`]: undefined,
            [`${fieldName}Number`]: undefined
          })
        },
        warnings: {
          ...prev.warnings,
          ...fieldWarnings,
          // Limpiar warnings del campo si no hay nuevos
          ...(Object.keys(fieldWarnings).length === 0 && {
            [fieldName]: undefined,
            [`${fieldName}Type`]: undefined,
            [`${fieldName}Number`]: undefined
          })
        }
      }));
    }

    return Object.keys(fieldErrors).length === 0;
  }, [formData, customers, validator]);

  /**
   * Validar formulario completo
   */
  const validateForm = useCallback(() => {
    validator.clear();
    
    const isValid = validator.validateCustomer(formData, customers);
    
    setValidationState(prev => ({
      ...prev,
      errors: validator.errors,
      warnings: validator.warnings,
      isValid
    }));

    return isValid;
  }, [formData, customers, validator]);

  /**
   * Manejar cambio en campo
   */
  const handleFieldChange = useCallback((fieldName, value) => {
    // Sanitizar valor - NO sanitizar el nombre en tiempo real para permitir espacios
    let sanitizedValue = value;
    switch (fieldName) {
      case 'name':
        // Solo limitar longitud, no sanitizar mientras escribe
        sanitizedValue = value.substring(0, 100);
        break;
      case 'phone':
        sanitizedValue = sanitize.phone(value);
        break;
      case 'idNumber':
        sanitizedValue = sanitize.idNumber(value);
        break;
      case 'idType':
        sanitizedValue = value.toUpperCase();
        break;
    }

    // Actualizar estado
    setFormData(prev => ({
      ...prev,
      [fieldName]: sanitizedValue
    }));

    // Marcar como tocado
    setValidationState(prev => ({
      ...prev,
      touched: {
        ...prev.touched,
        [fieldName]: true
      }
    }));

    // Validar campo con debounce
    setTimeout(() => {
      validateField(fieldName, sanitizedValue);
    }, 300);
  }, [validateField]);

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      // Preparar datos sanitizados para validación y guardado
      const sanitizedData = {
        ...formData,
        name: sanitize.name(formData.name), // Sanitizar para validación y guardado
      };

      // Validar con datos sanitizados
      validator.clear();
      const isValid = validator.validateCustomer(sanitizedData, customers);
      
      if (!isValid) {
        setShowValidationSummary(true);
        setValidationState(prev => ({
          ...prev,
          errors: validator.errors,
          warnings: validator.warnings,
          isValid: false
        }));
        
        // Crear error de validación
        const validationError = createValidationError(
          'Por favor, corrija los errores en el formulario',
          validator.errors
        );
        
        errorHandler.handleError(validationError, {
          component: 'EnhancedCustomerForm',
          action: 'submit',
          formData: sanitizedData
        });
        
        return;
      }

      // Mostrar warnings si existen
      if (validator.hasWarnings()) {
        const warningMessages = Object.values(validator.warnings)
          .flat()
          .join(', ');
        
        showWarning(`Advertencias: ${warningMessages}`, 'Revise los datos');
      }

      // Preparar datos para guardar
      const customerData = {
        ...sanitizedData,
        cedula: `${sanitizedData.idType}-${sanitizedData.idNumber}`,
        updatedAt: new Date().toISOString()
      };

      // Si es edición, mantener datos existentes
      if (isEditing && customer) {
        customerData.id = customer.id;
        customerData.createdAt = customer.createdAt;
        customerData.stamps = customer.stamps;
        customerData.totalPurchases = customer.totalPurchases;
        customerData.rewardsEarned = customer.rewardsEarned;
        customerData.purchaseHistory = customer.purchaseHistory;
      }

      // Llamar función de guardado
      await onSave(customerData);
      
      showSuccess(
        isEditing ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente'
      );

      // Limpiar formulario si es creación
      if (!isEditing) {
        setFormData({
          name: '',
          phone: '',
          idType: 'V',
          idNumber: '',
          email: ''
        });
        setValidationState({
          errors: {},
          warnings: {},
          isValid: false,
          touched: {}
        });
      }

    } catch (error) {
      errorHandler.handleError(error, {
        component: 'EnhancedCustomerForm',
        action: 'submit',
        formData,
        isEditing
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    formData, 
    isSubmitting, 
    isEditing, 
    customer, 
    customers,
    onSave, 
    validator, 
    showSuccess, 
    showWarning
  ]);

  /**
   * Obtener clase CSS para campo según estado de validación
   */
  const getFieldClassName = useCallback((fieldName) => {
    const hasError = validationState.errors[fieldName] || 
                    validationState.errors[`${fieldName}Type`] || 
                    validationState.errors[`${fieldName}Number`];
    const hasWarning = validationState.warnings[fieldName] || 
                      validationState.warnings[`${fieldName}Type`] || 
                      validationState.warnings[`${fieldName}Number`];
    const isTouched = validationState.touched[fieldName];

    let className = 'w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors';

    if (isTouched) {
      if (hasError) {
        className += ' border-red-500 bg-red-50';
      } else if (hasWarning) {
        className += ' border-yellow-500 bg-yellow-50';
      } else {
        className += ' border-green-500 bg-green-50';
      }
    } else {
      className += ' border-gray-300';
    }

    return className;
  }, [validationState]);

  /**
   * Renderizar mensaje de error/warning para campo
   */
  const renderFieldMessage = useCallback((fieldName) => {
    const errors = [
      ...(validationState.errors[fieldName] || []),
      ...(validationState.errors[`${fieldName}Type`] || []),
      ...(validationState.errors[`${fieldName}Number`] || [])
    ];
    
    const warnings = [
      ...(validationState.warnings[fieldName] || []),
      ...(validationState.warnings[`${fieldName}Type`] || []),
      ...(validationState.warnings[`${fieldName}Number`] || [])
    ];

    if (errors.length > 0) {
      return (
        <div className="flex items-center mt-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {errors[0]}
        </div>
      );
    }

    if (warnings.length > 0) {
      return (
        <div className="flex items-center mt-1 text-sm text-yellow-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {warnings[0]}
        </div>
      );
    }

    if (validationState.touched[fieldName] && !errors.length && !warnings.length) {
      return (
        <div className="flex items-center mt-1 text-sm text-green-600">
          <CheckCircle className="w-4 h-4 mr-1" />
          Válido
        </div>
      );
    }

    return null;
  }, [validationState]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <User className="w-6 h-6 mr-2 text-blue-600" />
          {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
        </h2>
      </div>

      {/* Resumen de validación */}
      {showValidationSummary && Object.keys(validationState.errors).length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="font-medium text-red-800">Errores en el formulario</h3>
          </div>
          <ul className="list-disc list-inside text-sm text-red-700">
            {Object.values(validationState.errors).flat().map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre completo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            className={getFieldClassName('name')}
            placeholder="Ingrese el nombre completo"
            maxLength={100}
          />
          {renderFieldMessage('name')}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              className={`pl-10 ${getFieldClassName('phone')}`}
              placeholder="04141234567"
              maxLength={15}
            />
          </div>
          {renderFieldMessage('phone')}
        </div>

        {/* Documento de identidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Documento de Identidad *
          </label>
          <div className="flex space-x-2">
            <select
              value={formData.idType}
              onChange={(e) => handleFieldChange('idType', e.target.value)}
              className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="V">V</option>
              <option value="E">E</option>
              <option value="J">J</option>
              <option value="P">P</option>
              <option value="G">G</option>
            </select>
            <div className="flex-1 relative">
              <CreditCard className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) => handleFieldChange('idNumber', e.target.value)}
                className={`pl-10 ${getFieldClassName('idNumber')}`}
                placeholder="12345678"
                maxLength={12}
              />
            </div>
          </div>
          {renderFieldMessage('idNumber')}
        </div>

        {/* Email (opcional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email (Opcional)
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            className={getFieldClassName('email')}
            placeholder="cliente@ejemplo.com"
            maxLength={100}
          />
          {renderFieldMessage('email')}
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Cliente')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedCustomerForm;
