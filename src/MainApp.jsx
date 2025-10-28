import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useNotification } from './contexts/NotificationContext';
import { useCustomers } from './contexts/CustomerContext';
import Navigation from './components/common/Navigation';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoyaltyCardSystem from './components/LoyaltyCardSystem';
import TestErrorHandling from './pages/TestErrorHandling';

// Componente principal de la aplicación (protegido)
const MainApp = () => {
  const [showMainPanel, setShowMainPanel] = useState(true);
  const [stampsPerReward, setStampsPerReward] = useState(() => {
    const savedStamps = localStorage.getItem('stampsPerReward');
    return savedStamps ? parseInt(savedStamps, 10) : 10;
  });

  const { showError, showSuccess, showWarning } = useNotification();
  
  // Usar el contexto de clientes en lugar de estado local
  const {
    customers,
    setCustomers,
    addCustomer,
    prefixCandidates,
    setPrefixCandidates,
    showPrefixFixModal,
    setShowPrefixFixModal,
    filterByStamps,
    setFilterByStamps,
    filterByDate,
    setFilterByDate
  } = useCustomers();

  // El CustomerContext ya maneja la carga de clientes desde localStorage

  // Function to normalize customer IDs
  const normalizeCustomerIds = useCallback(() => {
    try {
      let fixed = 0;
      const candidates = [];
      const updated = customers.map((c) => {
        let idType = c.idType ? String(c.idType).toUpperCase().trim() : '';
        let idNumber = c.idNumber ? String(c.idNumber).replace(/[^0-9]/g, '') : '';
        const cedula = c.cedula ? String(c.cedula).toUpperCase().trim() : '';

        if ((!idType || !idNumber) && cedula) {
          const match = cedula.match(/^([VEJ])[-\s]?([0-9]+)$/);
          if (match) {
            if (!idType) idType = match[1];
            if (!idNumber) idNumber = match[2];
          }
        }

        const digitsOnlyCedula = cedula && /^\d+$/.test(cedula);
        const hasNumberNoType = !!idNumber && !idType;
        const onlyDigitsNoType = digitsOnlyCedula && !idType;
        if (hasNumberNoType || onlyDigitsNoType) {
          const proposedNumber = idNumber || (digitsOnlyCedula ? cedula : '');
          candidates.push({ id: c.id, name: c.name, idNumber: proposedNumber, idType: 'V' });
          return c;
        }

        if (idType && !idNumber && digitsOnlyCedula) {
          idNumber = cedula;
        }

        if (idType && idNumber) {
          const newCedula = `${idType}-${idNumber}`;
          if (c.idType !== idType || c.idNumber !== idNumber || c.cedula !== newCedula) {
            fixed++;
            return { ...c, idType, idNumber, cedula: newCedula, updatedAt: new Date().toISOString() };
          }
        }
        return c;
      });

      if (fixed > 0) {
        setCustomers(updated);
        try { localStorage.setItem('customers', JSON.stringify(updated)); } catch {}
        showSuccess(`${fixed} cliente(s) corregido(s).`);
      }

      if (candidates.length > 0) {
        setPrefixCandidates(candidates);
        setShowPrefixFixModal(true);
        if (fixed === 0) {
          showSuccess('Selecciona el prefijo para completar los registros.');
        }
        return;
      }

      if (fixed === 0) {
        showSuccess('No se encontraron registros para corregir.');
      }
    } catch (error) {
      console.error('Error normalizando IDs:', error);
      showError('Error al corregir prefijos');
    }
  }, [customers, showSuccess, showError]);

  // Guardar las selecciones del modal de prefijos
  const confirmPrefixFixes = useCallback(() => {
    try {
      if (!prefixCandidates || prefixCandidates.length === 0) {
        setShowPrefixFixModal(false);
        return;
      }
      let fixed = 0;
      const selectedMap = new Map(prefixCandidates.map(p => [p.id, p]));
      const updated = customers.map((c) => {
        const sel = selectedMap.get(c.id);
        if (!sel) return c;
        const idType = sel.idType;
        const idNumber = (sel.idNumber || '').toString().replace(/[^0-9]/g, '');
        if (!idType || !idNumber) return c;
        const newCedula = `${idType}-${idNumber}`;
        fixed++;
        return { ...c, idType, idNumber, cedula: newCedula, updatedAt: new Date().toISOString() };
      });
      setCustomers(updated);
      try { localStorage.setItem('customers', JSON.stringify(updated)); } catch (e) {}
      setShowPrefixFixModal(false);
      setPrefixCandidates([]);
      showSuccess(`${fixed} cliente(s) actualizados.`);
    } catch (error) {
      console.error('Error aplicando prefijos seleccionados:', error);
      showError('No se pudieron guardar los cambios');
    }
  }, [customers, prefixCandidates, showSuccess, showError]);

  // Función para importar clientes desde JSON
  const handleImportCustomersFromJSON = useCallback(async (jsonData) => {
    try {
      console.log('🔍 DEBUG Importando clientes desde MainApp:', jsonData);

      let clientsToImport = [];

      // Verificar formato del JSON
      if (Array.isArray(jsonData)) {
        clientsToImport = jsonData;
      } else if (jsonData.customers && Array.isArray(jsonData.customers)) {
        clientsToImport = jsonData.customers;
      } else if (typeof jsonData === 'object' && jsonData !== null) {
        clientsToImport = [jsonData];
      } else {
        throw new Error('Formato de archivo no reconocido');
      }

      if (clientsToImport.length === 0) {
        showError('No se encontraron clientes para importar');
        return;
      }

      console.log(`📦 Importando ${clientsToImport.length} clientes...`);
      
      let imported = 0;
      let skipped = 0;
      let errors = 0;

      // Importar cada cliente
      for (const client of clientsToImport) {
        try {
          // Verificar si ya existe por teléfono
          const exists = customers.find(c => c.phone === client.phone);
          if (exists) {
            console.log(`⏭️ Cliente ya existe: ${client.name}`);
            skipped++;
            continue;
          }

          // Preparar datos con mapeo flexible de campos
          // Extraer idType e idNumber de cedula si existe
          let idType = client.idType || 'V';
          let idNumber = client.idNumber || '';
          
          if (client.cedula && !client.idNumber) {
            // Parsear cedula formato "V-12345678" o "V12345678"
            const cedulaMatch = client.cedula.match(/^([VEJPG])-?(\d+)$/i);
            if (cedulaMatch) {
              idType = cedulaMatch[1].toUpperCase();
              idNumber = cedulaMatch[2];
            }
          }
          
          const clientData = {
            name: client.name || client.nombre || 'Cliente sin nombre',
            phone: client.phone || client.telefono || client.tel || '',
            idType: idType,
            idNumber: idNumber,
            cedula: client.cedula || `${idType}-${idNumber}`,
            code: client.code || client.codigo || '',
            stamps: parseInt(client.stamps || client.sellos || 0),
            totalPurchases: client.totalPurchases || client.comprasTotales || 0,
            rewardsEarned: client.rewardsEarned || client.premiosGanados || 0,
            purchaseHistory: client.purchaseHistory || client.historialCompras || client.history || [],
            joinDate: client.joinDate || client.fechaRegistro || client.createdAt || new Date().toISOString(),
            lastPurchase: client.lastPurchase || client.ultimaCompra || client.updatedAt || null,
          };

          // Importar usando addCustomer del contexto
          await addCustomer(clientData);
          imported++;
          console.log(`✅ Importado: ${client.name}`);
        } catch (error) {
          console.error(`❌ Error importando ${client.name}:`, error);
          errors++;
        }
      }

      // Mostrar resumen
      const message = `Importación: ${imported} exitosos, ${skipped} omitidos, ${errors} errores`;
      if (errors > 0) {
        showWarning(message);
      } else {
        showSuccess(message);
      }
    } catch (error) {
      console.error('❌ Error al importar:', error);
      showError(`Error al importar: ${error.message}`);
    }
  }, [customers, addCustomer, showError, showSuccess, showWarning]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        onExit={setShowMainPanel}
        showMainPanel={showMainPanel}
        normalizeCustomerIds={normalizeCustomerIds}
        onImportCustomersFromJSON={handleImportCustomersFromJSON}
        onExportCustomersToJSON={() => {
          try {
            const payload = {
              exportedAt: new Date().toISOString(),
              count: customers.length,
              customers,
            };
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const dateStr = new Date().toISOString().slice(0, 10);
            a.href = url;
            a.download = `customers-${dateStr}.json`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }, 0);
            showSuccess('Datos exportados correctamente');
          } catch (error) {
            console.error('Error al exportar clientes:', error);
            showError('Error al exportar datos a JSON');
          }
        }}
        customers={customers}
        stampsPerReward={stampsPerReward}
        setStampsPerReward={setStampsPerReward}
      />
      <main className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8 pt-6">
        <Routes>
          <Route path="/" element={showMainPanel ? (
            <ProtectedRoute>
              <LoyaltyCardSystem
                customers={customers}
                setCustomers={setCustomers}
                stampsPerReward={stampsPerReward}
                setStampsPerReward={setStampsPerReward}
                prefixCandidates={prefixCandidates}
                setPrefixCandidates={setPrefixCandidates}
                showPrefixFixModal={showPrefixFixModal}
                setShowPrefixFixModal={setShowPrefixFixModal}
                onConfirmPrefixFixes={confirmPrefixFixes}
                filterByStamps={filterByStamps}
                setFilterByStamps={setFilterByStamps}
                filterByDate={filterByDate}
                setFilterByDate={setFilterByDate}
              />
            </ProtectedRoute>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Panel de Salida</h2>
              <p className="text-gray-600 mb-6 text-center">
                Has salido del panel principal. Haz clic en "Cerrar sesión" en la barra de navegación para volver al login.
              </p>
              <button
                onClick={() => setShowMainPanel(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Volver al Panel Principal
              </button>
            </div>
          )} />
          <Route path="/test-errors" element={
            <ProtectedRoute requiredRole="admin">
              <TestErrorHandling />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
};

export default MainApp;
