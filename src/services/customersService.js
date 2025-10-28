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
    return data || [];
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
    return data;
  } catch (error) {
    console.error('Error obteniendo cliente:', error);
    throw new Error(handleSupabaseError(error));
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
    return data || [];
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

    const { data, error } = await supabase
      .from(CUSTOMERS_TABLE)
      .insert([{
        name: customerData.name,
        phone: customerData.phone,
        document: customerData.document || null,
        stamps: customerData.stamps || 0,
        rewards: customerData.rewards || 0
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
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

    const { data, error } = await supabase
      .from(CUSTOMERS_TABLE)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
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
