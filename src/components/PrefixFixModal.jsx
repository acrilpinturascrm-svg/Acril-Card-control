import React, { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { Button } from './common';
import { useCustomers } from '../contexts/CustomerContext';
import { useNotification } from '../contexts/NotificationContext';

const PrefixFixModal = () => {
  const { prefixCandidates, showPrefixFixModal, hidePrefixModal } = useCustomers();
  const { showSuccess, showError } = useNotification();
  const [selectedPrefixes, setSelectedPrefixes] = useState(new Map());

  // Inicializar selecciones por defecto
  React.useEffect(() => {
    if (prefixCandidates.length > 0) {
      const initialSelections = new Map();
      prefixCandidates.forEach(candidate => {
        initialSelections.set(candidate.id, candidate.idType);
      });
      setSelectedPrefixes(initialSelections);
    }
  }, [prefixCandidates]);

  const handlePrefixChange = useCallback((customerId, newPrefix) => {
    setSelectedPrefixes(prev => new Map(prev).set(customerId, newPrefix));
  }, []);

  const handleIdNumberChange = useCallback((customerId, newNumber) => {
    // Solo permitir números
    const numericValue = newNumber.replace(/[^0-9]/g, '');
    setSelectedPrefixes(prev => {
      const newMap = new Map(prev);
      const currentData = newMap.get(customerId);
      newMap.set(customerId, {
        ...currentData,
        idNumber: numericValue
      });
      return newMap;
    });
  }, []);

  const handleConfirmFixes = useCallback(async () => {
    try {
      const { customers, updateCustomer, setCustomers } = useCustomers();
      let fixed = 0;

      // Actualizar clientes con las selecciones
      const updatedCustomers = customers.map(customer => {
        const selection = selectedPrefixes.get(customer.id);
        if (!selection || typeof selection === 'string') return customer;

        const { idType, idNumber } = selection;
        if (!idType || !idNumber) return customer;

        const newCedula = `${idType}-${idNumber}`;
        fixed++;

        return {
          ...customer,
          idType,
          idNumber,
          cedula: newCedula,
          updatedAt: new Date().toISOString()
        };
      });

      // Aplicar los cambios
      if (fixed > 0) {
        setCustomers(updatedCustomers);
        try {
          localStorage.setItem('customers', JSON.stringify(updatedCustomers));
        } catch (error) {
          console.error('Error saving customers:', error);
        }

        showSuccess(`${fixed} cliente(s) corregido(s).`);
      }

      hidePrefixModal();
    } catch (error) {
      console.error('Error applying prefix fixes:', error);
      showError('No se pudieron guardar los cambios');
    }
  }, [selectedPrefixes, showSuccess, showError, hidePrefixModal]);

  const handleCancel = useCallback(() => {
    hidePrefixModal();
  }, [hidePrefixModal]);

  if (!showPrefixFixModal || prefixCandidates.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={handleCancel}></div>

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Completar prefijo de cédula/RIF
            </h3>
            <p className="text-sm text-gray-600">
              Se detectaron clientes sin prefijo. Selecciona el tipo correcto para cada uno.
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="max-h-96 overflow-y-auto p-6">
          <div className="space-y-4">
            {prefixCandidates.map((candidate) => (
              <div key={candidate.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{candidate.name}</h4>
                    <p className="text-sm text-gray-500">Cédula actual: {candidate.cedula || 'No definida'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Número de identificación */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Identificación
                    </label>
                    <input
                      type="text"
                      value={selectedPrefixes.get(candidate.id)?.idNumber || candidate.idNumber || ''}
                      onChange={(e) => handleIdNumberChange(candidate.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Solo números"
                    />
                  </div>

                  {/* Tipo de prefijo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Prefijo
                    </label>
                    <div className="flex space-x-2">
                      {['V', 'E', 'J'].map((prefix) => (
                        <label
                          key={prefix}
                          className={`flex-1 flex items-center justify-center px-3 py-2 border rounded-md cursor-pointer transition-colors ${
                            selectedPrefixes.get(candidate.id) === prefix
                              ? 'border-red-600 bg-red-50 text-red-700'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`prefix-${candidate.id}`}
                            value={prefix}
                            checked={selectedPrefixes.get(candidate.id) === prefix}
                            onChange={() => handlePrefixChange(candidate.id, prefix)}
                            className="sr-only"
                          />
                          <span className="font-medium">{prefix}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview del resultado */}
                {(() => {
                  const selection = selectedPrefixes.get(candidate.id);
                  if (!selection || typeof selection === 'string') return null;

                  const { idType, idNumber } = selection;
                  if (!idType || !idNumber) return null;

                  return (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Resultado:</strong> {idType}-{idNumber}
                      </p>
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmFixes}
          >
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrefixFixModal;
