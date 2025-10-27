import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, Plus, Search, Award, ShoppingBag, Calendar, Trash2, Copy, Star, X, Minus, MessageCircle, Gift } from 'lucide-react';
import { InputAdornment, Fade } from '@mui/material';

// Importar componentes comunes
import { InputField, Button, EnhancedCustomerForm } from './common';
import CustomerList from './CustomerList';
import { enviarTarjetaPorWhatsApp } from '../utils/whatsapp';

// Importar contexto de notificaciones
import { useNotification } from '../contexts/NotificationContext';
// PocketBase data access (source of truth) with localStorage as cache
import { deleteCustomerRecord as pbDeleteCustomerRecord } from '../services/customerStore';

// Importar utilidades de lógica de negocio
import { generateCustomerCode, digitsOnly, normalizeStr, getProgressPercentage } from '../utils/logic';

// Hook personalizado para manejar eventos de scroll con passive: true
const usePassiveScroll = (ref, handler) => {
  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;

    // Configuración para el event listener pasivo
    const options = {
      passive: true,
      capture: false
    };

    // Agregar el event listener pasivo
    element.addEventListener('scroll', handler, options);

    // Limpieza al desmontar
    return () => {
      element.removeEventListener('scroll', handler, options);
    };
  }, [ref, handler]);
};

