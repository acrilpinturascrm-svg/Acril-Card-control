import React, { useState, useCallback } from 'react';
import { User, Plus } from 'lucide-react';
import { Button } from './common';
import { useCustomers } from '../contexts/CustomerContext';
import { useNotification } from '../contexts/NotificationContext';
import { generateCustomerCode, digitsOnly } from '../utils/logic';

const CustomerForm = () => {
  const { addCustomer, loading } = useCustomers();
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    idType: 'V',
    idNumber: ''
  });

  const [errors, setErrors] = useState({});

  // Validación del formulario
  const validateForm = useCallback((data) => {
    const newErrors = {};
    const name = (data.name || '').trim();
    const phone = digitsOnly(data.phone);
    const idType = String(data.idType || '').toUpperCase();
    const idNumber = digitsOnly(data.idNumber);

    if (!name) {
      newErrors.name = 'El nombre es requerido';
    } else if (name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!phone) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^\d{8,15}$/.test(phone)) {
      newErrors.phone = 'El teléfono debe tener entre 8 y 15 dígitos';
    }

    if (!idNumber) {
      newErrors.idNumber = 'El número de identificación es requerido';
    } else if (!/^[0-9]{6,12}$/.test(idNumber)) {
      newErrors.idNumber = 'El número debe tener entre 6 y 12 dígitos';
    }

    if (!['V','E','J'].includes(idType)) {
      newErrors.idType = 'Tipo de identificación inválido (V/E/J)';
    }

    return newErrors;
  }, []);

  // Manejar cambios en los inputs
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [errors]);

  // Manejar envío del formulario
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Verificar si ya existe un cliente con la misma cédula
      const { customers } = useCustomers();
      const duplicate = customers.find(
        c => c.idType === formData.idType && c.idNumber === formData.idNumber
      );

      if (duplicate) {
        setErrors({ idNumber: 'Ya existe un cliente con este documento' });
        return;
      }

      // Generar código único para el cliente
      const code = generateCustomerCode(
        formData.idType,
        formData.idNumber,
        formData.name,
        customers
      );

      // Crear el nuevo cliente
      const customerData = {
        ...formData,
        name: formData.name.trim(),
        phone: formData.phone.replace(/\s|-/g, ''),
        cedula: `${formData.idType}-${formData.idNumber}`,
        idNumber: formData.idNumber.trim(),
        code,
        stamps: 0,
        totalPurchases: 0,
        rewardsEarned: 0,
        purchaseHistory: [],
        joinDate: new Date().toISOString(),
        lastPurchase: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addCustomer(customerData);

      // Limpiar formulario
      setFormData({
        name: '',
        phone: '',
        idType: 'V',
        idNumber: ''
      });
      setErrors({});

      showSuccess('Cliente agregado exitosamente');
    } catch (error) {
      console.error('Error adding customer:', error);
      showError('Error al agregar cliente');
    }
  }, [formData, validateForm, addCustomer, showSuccess, showError]);

  // Generar preview del código
  const previewCode = React.useMemo(() => {
    if (!formData.name || !formData.idType || !formData.idNumber) {
      return '';
    }

    try {
      const { customers } = useCustomers();
      return generateCustomerCode(
        formData.idType,
        formData.idNumber,
        formData.name,
        customers
      );
    } catch {
      return '';
    }
  }, [formData]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-red-100 p-2 rounded-lg">
          <Plus className="w-6 h-6 text-red-800" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Agregar Nuevo Cliente</h2>
          <p className="text-sm text-gray-600">Complete la información del cliente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo de nombre */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ingrese el nombre completo"
            aria-describedby={errors.name ? 'name-error' : undefined}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        {/* Campo de teléfono */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono *
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ej: 04141234567"
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            aria-invalid={!!errors.phone}
          />
          {errors.phone && (
            <p id="phone-error" className="mt-1 text-sm text-red-600">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Campos de identificación */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="idType" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de ID *
            </label>
            <select
              id="idType"
              value={formData.idType}
              onChange={(e) => handleInputChange('idType', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.idType ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-describedby={errors.idType ? 'idType-error' : undefined}
              aria-invalid={!!errors.idType}
            >
              <option value="V">V - Venezolano</option>
              <option value="E">E - Extranjero</option>
              <option value="J">J - Jurídico</option>
            </select>
            {errors.idType && (
              <p id="idType-error" className="mt-1 text-sm text-red-600">
                {errors.idType}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Número de ID *
            </label>
            <input
              type="text"
              id="idNumber"
              value={formData.idNumber}
              onChange={(e) => handleInputChange('idNumber', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.idNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Solo números"
              aria-describedby={errors.idNumber ? 'idNumber-error' : undefined}
              aria-invalid={!!errors.idNumber}
            />
            {errors.idNumber && (
              <p id="idNumber-error" className="mt-1 text-sm text-red-600">
                {errors.idNumber}
              </p>
            )}
          </div>
        </div>

        {/* Preview del código */}
        {previewCode && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <label className="block text-sm font-medium text-blue-800 mb-1">
              Código del Cliente
            </label>
            <p className="text-lg font-mono font-bold text-blue-600">{previewCode}</p>
            <p className="text-xs text-blue-600 mt-1">
              Este código será asignado al cliente
            </p>
          </div>
        )}

        {/* Preview de la cédula */}
        {(formData.idType && formData.idNumber) && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cédula del Cliente
            </label>
            <p className="text-lg font-mono font-semibold text-gray-800">
              {formData.idType}-{formData.idNumber}
            </p>
          </div>
        )}

        {/* Botones */}
        <div className="flex space-x-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Agregando...' : 'Agregar Cliente'}
          </Button>
        </div>
      </form>

      {/* Información de ayuda */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">💡 Consejos:</h4>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• El nombre debe tener al menos 2 caracteres</li>
          <li>• El teléfono debe tener entre 8 y 15 dígitos</li>
          <li>• El número de identificación es obligatorio</li>
          <li>• El código se genera automáticamente</li>
        </ul>
      </div>
    </div>
  );
};

export default CustomerForm;
