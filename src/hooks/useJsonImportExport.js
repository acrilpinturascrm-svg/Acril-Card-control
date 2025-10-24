import { useCallback } from 'react';
import { useCustomers } from '../contexts/CustomerContext';
import { useNotification } from '../contexts/NotificationContext';

export const useJsonImport = () => {
  const { setCustomers } = useCustomers();
  const { showSuccess, showError } = useNotification();

  const handleJsonImported = useCallback((jsonData) => {
    try {
      console.log('Datos importados:', jsonData);
      let importedCustomers = [];

      // Validar y normalizar los datos importados
      if (Array.isArray(jsonData)) {
        importedCustomers = jsonData.map(customer => ({
          ...customer,
          // Asegurar que los campos requeridos existan
          id: customer.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: customer.name || 'Cliente sin nombre',
          phone: customer.phone || '',
          idType: customer.idType || 'V',
          idNumber: customer.idNumber || '',
          cedula: customer.cedula || (customer.idType && customer.idNumber ? `${customer.idType}-${customer.idNumber}` : ''),
          code: customer.code || '',
          stamps: customer.stamps || 0,
          history: Array.isArray(customer.history) ? customer.history : [],
          createdAt: customer.createdAt || new Date().toISOString(),
          updatedAt: customer.updatedAt || new Date().toISOString()
        }));
      } else if (jsonData.customers && Array.isArray(jsonData.customers)) {
        importedCustomers = jsonData.customers.map(customer => ({
          ...customer,
          id: customer.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: customer.name || 'Cliente sin nombre',
          phone: customer.phone || '',
          idType: customer.idType || 'V',
          idNumber: customer.idNumber || '',
          cedula: customer.cedula || (customer.idType && customer.idNumber ? `${customer.idType}-${customer.idNumber}` : ''),
          code: customer.code || '',
          stamps: customer.stamps || 0,
          history: Array.isArray(customer.history) ? customer.history : [],
          createdAt: customer.createdAt || new Date().toISOString(),
          updatedAt: customer.updatedAt || new Date().toISOString()
        }));
      } else if (typeof jsonData === 'object' && jsonData !== null) {
        importedCustomers = [{
          ...jsonData,
          id: jsonData.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: jsonData.name || 'Cliente sin nombre',
          phone: jsonData.phone || '',
          idType: jsonData.idType || 'V',
          idNumber: jsonData.idNumber || '',
          cedula: jsonData.cedula || (jsonData.idType && jsonData.idNumber ? `${jsonData.idType}-${jsonData.idNumber}` : ''),
          code: jsonData.code || '',
          stamps: jsonData.stamps || 0,
          history: Array.isArray(jsonData.history) ? jsonData.history : [],
          createdAt: jsonData.createdAt || new Date().toISOString(),
          updatedAt: jsonData.updatedAt || new Date().toISOString()
        }];
      } else {
        throw new Error('Formato de archivo no reconocido');
      }

      // Verificar si hay clientes para importar
      if (importedCustomers.length === 0) {
        showError('No se encontraron clientes para importar');
        return;
      }

      // Actualizar el estado con los nuevos clientes
      setCustomers(prevCustomers => {
        // Filtrar clientes duplicados por ID o cédula
        const uniqueCustomers = [...prevCustomers];
        const existingIds = new Set(prevCustomers.map(c => c.id));
        const existingCedulas = new Set(prevCustomers.map(c => c.cedula).filter(Boolean));

        let addedCount = 0;
        importedCustomers.forEach(customer => {
          if (!existingIds.has(customer.id) && !existingCedulas.has(customer.cedula)) {
            uniqueCustomers.push(customer);
            existingIds.add(customer.id);
            if (customer.cedula) existingCedulas.add(customer.cedula);
            addedCount++;
          }
        });

        // Guardar en localStorage
        try {
          localStorage.setItem('customers', JSON.stringify(uniqueCustomers));
        } catch (error) {
          console.error('Error saving to localStorage:', error);
        }

        return uniqueCustomers;
      });

      showSuccess(`${importedCustomers.length} cliente(s) importado(s) correctamente`);
    } catch (error) {
      console.error('Error al procesar el archivo JSON:', error);
      showError(`Error al importar datos: ${error.message}`);
    }
  }, [setCustomers, showError, showSuccess]);

  return { handleJsonImported };
};

export const useJsonExport = () => {
  const { customers } = useCustomers();
  const { showSuccess, showError } = useNotification();

  const exportCustomersToJSON = useCallback(() => {
    try {
      const now = new Date();
      const payload = {
        exportedAt: now.toISOString(),
        exportedBy: 'ACRILCARD System',
        version: '1.6.0',
        count: customers.length,
        device: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
        customers,
      };
      
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      // Nombre más descriptivo: ACRILCARD_backup_2025-10-24_15-30_150clientes.json
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = now.toTimeString().slice(0, 5).replace(':', '-');
      a.href = url;
      a.download = `ACRILCARD_backup_${dateStr}_${timeStr}_${customers.length}clientes.json`;
      
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      // Guardar info del último backup
      localStorage.setItem('lastBackupInfo', JSON.stringify({
        date: now.toISOString(),
        count: customers.length,
        filename: `ACRILCARD_backup_${dateStr}_${timeStr}_${customers.length}clientes.json`
      }));
      
      showSuccess(`✅ ${customers.length} clientes exportados correctamente`);
    } catch (error) {
      console.error('Error al exportar clientes:', error);
      showError('Error al exportar datos a JSON');
    }
  }, [customers, showSuccess, showError]);

  return { exportCustomersToJSON };
};