const LoyaltyCardSystem = ({
  customers = [],
  setCustomers,
  stampsPerReward: initialStampsPerReward = 10,
  setStampsPerReward: setStampsPerRewardProp,
  prefixCandidates = [],
  setPrefixCandidates,
  showPrefixFixModal = false,
  setShowPrefixFixModal,
  onConfirmPrefixFixes,
  filterByStamps = 'all',
  setFilterByStamps,
  filterByDate = 'all',
  setFilterByDate
}) => {
  // Estados locales
  const [stampsPerReward, setStampsPerRewardState] = useState(initialStampsPerReward);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    idType: 'V', // V: V- Venezolano, E: E- Extranjero, J: J- Jurídico
    idNumber: '' // Número de identificación (sin la letra inicial)
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState('admin');
  const [clientViewCustomer, setClientViewCustomer] = useState(null);
  const [showClientView, setShowClientView] = useState(false);

  // Referencias
  const historyContainerRef = useRef(null);
  const hasLoadedCustomers = useRef(false);

  // Sincronizar stampsPerReward con el prop
  useEffect(() => {
    setStampsPerRewardState(initialStampsPerReward);
  }, [initialStampsPerReward]);

  // Función para actualizar stampsPerReward tanto localmente como en el padre
  const setStampsPerReward = useCallback((value) => {
    setStampsPerRewardState(value);
    if (setStampsPerRewardProp) {
      setStampsPerRewardProp(value);
    }
  }, [setStampsPerRewardProp]);

  // Contexto de notificaciones
  const { showError, showSuccess, showWarning } = useNotification();

  // Función para manejar los datos importados desde JSON
  const handleJsonImported = useCallback((jsonData) => {
    try {
      console.log('Datos importados:', jsonData);

      // Verificar si los datos son un array o si tienen una propiedad 'customers'
      if (Array.isArray(jsonData)) {
        // Si es un array, asumimos que son los clientes directamente
        const newCustomers = [...customers, ...jsonData];
        setCustomers(newCustomers);
        localStorage.setItem('customers', JSON.stringify(newCustomers));
        showSuccess(`${jsonData.length} clientes importados correctamente`);
      } else if (jsonData.customers && Array.isArray(jsonData.customers)) {
        // Si tiene una propiedad 'customers' que es un array
        const newCustomers = [...customers, ...jsonData.customers];
        setCustomers(newCustomers);
        localStorage.setItem('customers', JSON.stringify(newCustomers));
        showSuccess(`${jsonData.customers.length} clientes importados correctamente`);
      } else if (typeof jsonData === 'object' && jsonData !== null) {
        // Si es un objeto único, lo agregamos como un solo cliente
        const newCustomers = [...customers, jsonData];
        setCustomers(newCustomers);
        localStorage.setItem('customers', JSON.stringify(newCustomers));
        showSuccess('Cliente importado correctamente');
      } else {
        throw new Error('Formato de archivo no reconocido');
      }
    } catch (error) {
      console.error('Error al procesar el archivo JSON:', error);
      showError(`Error al importar datos: ${error.message}`);
    }
  }, [customers, setCustomers, showError, showSuccess]);

  // Usar el hook de scroll pasivo para  // Efecto para manejar el scroll pasivo
  const handleScroll = useCallback(() => {
    // Lógica de scroll si es necesaria
  }, []);

  // (Revertido) UI de cola offline deshabilitada temporalmente para estabilizar

  // Usar el hook usePassiveScroll para manejar el scroll
  usePassiveScroll(historyContainerRef, handleScroll);

  // Función para migrar clientes antiguos al nuevo formato
  const migrateOldCustomers = useCallback((savedCustomers) => {
    if (!Array.isArray(savedCustomers)) return [];

    return savedCustomers.map(customer => {
      try {
        // Extraer el número de cédula (solo números)
        let idNumber = '';

        // Si ya tiene idNumber, usarlo
        if (customer.idNumber) {
          idNumber = customer.idNumber.toString().replace(/\D/g, '');
        }
        // Si no tiene idNumber pero tiene cedula, extraer los números
        else if (customer.cedula) {
          idNumber = customer.cedula.replace(/\D/g, '');
        }

        // Si no se pudo obtener un número de cédula, usar un valor por defecto
        if (!idNumber) {
          idNumber = '00000000';
        }

        // Tomar solo los últimos 8 dígitos para evitar problemas con cédulas muy largas
        idNumber = idNumber.slice(-8);

        // Generar un nuevo código basado en el nombre y la cédula
        const name = customer.name || 'SIN NOMBRE';
        const namePrefix = name.trim()
          .toUpperCase()
          .replace(/[^A-Z]/g, '') // Solo letras
          .substring(0, 3); // Tomar hasta 3 letras

        // Crear el código base (3 letras del nombre + 4 últimos dígitos de la cédula)
        const baseCode = `${namePrefix}${idNumber.slice(-4)}`;

        // Verificar si el cliente ya tiene un código válido
        let code = customer.code;
        if (!code || typeof code !== 'string' || code.length < 4) {
          // Si el código no es válido, generar uno nuevo
          code = baseCode;
        }

        // Crear el objeto de cliente migrado
        return {
          ...customer,
          name: name,
          idNumber: idNumber,
          cedula: customer.cedula || `V-${idNumber}`,
          code: code,
          // Mantener el historial de estampas si existe
          history: customer.history || [],
          // Mantener la fecha de creación si existe, de lo contrario usar la actual
          createdAt: customer.createdAt || new Date().toISOString(),
          // Mantener la fecha de última actualización
          updatedAt: new Date().toISOString()
        };
      } catch (error) {
        console.error('Error al migrar cliente:', customer, error);
        // En caso de error, devolver el cliente con valores por defecto
        return {
          ...customer,
          name: customer.name || 'CLIENTE DESCONOCIDO',
          idNumber: '00000000',
          cedula: 'V-00000000',
          code: `ERR${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          history: customer.history || [],
          createdAt: customer.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
    });
  }, []);

  // Efecto para cargar clientes y manejar la vista de cliente desde la URL
  useEffect(() => {
    const loadAndDisplayCustomer = () => {
      try {
        const stored = localStorage.getItem('customers');
        let customersData = [];
        if (stored) {
          customersData = JSON.parse(stored);
        }
        setCustomers(customersData);

        const urlParams = new URLSearchParams(window.location.search);
        const customerParam = urlParams.get('customer');

        if (customerParam) {
          // Buscar por código primero, luego por ID (retrocompatibilidad)
          const foundCustomer = customersData.find(c => 
            c.code === customerParam || c.id === customerParam
          );
          if (foundCustomer) {
            setCurrentView('client');
            setClientViewCustomer(foundCustomer);
          } else {
            setCurrentView('admin');
            showError('El cliente especificado en la URL no fue encontrado.');
          }
        }
      } catch (error) {
        console.error('Error al cargar los datos de clientes:', error);
        showError('Hubo un error al cargar los datos.');
        setCustomers([]);
      }
    };

    loadAndDisplayCustomer();
  }, [showError, setCustomers]);

  // Background sync deshabilitado hasta implementar cola offline

  // Efecto para guardar cambios en localStorage
  useEffect(() => {
    if (hasLoadedCustomers.current && customers.length > 0) {
      try {
        const prevCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
        if (JSON.stringify(prevCustomers) !== JSON.stringify(customers)) {
          localStorage.setItem('customers', JSON.stringify(customers));
        }
      } catch (error) {
        console.error('Error al guardar clientes en localStorage:', error);
        showError('Error al guardar los cambios');
      }
    }
  }, [customers, showError]);




 // Funciones de validación
 const validateCustomer = useCallback((customer) => {
   const newErrors = {};
   const name = (customer.name || '').trim();
   const phone = digitsOnly(customer.phone);
   const idType = String(customer.idType || '').toUpperCase();
   const idNumber = digitsOnly(customer.idNumber);

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

 // Vista de cliente desde URL: ya está resuelta dentro de loadCustomers() al montar

// Funciones de CRUD optimizadas
const addCustomer = useCallback(async () => {
  const validationErrors = validateCustomer(newCustomer);
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  // Validación de duplicados local
  const duplicate = customers.find(
    c => c.idType === newCustomer.idType && c.idNumber === newCustomer.idNumber
  );
  if (duplicate) {
    setErrors({ idNumber: 'Ya existe un cliente con este documento' });
    return;
  }

  // Validación de duplicados por código de cliente
  const duplicateCode = customers.find(
    c => c.code === generateCustomerCode(
      newCustomer.idType,
      newCustomer.idNumber,
      newCustomer.name,
      customers
    )
  );
  if (duplicateCode) {
    setErrors({ idNumber: 'Ya existe un cliente con un código similar. Verifica los datos.' });
    return;
  }

  setLoading(true);
  try {
    const code = generateCustomerCode(
      newCustomer.idType,
      newCustomer.idNumber,
      newCustomer.name,
      customers
    );
    const payload = {
      ...newCustomer,
      name: newCustomer.name.trim(),
      phone: newCustomer.phone.replace(/\s|-/g, ''),
      cedula: `${newCustomer.idType}-${newCustomer.idNumber}`,
      idNumber: newCustomer.idNumber.trim(),
      code,
      stamps: 0,
      totalPurchases: 0,
      joinDate: new Date().toISOString(),
      lastPurchase: null,
      rewardsEarned: 0,
      purchaseHistory: [],
    };

    // Generar ID único para el nuevo cliente
    const newCustomerId = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
    
    const created = {
      ...payload,
      id: newCustomerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Actualizar la lista de clientes directamente
    setCustomers(prev => {
      const updated = [...prev, created];
      try { 
        localStorage.setItem('customers', JSON.stringify(updated)); 
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
      return updated;
    });

    setSelectedCustomer(created);

    // Scroll to the selected customer after a short delay to allow the UI to update
    setTimeout(() => {
      const selectedElement = document.querySelector('.customer-item.selected');
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);

    setNewCustomer({ name: '', phone: '', idType: 'V', idNumber: '' });
    setErrors({});
    showSuccess('Cliente agregado exitosamente');
  } catch (error) {
    console.error('Error al agregar cliente (PocketBase):', error);
    // Fallback offline: crear temporal local y encolar creación
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const tempCustomer = {
      id: tempId,
      _pbId: undefined,
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCustomers(prev => {
      const updated = [...prev, tempCustomer];
      try { localStorage.setItem('customers', JSON.stringify(updated)); } catch {}
      return updated;
    });
    // enqueueSyncOp({ type: 'create', tempId, payload }); // pendiente de implementar
    showError('PocketBase no disponible. Cliente guardado localmente y se sincronizará cuando vuelva la conexión.');
  } finally {
    setLoading(false);
  }
}, [newCustomer, customers, generateCustomerCode, showSuccess, showError, validateCustomer, setCustomers]);

  // Función para agregar un sello - versión simplificada
  const addStamp = useCallback((customerId, purchaseAmount = 0) => {
    setLoading(true);
    try {
      setCustomers(prev => {
        const updated = prev.map(customer => {
          if (customer.id === customerId) {
            const newStamps = Math.max(0, (customer.stamps || 0) + 1);
            const newRewards = Math.floor(newStamps / stampsPerReward);

            const purchase = {
              id: Date.now() + Math.random(),
              date: new Date().toISOString(),
              amount: purchaseAmount,
              stampNumber: newStamps
            };

            const updatedCustomer = {
              ...customer,
              stamps: newStamps,
              totalPurchases: customer.totalPurchases + 1,
              lastPurchase: new Date().toISOString(),
              rewardsEarned: newRewards,
              purchaseHistory: [...customer.purchaseHistory, purchase]
            };

            // Actualizar cliente seleccionado si es el mismo
            if (selectedCustomer?.id === customerId) {
              setSelectedCustomer(updatedCustomer);
            }

            return updatedCustomer;
          }
          return customer;
        });

        // Guardar en localStorage
        localStorage.setItem('customers', JSON.stringify(updated));
        return updated;
      });

      // Notificar si está cerca de un premio
      const currentCustomer = customers.find(c => c.id === customerId);
      if (currentCustomer) {
        const sellosFaltantes = stampsPerReward - ((currentCustomer.stamps + 1) % stampsPerReward);
        if (sellosFaltantes === 1) {
          showWarning('¡Estás a 1 sello del premio!');
        } else if (sellosFaltantes <= 3 && sellosFaltantes > 0) {
          showSuccess(`¡Solo faltan ${sellosFaltantes} sellos para tu premio!`);
        }
      }

      showSuccess('Sello agregado exitosamente');
    } catch (error) {
      showError('Error al agregar sello');
    } finally {
      setLoading(false);
    }
  }, [stampsPerReward, selectedCustomer, showSuccess, showError, customers, setCustomers]);

  // Función para quitar un sello - versión simplificada
  const removeStamp = useCallback((customerId) => {
    setLoading(true);
    try {
      setCustomers(prev => {
        const updated = prev.map(customer => {
          if (customer.id === customerId && customer.stamps > 0) {
            const newStamps = Math.max(0, (customer.stamps || 0) - 1);
            const newRewards = Math.floor(newStamps / stampsPerReward);

            const updatedCustomer = {
              ...customer,
              stamps: newStamps,
              totalPurchases: Math.max(0, customer.totalPurchases - 1),
              rewardsEarned: newRewards,
              purchaseHistory: customer.purchaseHistory.slice(0, -1)
            };

            // Actualizar cliente seleccionado si es el mismo
            if (selectedCustomer?.id === customerId) {
              setSelectedCustomer(updatedCustomer);
            }

            return updatedCustomer;
          }
          return customer;
        });

        // Guardar en localStorage
        localStorage.setItem('customers', JSON.stringify(updated));
        return updated;
      });

      showSuccess('Sello eliminado correctamente');
    } catch (error) {
      showError('Error al quitar sello');
    } finally {
      setLoading(false);
    }
  }, [stampsPerReward, selectedCustomer, showSuccess, showError, setCustomers]);

  // Función para canjear premio - versión simplificada
  const redeemReward = useCallback((customerId) => {
    setLoading(true);
    try {
      setCustomers(prev => {
        const updated = prev.map(customer => {
          if (customer.id === customerId && customer.stamps >= stampsPerReward) {
            const newStamps = Math.max(0, (customer.stamps || 0) - stampsPerReward);
            const updatedCustomer = {
              ...customer,
              stamps: newStamps,
              rewardsEarned: Math.floor(newStamps / stampsPerReward),
              redeemedRewards: [
                ...(customer.redeemedRewards || []),
                {
                  id: Date.now() + Math.random(),
                  date: new Date().toISOString(),
                  stampsUsed: stampsPerReward,
                  rewardType: 'Premio estándar'
                }
              ]
            };

            // Actualizar cliente seleccionado si es el mismo
            if (selectedCustomer?.id === customerId) {
              setSelectedCustomer(updatedCustomer);
            }

            return updatedCustomer;
          }
          return customer;
        });

        // Guardar en localStorage
        localStorage.setItem('customers', JSON.stringify(updated));
        return updated;
      });

      showSuccess('¡Premio canjeado exitosamente! Revisa el historial.');
    } catch (error) {
      showError('Error al canjear premio');
    } finally {
      setLoading(false);
    }
  }, [stampsPerReward, selectedCustomer, showSuccess, showError, setCustomers]);

  const deleteCustomer = useCallback((customerId) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.')) {
      try {
        // Usar el estado actual para evitar dependencias innecesarias
        setCustomers(prevCustomers => {
          // Filtrar el cliente a eliminar
          const updatedCustomers = prevCustomers.filter(c => c.id !== customerId);

          // Actualizar localStorage
          localStorage.setItem('customers', JSON.stringify(updatedCustomers));
          // Eliminar en PocketBase (enqueue on failure, only if not a temp id)
          try {
            if (String(customerId).startsWith('temp-')) {
              // If temp, just remove locally; creation may never happen
            } else {
              pbDeleteCustomerRecord(customerId).catch(() => {
                // TODO: implementar cola offline para borrar cuando vuelva la conexión
              });
            }
          } catch {}

          return updatedCustomers;
        });

        // Limpiar la selección si el cliente eliminado es el seleccionado
        if (selectedCustomer?.id === customerId) {
          setSelectedCustomer(null);
        }

        // Mostrar notificación de éxito
        showSuccess('Cliente eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        showError('Error al eliminar cliente');
      }
    }
  }, [selectedCustomer, setCustomers, showSuccess, showError]);

  // (Manejador de exportación embebido en el JSX más abajo)

  // Corregir prefijos y normalizar datos de identificación
  const normalizeCustomerIds = useCallback(() => {
    try {
      let fixed = 0;
      const candidates = [];
      const updated = customers.map((c) => {
        let idType = c.idType ? String(c.idType).toUpperCase().trim() : '';
        let idNumber = c.idNumber ? String(c.idNumber).replace(/[^0-9]/g, '') : '';
        const cedula = c.cedula ? String(c.cedula).toUpperCase().trim() : '';

        // Intentar inferir desde cedula si falta algo
        if ((!idType || !idNumber) && cedula) {
          const match = cedula.match(/^([VEJ])[-\s]?([0-9]+)$/);
          if (match) {
            if (!idType) idType = match[1];
            if (!idNumber) idNumber = match[2];
          }
        }

        // Determinar si es caso ambiguo: tiene número pero no tipo (o cedula solo dígitos)
        const digitsOnlyCedula = cedula && /^\d+$/.test(cedula);
        const hasNumberNoType = !!idNumber && !idType;
        const onlyDigitsNoType = digitsOnlyCedula && !idType;
        if (hasNumberNoType || onlyDigitsNoType) {
          // Proponer 'V' por defecto pero pedir confirmación
          const proposedNumber = idNumber || (digitsOnlyCedula ? cedula : '');
          candidates.push({ id: c.id, name: c.name, idNumber: proposedNumber, idType: 'V' });
          // No modificar aún este registro
          return c;
        }

        // Si hay tipo pero falta número y la cédula son solo dígitos
        if (idType && !idNumber && digitsOnlyCedula) {
          idNumber = cedula;
        }

        // Si tenemos ambos, normalizar cedula de inmediato
        if (idType && idNumber) {
          const newCedula = `${idType}-${idNumber}`;
          if (c.idType !== idType || c.idNumber !== idNumber || c.cedula !== newCedula) {
            fixed++;
            return { ...c, idType, idNumber, cedula: newCedula, updatedAt: new Date().toISOString() };
          }
        }
        return c;
      });

      // Aplicar fixes determinísticos
      if (fixed > 0) {
        setCustomers(updated);
        try { localStorage.setItem('customers', JSON.stringify(updated)); } catch {}
        showSuccess(`${fixed} cliente(s) corregido(s).`);
      }

      // Si hay candidatos ambiguos, abrir modal para seleccionar V/E/J
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
  }, [customers, setCustomers, showSuccess, showError, setPrefixCandidates, setShowPrefixFixModal]);

  // Usar la función pasada como prop para manejar la confirmación de prefijos
  const handleConfirmPrefixFixes = onConfirmPrefixFixes;

  // Filtros optimizados
  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    // Filtro por término de búsqueda
    if (searchTerm.trim()) {
      const term = normalizeStr(searchTerm);
      filtered = filtered.filter(customer => {
        const name = normalizeStr(customer.name);
        const phone = digitsOnly(customer.phone);
        const ced = (customer.cedula || '').toLowerCase();
        const code = (customer.code || '').toLowerCase();
        return (
          name.includes(term) ||
          phone.includes(term) ||
          ced.includes(term) ||
          code.includes(term)
        );
      });
    }

    // Filtro por sellos
    if (filterByStamps !== 'all') {
      filtered = filtered.filter(customer => {
        const stamps = customer.stamps || 0;
        switch (filterByStamps) {
          case 'low': return stamps < 5;
          case 'medium': return stamps >= 5 && stamps < 15;
          case 'high': return stamps >= 15;
          default: return true;
        }
      });
    }

    // Filtro por fecha
    if (filterByDate !== 'all') {
      const now = new Date();
      filtered = filtered.filter(customer => {
        if (!customer.lastPurchase) return false;
        const lastPurchaseDate = new Date(customer.lastPurchase);
        const daysDiff = (now - lastPurchaseDate) / (1000 * 60 * 60 * 24);
        switch (filterByDate) {
          case 'recent': return daysDiff <= 30;
          case 'old': return daysDiff > 30;
          default: return true;
        }
      });
    }

    return filtered;
  }, [customers, searchTerm, filterByStamps, filterByDate, normalizeStr, digitsOnly]);

  const copyCustomerLink = useCallback(async (customerCode) => {
    try {
      const baseUrl = process.env.REACT_APP_PUBLIC_BASE_URL || window.location.origin;
      const link = `${baseUrl}/card?customer=${customerCode}`;
      await navigator.clipboard.writeText(link);
      showSuccess('Enlace copiado al portapapeles');
    } catch (error) {
      showError('No se pudo copiar el enlace');
    }
  }, [showSuccess, showError]);

  // Manejo de eventos de teclado para accesibilidad
  const handleKeyPress = useCallback((e, callback) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  }, []);

  // Componente de Tarjeta Visual del Cliente
  const CustomerLoyaltyCard = ({ customer }) => (
    <div className="bg-gradient-to-br from-red-800 to-yellow-600 p-6 rounded-2xl shadow-2xl text-white max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold tracking-tight mb-1">ACRILCARD</h2>
        <h3 className="text-xl font-bold mb-2">{customer.name}</h3>
        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
          <p className="text-sm opacity-90">Código de Cliente</p>
          <p className="text-lg font-bold tracking-wider">{customer.code}</p>
        </div>
        <p className="text-sm opacity-90 mt-2">Cédula: {customer.cedula}</p>
      </div>

      {/* Sellos visuales */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {Array.from({ length: stampsPerReward }, (_, index) => (
          <div
            key={index}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
              index < (customer.stamps % stampsPerReward)
                ? 'bg-white text-red-800 shadow-lg transform scale-110'
                : 'bg-white/20 text-white/60 border-2 border-dashed border-white/40'
            }`}
          >
            {index < (customer.stamps % stampsPerReward) ? (
              <Star className="w-6 h-6 fill-current" />
            ) : (
              index + 1
            )}
          </div>
        ))}
      </div>

      {/* Barra de progreso */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Progreso</span>
          <span>{customer.stamps % stampsPerReward} / {stampsPerReward}</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3">
          <div
            className="bg-white rounded-full h-3 transition-all duration-500"
            style={{ width: `${getProgressPercentage(customer.stamps, stampsPerReward)}%` }}
          ></div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-white/10 rounded-lg p-3">
          <p className="text-sm opacity-90">Total Sellos</p>
          <p className="text-xl font-bold">{customer.stamps}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <p className="text-sm opacity-90">Premios Ganados</p>
          <p className="text-xl font-bold">{Math.floor(customer.stamps / stampsPerReward)}</p>
        </div>
      </div>

      {Math.floor(customer.stamps / stampsPerReward) > 0 && (
        <div className="mt-4 bg-yellow-400 text-red-900 p-3 rounded-lg text-center font-bold">
          🎉 ¡{Math.floor(customer.stamps / stampsPerReward)} Premio(s) Disponible(s)!
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl">
          {/* Header - Ahora manejado por el componente Navigation */}
        </div>

        {/* Contenido principal */}
        <div className="p-6 h-screen overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-6 h-full max-h-[calc(100vh-150px)]">
            {/* Panel izquierdo - Formulario (siempre visible) */}
            <div className="flex flex-col h-full min-h-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex-1 overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-green-600" />
                  {selectedCustomer ? 'Volver a Agregar Cliente' : 'Agregar Nuevo Cliente'}
                </h3>
                <EnhancedCustomerForm
                  customer={null}
                  onSave={async (customerData) => {
                    // El EnhancedCustomerForm ya validó los datos, solo necesitamos procesarlos
                    const code = generateCustomerCode(
                      customerData.idType,
                      customerData.idNumber,
                      customerData.name,
                      customers
                    );
                    
                    const payload = {
                      name: customerData.name,
                      phone: customerData.phone.replace(/\s|-/g, ''),
                      idType: customerData.idType,
                      idNumber: customerData.idNumber,
                      email: customerData.email || '',
                      cedula: `${customerData.idType}-${customerData.idNumber}`,
                      code,
                      stamps: 0,
                      totalPurchases: 0,
                      joinDate: new Date().toISOString(),
                      lastPurchase: null,
                      rewardsEarned: 0,
                      purchaseHistory: [],
                    };

                    // Generar ID único para el nuevo cliente
                    const newCustomerId = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
                    
                    const created = {
                      ...payload,
                      id: newCustomerId,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    };

                    // Actualizar la lista de clientes directamente
                    setCustomers(prev => {
                      const updated = [...prev, created];
                      try { 
                        localStorage.setItem('customers', JSON.stringify(updated)); 
                      } catch (error) {
                        console.error('Error saving to localStorage:', error);
                      }
                      return updated;
                    });

                    setSelectedCustomer(created);
                  }}
                  onCancel={() => {
                    // El EnhancedCustomerForm maneja su propio reset
                  }}
                  isEditing={false}
                />
              </div>
            </div>

            {/* Panel derecho - Lista y Detalles del cliente */}
            <div className="flex flex-col h-full min-h-0 space-y-4">
              {!selectedCustomer ? (
                /* Lista de clientes con scroll independiente */
                <div className="h-full min-h-0">
                  <CustomerList
                    customers={customers}
                    stampsPerReward={stampsPerReward}
                    onCustomerSelect={setSelectedCustomer}
                  />
                </div>
              ) : (
                /* Detalles del cliente seleccionado */
                <div className="h-full overflow-y-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <Fade in={selectedCustomer} timeout={500}>
                    <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <User className="w-8 h-8 text-red-800" />
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">{selectedCustomer?.name}</h2>
                          <p className="text-gray-600">{selectedCustomer?.phone}</p>
                          <p className="text-gray-600 text-sm">
                            {selectedCustomer?.idType} - {selectedCustomer?.idNumber}
                          </p>
                          <p className="text-yellow-600 font-semibold text-sm">Código: {selectedCustomer?.code}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => copyCustomerLink(selectedCustomer.code)}
                          title="Copiar enlace del cliente"
                          size="sm"
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <Copy className="w-5 h-5 mr-2" />
                          Copiar Enlace
                        </Button>
                        <Button
                          variant="icon"
                          onClick={() => deleteCustomer(selectedCustomer.id)}
                          title="Eliminar cliente"
                          size="sm"
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => setSelectedCustomer(null)}
                          title="Agregar nuevo cliente"
                          size="sm"
                          className="text-white bg-green-500 hover:bg-green-600"
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="flex items-center space-x-2">
                          <Award className="w-5 h-5 text-red-800" />
                          <span className="text-sm text-gray-600">Sellos actuales</span>
                        </div>
                        <div className="text-2xl font-bold text-red-800 flex items-center">
                          <span className="inline-block w-8 text-right">
                            {selectedCustomer?.stamps % stampsPerReward}
                          </span>
                          <span> / {stampsPerReward}</span>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2">
                          <Gift className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-gray-600">Premios disponibles</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {Math.floor(selectedCustomer?.stamps / stampsPerReward)}
                        </div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2">
                          <ShoppingBag className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-gray-600">Total compras</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedCustomer?.totalPurchases}
                        </div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-5 h-5 text-yellow-600" />
                          <span className="text-sm text-gray-600">Última compra</span>
                        </div>
                        <div className="text-sm font-semibold text-yellow-600">
                          {selectedCustomer?.lastPurchase || 'Nunca'}
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex space-x-3 mb-6">
                      <div className="flex-1 flex space-x-2">
                        <Button
                          variant="primary"
                          onClick={() => addStamp(selectedCustomer.id)}
                          loading={loading}
                          className="flex-1 py-3"
                        >
                          {loading ? 'Agregando...' : 'Agregar Sello'}
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => removeStamp(selectedCustomer.id)}
                          disabled={selectedCustomer?.stamps <= 0}
                          loading={loading}
                          className="py-3"
                          title="Quitar último sello"
                        >
                          <Minus className="w-5 h-5" />
                        </Button>
                      </div>
                      {Math.floor(selectedCustomer?.stamps / stampsPerReward) > 0 && (
                        <Button
                          variant="success"
                          onClick={() => redeemReward(selectedCustomer.id)}
                          loading={loading}
                          className="flex-1 py-3"
                        >
                          {loading ? 'Canjeando...' : 'Canjear Premio'}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => enviarTarjetaPorWhatsApp(
                          selectedCustomer?.phone || '',
                          selectedCustomer?.name || '',
                          selectedCustomer?.id || '',
                          {
                            sellos: (selectedCustomer?.stamps || 0) % stampsPerReward,
                            stamps: selectedCustomer?.stamps || 0,
                            stampsPerReward: stampsPerReward,
                            purchaseHistory: selectedCustomer?.purchaseHistory || [],
                            customerCode: selectedCustomer?.code,
                            // baseUrl se resuelve automáticamente (env/global/origin)
                          }
                        )}
                        className="flex-1 py-3"
                        title="Enviar tarjeta por WhatsApp"
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Enviar por WhatsApp
                      </Button>
                    </div>

                    {/* Historial de compras */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Historial de Compras</h3>
                      <div
                        ref={historyContainerRef}
                        className="max-h-64 overflow-y-auto space-y-2"
                        style={{
                          // Mejora el rendimiento del scroll
                          willChange: 'transform',
                          WebkitOverflowScrolling: 'touch',
                        }}
                      >
                        {selectedCustomer?.purchaseHistory?.length > 0 ? (
                          selectedCustomer?.purchaseHistory.slice().reverse().map((purchase) => (
                            <div key={purchase.id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                              <div>
                                <div className="font-semibold">Sello #{purchase.stampNumber}</div>
                                <div className="text-sm text-gray-600">{purchase.date}</div>
                              </div>
                              {purchase.amount > 0 && (
                                <div className="text-green-600 font-semibold">
                                  ${purchase.amount.toLocaleString()}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p className="text-gray-500">No hay compras registradas</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Historial de premios canjeados */}
                    {selectedCustomer?.redeemedRewards?.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Historial de Premios Canjeados</h3>
                        <div className="max-h-64 overflow-y-auto space-y-2">
                          {selectedCustomer.redeemedRewards.slice().reverse().map((reward) => (
                            <div key={reward.id} className="bg-green-50 p-3 rounded-lg flex justify-between items-center">
                              <div>
                                <div className="font-semibold text-green-800">{reward.rewardType}</div>
                                <div className="text-sm text-gray-600">{reward.date}</div>
                              </div>
                              <div className="text-green-600 font-semibold">
                                {reward.stampsUsed} sellos
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    </div>
                  </Fade>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vista del cliente */}
      {currentView === 'client' && clientViewCustomer && (
        <div className="fixed inset-0 bg-gradient-to-br from-red-50 to-yellow-50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-gradient-to-br from-red-800 to-yellow-600 rounded-2xl shadow-xl p-8 text-center text-white border-4 border-yellow-500">
              {/* Encabezado */}
              <div className="mb-8">
                <h1 className="text-5xl font-extrabold text-white mb-3 tracking-tight">ACRILCARD</h1>
                <h2 className="text-2xl font-semibold text-black">{clientViewCustomer.name}</h2>
              </div>

              {/* Contador de sellos */}
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-5 mb-8 border border-yellow-400 border-opacity-30">
                <p className="text-yellow-200 text-lg font-medium mb-1">Sellos Acumulados</p>
                <p className="text-5xl font-bold text-white">{clientViewCustomer.stamps}</p>
              </div>

              {/* Barra de progreso de sellos */}
              <div className="mb-8">
                <div className="flex justify-between text-yellow-100 text-sm mb-2">
                  <span>Progreso</span>
                  <span className="font-semibold">{clientViewCustomer.stamps % stampsPerReward} / {stampsPerReward}</span>
                </div>
                <div className="w-full bg-black bg-opacity-20 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(clientViewCustomer.stamps % stampsPerReward / stampsPerReward) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Sellos visuales */}
              <div className="mb-8">
                <p className="text-yellow-200 text-sm font-medium mb-3">Tus sellos</p>
                <div className="grid grid-cols-5 gap-3">
                  {[...Array(stampsPerReward)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-12 rounded-lg flex items-center justify-center text-2xl transition-all duration-300 ${i < (clientViewCustomer.stamps % stampsPerReward) ? 'bg-yellow-400 text-yellow-800 transform scale-105' : 'bg-white bg-opacity-10 border-2 border-dashed border-yellow-400 border-opacity-30'}`}
                    >
                      {i < (clientViewCustomer.stamps % stampsPerReward) ? '✪' : '○'}
                    </div>
                  ))}
                </div>
                {Math.floor(clientViewCustomer.stamps / stampsPerReward) > 0 && (
                  <div className="mt-6 flex items-center justify-center space-x-4 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <Gift className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-lg text-yellow-800">¡Felicidades!</p>
                      <p className="font-medium text-yellow-700">Tienes {Math.floor(clientViewCustomer.stamps / stampsPerReward)} premio(s) disponible(s)</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: seleccionar prefijo para clientes ambiguos */}
      {showPrefixFixModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowPrefixFixModal(false)}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Completar prefijo de cédula/RIF</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowPrefixFixModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Se detectaron clientes sin prefijo. Por defecto se propone "V". Puedes cambiar a "E" o "J" antes de guardar.</p>

            <div className="max-h-80 overflow-y-auto divide-y">
              {prefixCandidates.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium text-gray-800 truncate">{c.name}</div>
                    <div className="text-sm text-gray-500">Número:
                      <input
                        type="text"
                        value={c.idNumber || ''}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^0-9]/g, '');
                          setPrefixCandidates(prev => prev.map(p => p.id === c.id ? { ...p, idNumber: v } : p));
                        }}
                        className="ml-2 w-40 px-2 py-1 border rounded"
                        placeholder="Solo números"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {['V','E','J'].map(t => (
                      <label key={t} className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer border ${c.idType===t ? 'border-red-600 text-red-700' : 'border-gray-300 text-gray-700'}`}>
                        <input
                          type="radio"
                          name={`prefix-${c.id}`}
                          checked={c.idType === t}
                          onChange={() => setPrefixCandidates(prev => prev.map(p => p.id === c.id ? { ...p, idType: t } : p))}
                          className="hidden"
                        />
                        {t}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowPrefixFixModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={onConfirmPrefixFixes}>
                Guardar cambios
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoyaltyCardSystem;
