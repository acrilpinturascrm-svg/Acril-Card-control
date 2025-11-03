/**
 * Servicio de Clientes con Supabase
 * 
 * Este servicio maneja todas las operaciones CRUD de clientes
 * utilizando Supabase como backend.
 */

import { supabase, handleSupabaseError, isSupabaseConfigured } from './supabaseClient';

const CUSTOMERS_TABLE = 'customers';
const STAMP_HISTORY_TABLE = 'stamp_history';

/**
 * Mapear datos de Supabase (snake_case) a formato de aplicación (camelCase)
 */
const mapSupabaseToApp = (supabaseData) => {
  if (!supabaseData) return null;
  
  return {
    id: supabaseData.id,
    name: supabaseData.name,
    phone: supabaseData.phone,
    idType: supabaseData.id_type || 'V',
    idNumber: supabaseData.id_number || '',
    cedula: supabaseData.cedula || null,
    document: supabaseData.document || supabaseData.cedula || null,
    code: supabaseData.code || '',
    stamps: supabaseData.stamps || 0,
    rewards: supabaseData.rewards || 0,
    totalPurchases: supabaseData.total_purchases || 0,
    rewardsEarned: supabaseData.rewards_earned || 0,
    joinDate: supabaseData.join_date || null,
    lastPurchase: supabaseData.last_purchase || null,
    purchaseHistory: supabaseData.purchase_history || [],
    history: supabaseData.history || [],
    createdAt: supabaseData.created_at,
    updatedAt: supabaseData.updated_at
  };
};

/**
 * Mapear datos de aplicación (camelCase) a formato de Supabase (snake_case)
 */
const mapAppToSupabase = (appData) => {
  if (!appData) return {};
  
  const supabaseData = {};
  
  // Mapear solo los campos que están presentes en appData
  if (appData.name !== undefined) supabaseData.name = appData.name;
  if (appData.phone !== undefined) supabaseData.phone = appData.phone;
  if (appData.idType !== undefined) supabaseData.id_type = appData.idType;
  if (appData.idNumber !== undefined) supabaseData.id_number = appData.idNumber;
  if (appData.cedula !== undefined) supabaseData.cedula = appData.cedula;
  if (appData.document !== undefined) supabaseData.document = appData.document;
  if (appData.code !== undefined) supabaseData.code = appData.code;
  if (appData.stamps !== undefined) supabaseData.stamps = appData.stamps;
  if (appData.rewards !== undefined) supabaseData.rewards = appData.rewards;
  if (appData.totalPurchases !== undefined) supabaseData.total_purchases = appData.totalPurchases;
  if (appData.rewardsEarned !== undefined) supabaseData.rewards_earned = appData.rewardsEarned;
  if (appData.joinDate !== undefined) supabaseData.join_date = appData.joinDate;
  if (appData.lastPurchase !== undefined) supabaseData.last_purchase = appData.lastPurchase;
  if (appData.purchaseHistory !== undefined) supabaseData.purchase_history = appData.purchaseHistory;
  if (appData.history !== undefined) supabaseData.history = appData.history;
  if (appData.redeemedRewards !== undefined) supabaseData.redeemed_rewards = appData.redeemedRewards;
  
  return supabaseData;
};

/**
 * Obtener todos los clientes
 * @returns {Promise<Array>} Lista de clientes
 */
