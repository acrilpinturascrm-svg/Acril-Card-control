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

  const { showError, showSuccess } = useNotification();
  
  // Usar el contexto de clientes en lugar de estado local
  const {
    customers,
    setCustomers,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        onExit={setShowMainPanel}
        showMainPanel={showMainPanel}
        normalizeCustomerIds={normalizeCustomerIds}
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
