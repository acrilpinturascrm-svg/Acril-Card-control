import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';

// Crear el contexto
const CustomerContext = createContext();

// Provider del contexto
export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByStamps, setFilterByStamps] = useState('all');
  const [filterByDate, setFilterByDate] = useState('all');
  const [prefixCandidates, setPrefixCandidates] = useState([]);
  const [showPrefixFixModal, setShowPrefixFixModal] = useState(false);

  // Cargar clientes desde localStorage al inicializar
  useEffect(() => {
    const loadCustomers = () => {
      try {
        const stored = localStorage.getItem('customers');
        if (stored) {
          const customersData = JSON.parse(stored);
          setCustomers(customersData);
        }
      } catch (error) {
        console.error('Error loading customers:', error);
      }
    };

    loadCustomers();
  }, []);

  // Guardar clientes en localStorage cuando cambien
  useEffect(() => {
    if (customers.length > 0) {
      try {
        localStorage.setItem('customers', JSON.stringify(customers));
      } catch (error) {
        console.error('Error saving customers:', error);
      }
    }
  }, [customers]);

  // Funciones para manejar clientes
  const addCustomer = useCallback(async (customerData) => {
    setLoading(true);
    try {
      // Aquí iría la lógica de validación y creación
      const newCustomer = {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...customerData,
        stamps: 0,
        totalPurchases: 0,
        rewardsEarned: 0,
        purchaseHistory: [],
        whatsappHistory: [],
        joinDate: new Date().toISOString(),
        lastPurchase: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCustomers(prev => [...prev, newCustomer]);
      setSelectedCustomer(newCustomer);

      return newCustomer;
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCustomer = useCallback((customerId, updates) => {
    setCustomers(prev => prev.map(customer =>
      customer.id === customerId
        ? { ...customer, ...updates, updatedAt: new Date().toISOString() }
        : customer
    ));
  }, []);
  
  // Agregar mensaje de WhatsApp al historial
  const addWhatsAppHistory = useCallback((customerId, messageData) => {
    const historyEntry = {
      id: Date.now() + Math.random(),
      date: new Date().toISOString(),
      template: messageData.template || 'custom',
      status: messageData.status || 'sent',
      message: messageData.message || '',
      error: messageData.error || null
    };
    
    setCustomers(prev => prev.map(customer => {
      if (customer.id === customerId) {
        const whatsappHistory = customer.whatsappHistory || [];
        return {
          ...customer,
          whatsappHistory: [...whatsappHistory, historyEntry],
          lastWhatsAppSent: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      return customer;
    }));
    
    return historyEntry;
  }, []);

  const deleteCustomer = useCallback((customerId) => {
    setCustomers(prev => {
      const updated = prev.filter(c => c.id !== customerId);
      try {
        localStorage.setItem('customers', JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving after delete:', error);
      }
      return updated;
    });

    if (selectedCustomer?.id === customerId) {
      setSelectedCustomer(null);
    }
  }, [selectedCustomer]);

  const selectCustomer = useCallback((customer) => {
    setSelectedCustomer(customer);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCustomer(null);
  }, []);

  // Funciones para filtros
  const setSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const setStampsFilter = useCallback((filter) => {
    setFilterByStamps(filter);
  }, []);

  const setDateFilter = useCallback((filter) => {
    setFilterByDate(filter);
  }, []);

  // Funciones para el modal de prefijos
  const showPrefixModal = useCallback((candidates) => {
    setPrefixCandidates(candidates);
    setShowPrefixFixModal(true);
  }, []);

  const hidePrefixModal = useCallback(() => {
    setShowPrefixFixModal(false);
    setPrefixCandidates([]);
  }, []);

  // Función para filtrar clientes por fecha
  const filterCustomersByDate = useCallback((customersList, dateFilter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return customersList.filter(customer => {
      if (!customer.lastUpdated && !customer.updatedAt) return dateFilter === 'all';
      
      const customerDate = new Date(customer.lastUpdated || customer.updatedAt);
      const customerDay = new Date(customerDate.getFullYear(), customerDate.getMonth(), customerDate.getDate());
      const diffTime = today - customerDay;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch(dateFilter) {
        case 'today':
          return diffDays === 0;
        case 'week':
          return diffDays <= 7;
        case 'month':
          return diffDays <= 30;
        case 'older':
          return diffDays > 30;
        case 'all':
        default:
          return true;
      }
    });
  }, []);

  // Filtrar clientes por término de búsqueda y fecha
  const filteredCustomers = useMemo(() => {
    let result = [...customers];
    
    // Aplicar filtro de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(customer => 
        customer.name.toLowerCase().includes(term) ||
        customer.phone.includes(term) ||
        customer.idNumber.includes(term) ||
        customer.code?.toLowerCase().includes(term)
      );
    }
    
    // Aplicar filtro por fecha
    if (filterByDate !== 'all') {
      result = filterCustomersByDate(result, filterByDate);
    }
    
    // Aplicar filtro por sellos
    if (filterByStamps !== 'all') {
      const stampsPerReward = 10; // Valor por defecto, se puede pasar como parámetro
      result = result.filter(customer => {
        const stamps = customer.stamps || 0;
        const currentStamps = stamps % stampsPerReward;
        
        switch(filterByStamps) {
          case 'empty':
            return stamps === 0;
          case 'half':
            return currentStamps > 0 && currentStamps < stampsPerReward / 2;
          case 'almost':
            return currentStamps >= stampsPerReward / 2 && currentStamps < stampsPerReward;
          case 'full':
            return Math.floor(stamps / stampsPerReward) > 0;
          default:
            return true;
        }
      });
    }
    
    return result;
  }, [customers, searchTerm, filterByDate, filterByStamps, filterCustomersByDate]);

  // Valor del contexto
  const contextValue = {
    // Estado
    customers,
    filteredCustomers,
    selectedCustomer,
    loading,
    searchTerm,
    filterByStamps,
    filterByDate,
    prefixCandidates,
    showPrefixFixModal,

    // Acciones
    addCustomer,
    updateCustomer,
    deleteCustomer,
    selectCustomer,
    clearSelection,
    setCustomers, // ✅ AGREGADO: Función faltante para importación
    addWhatsAppHistory, // ✅ AGREGADO: Función para historial de WhatsApp

    // Filtros
    setSearchTerm,
    setFilterByStamps,
    setFilterByDate,
    // Mantener compatibilidad con nombres anteriores
    setSearch: setSearchTerm,
    setStampsFilter: setFilterByStamps,
    setDateFilter: setFilterByDate,

    // Modal de prefijos
    showPrefixModal,
    hidePrefixModal,
  };

  return (
    <CustomerContext.Provider value={contextValue}>
      {children}
    </CustomerContext.Provider>
  );
};

// Hook para usar el contexto
export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
};

export default CustomerContext;