export const getAllCustomers = async () => {
  try {
    if (!isSupabaseConfigured()) {
      // Fallback a localStorage si Supabase no está configurado
      const localData = localStorage.getItem('acrilcard_customers');
      return localData ? JSON.parse(localData) : [];
    }

    const { data, error } = await supabase
      .from(CUSTOMERS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Mapear datos de Supabase a formato de aplicación
    return (data || []).map(mapSupabaseToApp);
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    throw new Error(handleSupabaseError(error));
  }
};

/**
 * Obtener un cliente por ID
 * @param {string} id - ID del cliente
 * @returns {Promise<Object>} Cliente encontrado
 */
export const getCustomerById = async (id) => {
  try {
    if (!isSupabaseConfigured()) {
      const localData = localStorage.getItem('acrilcard_customers');
      const customers = localData ? JSON.parse(localData) : [];
      return customers.find(c => c.id === id) || null;
    }

    const { data, error } = await supabase
      .from(CUSTOMERS_TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return mapSupabaseToApp(data);
  } catch (error) {
    console.error('Error obteniendo cliente:', error);
    throw new Error(handleSupabaseError(error));
  }
};

/**
 * Obtener un cliente por código
 * @param {string} code - Código del cliente
 * @returns {Promise<Object|null>} Cliente encontrado o null
 */
export const getCustomerByCode = async (code) => {
  try {
    if (!isSupabaseConfigured()) {
      const localData = localStorage.getItem('acrilcard_customers');
      const customers = localData ? JSON.parse(localData) : [];
      return customers.find(c => c.code === code) || null;
    }

    const { data, error } = await supabase
      .from(CUSTOMERS_TABLE)
      .select('*')
      .eq('code', code)
      .single();

    if (error) {
      // Si no se encuentra (PGRST116), retornar null en lugar de lanzar error
      if (error.code === 'PGRST116') {
        console.log(`Cliente con código ${code} no encontrado en Supabase`);
        return null;
      }
      throw error;
    }
    
    return mapSupabaseToApp(data);
  } catch (error) {
    console.error('Error obteniendo cliente por código:', error);
    return null; // Retornar null en caso de error
  }
};

/**
 * Buscar clientes por teléfono
 * @param {string} phone - Número de teléfono
 * @returns {Promise<Array>} Clientes encontrados
 */
export const searchCustomersByPhone = async (phone) => {
  try {
    if (!isSupabaseConfigured()) {
      const localData = localStorage.getItem('acrilcard_customers');
      const customers = localData ? JSON.parse(localData) : [];
      return customers.filter(c => c.phone && c.phone.includes(phone));
    }

    const { data, error } = await supabase
      .from(CUSTOMERS_TABLE)
      .select('*')
      .ilike('phone', `%${phone}%`);

    if (error) throw error;
    return (data || []).map(mapSupabaseToApp);
  } catch (error) {
    console.error('Error buscando clientes:', error);
    throw new Error(handleSupabaseError(error));
  }
};

/**
 * Crear un nuevo cliente
 * @param {Object} customerData - Datos del cliente
 * @returns {Promise<Object>} Cliente creado
 */
export const createCustomer = async (customerData) => {
  try {
    if (!isSupabaseConfigured()) {
      // Fallback a localStorage
      const localData = localStorage.getItem('acrilcard_customers');
      const customers = localData ? JSON.parse(localData) : [];
      const newCustomer = {
        ...customerData,
        id: `local-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      customers.push(newCustomer);
      localStorage.setItem('acrilcard_customers', JSON.stringify(customers));
      return newCustomer;
    }

    // Preparar datos para Supabase con todos los campos
    const supabaseData = {
      name: customerData.name,
      phone: customerData.phone,
      id_type: customerData.idType || 'V',
      id_number: customerData.idNumber || null,
      cedula: customerData.cedula || null,
      document: customerData.document || customerData.cedula || null,
      code: customerData.code || null,
      stamps: parseInt(customerData.stamps) || 0,
      rewards: parseInt(customerData.rewards) || 0,
      total_purchases: parseInt(customerData.totalPurchases) || 0,
      rewards_earned: parseInt(customerData.rewardsEarned) || 0,
      join_date: customerData.joinDate || null,
      last_purchase: customerData.lastPurchase || null,
      purchase_history: customerData.purchaseHistory || [],
      history: customerData.history || []
    };

    console.log('🔍 DEBUG Datos a enviar a Supabase:', supabaseData);

    const { data, error } = await supabase
      .from(CUSTOMERS_TABLE)
      .insert([supabaseData])
      .select()
      .single();

    if (error) throw error;
    return mapSupabaseToApp(data);
  } catch (error) {
    console.error('Error creando cliente:', error);
    throw new Error(handleSupabaseError(error));
  }
};

/**
 * Actualizar un cliente
 * @param {string} id - ID del cliente
 * @param {Object} updates - Datos a actualizar
 * @returns {Promise<Object>} Cliente actualizado
 */
export const updateCustomer = async (id, updates) => {
  try {
    if (!isSupabaseConfigured()) {
      // Fallback a localStorage
      const localData = localStorage.getItem('acrilcard_customers');
      const customers = localData ? JSON.parse(localData) : [];
      const index = customers.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Cliente no encontrado');
      customers[index] = {
        ...customers[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      localStorage.setItem('acrilcard_customers', JSON.stringify(customers));
      return customers[index];
    }

    // ✅ Mapear datos de camelCase a snake_case antes de enviar a Supabase
    const supabaseUpdates = mapAppToSupabase(updates);
    
    console.log('🔍 DEBUG updateCustomer - Datos a actualizar:', {
      id,
      updatesRecibidos: updates,
      supabaseUpdates
    });

    const { data, error } = await supabase
      .from(CUSTOMERS_TABLE)
      .update({
        ...supabaseUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ Cliente actualizado en Supabase:', data.id);
    return mapSupabaseToApp(data);
  } catch (error) {
    console.error('Error actualizando cliente:', error);
    throw new Error(handleSupabaseError(error));
  }
};

/**
 * Eliminar un cliente
 * @param {string} id - ID del cliente
 * @returns {Promise<boolean>} True si se eliminó correctamente
 */
export const deleteCustomer = async (id) => {
  try {
    if (!isSupabaseConfigured()) {
      // Fallback a localStorage
      const localData = localStorage.getItem('acrilcard_customers');
      const customers = localData ? JSON.parse(localData) : [];
      const filtered = customers.filter(c => c.id !== id);
      localStorage.setItem('acrilcard_customers', JSON.stringify(filtered));
      return true;
    }

    const { error } = await supabase
      .from(CUSTOMERS_TABLE)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error eliminando cliente:', error);
    throw new Error(handleSupabaseError(error));
  }
};

/**
 * Agregar sellos a un cliente
 * @param {string} customerId - ID del cliente
 * @param {number} stampsToAdd - Cantidad de sellos a agregar
 * @returns {Promise<Object>} Cliente actualizado
 */
export const addStamps = async (customerId, stampsToAdd) => {
  try {
    const customer = await getCustomerById(customerId);
    if (!customer) throw new Error('Cliente no encontrado');

    const newStamps = (customer.stamps || 0) + stampsToAdd;
    const updatedCustomer = await updateCustomer(customerId, { stamps: newStamps });

    // Registrar en historial si Supabase está configurado
    if (isSupabaseConfigured()) {
      await supabase
        .from(STAMP_HISTORY_TABLE)
        .insert([{
          customer_id: customerId,
          stamps_added: stampsToAdd
        }]);
    }

    return updatedCustomer;
  } catch (error) {
    console.error('Error agregando sellos:', error);
    throw new Error(handleSupabaseError(error));
  }
};

/**
 * Canjear recompensa (resetear sellos y aumentar contador de recompensas)
 * @param {string} customerId - ID del cliente
 * @param {number} stampsRequired - Sellos requeridos para la recompensa
 * @returns {Promise<Object>} Cliente actualizado
 */
export const redeemReward = async (customerId, stampsRequired) => {
  try {
    const customer = await getCustomerById(customerId);
    if (!customer) throw new Error('Cliente no encontrado');
    if (customer.stamps < stampsRequired) {
      throw new Error('Sellos insuficientes para canjear recompensa');
    }

    const updatedCustomer = await updateCustomer(customerId, {
      stamps: customer.stamps - stampsRequired,
      rewards: (customer.rewards || 0) + 1
    });

    return updatedCustomer;
  } catch (error) {
    console.error('Error canjeando recompensa:', error);
    throw new Error(handleSupabaseError(error));
  }
};

/**
 * Migrar datos de localStorage a Supabase
 * @returns {Promise<Object>} Resultado de la migración
 */
export const migrateFromLocalStorage = async () => {
  try {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase no está configurado');
    }

    const localData = localStorage.getItem('acrilcard_customers');
    if (!localData) {
      return { success: true, migrated: 0, message: 'No hay datos para migrar' };
    }

    const customers = JSON.parse(localData);
    if (customers.length === 0) {
      return { success: true, migrated: 0, message: 'No hay clientes para migrar' };
    }

    // Insertar clientes en Supabase
    const { data, error } = await supabase
      .from(CUSTOMERS_TABLE)
      .insert(customers.map(c => ({
        name: c.name,
        phone: c.phone,
        document: c.document || null,
        stamps: c.stamps || 0,
        rewards: c.rewards || 0
      })))
      .select();

    if (error) throw error;

    return {
      success: true,
      migrated: data.length,
      message: `${data.length} clientes migrados exitosamente`
    };
  } catch (error) {
    console.error('Error migrando datos:', error);
    throw new Error(handleSupabaseError(error));
  }
};

export default {
  getAllCustomers,
  getCustomerById,
  searchCustomersByPhone,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addStamps,
  redeemReward,
  migrateFromLocalStorage
};
