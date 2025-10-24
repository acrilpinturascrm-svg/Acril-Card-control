// Local customer store implementation
let customers = [];
let nextId = 1;

// Generate a unique ID for new customers
function generateId() {
  return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
}

// Map customer data to app format
export function mapRecordToCustomer(record) {
  return {
    id: record.id || generateId(),
    name: record.name,
    phone: record.phone,
    idType: record.idType,
    idNumber: record.idNumber,
    cedula: record.cedula,
    code: record.code,
    stamps: record.stamps || 0,
    totalPurchases: record.totalPurchases || 0,
    rewardsEarned: record.rewardsEarned || 0,
    purchaseHistory: record.purchaseHistory || [],
    joinDate: record.joinDate || new Date().toISOString(),
    lastPurchase: record.lastPurchase || null,
    createdAt: record.createdAt || new Date().toISOString(),
    updatedAt: record.updatedAt || new Date().toISOString(),
  };
}

// Load customers from localStorage
function loadCustomers() {
  const stored = localStorage.getItem('customers');
  if (stored) {
    customers = JSON.parse(stored);
    nextId = Math.max(...customers.map(c => parseInt(c.id.split('-')[0]) || 0), 0) + 1;
  }
  return [...customers];
}

// Save customers to localStorage
function saveCustomers() {
  localStorage.setItem('customers', JSON.stringify(customers));
}

export async function fetchAllCustomers() {
  return loadCustomers();
}

export async function createCustomer(payload) {
  const newCustomer = {
    id: generateId(),
    name: payload.name,
    phone: payload.phone,
    idType: payload.idType,
    idNumber: payload.idNumber,
    cedula: payload.cedula,
    code: payload.code,
    stamps: 0,
    totalPurchases: 0,
    rewardsEarned: 0,
    purchaseHistory: [],
    joinDate: new Date().toISOString(),
    lastPurchase: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  customers.push(newCustomer);
  saveCustomers();
  return newCustomer;
}

export async function updateCustomerHistory(customer) {
  const index = customers.findIndex(c => c.id === customer.id);
  if (index !== -1) {
    customers[index] = {
      ...customers[index],
      ...customer,
      updatedAt: new Date().toISOString()
    };
    saveCustomers();
    return customers[index];
  }
  throw new Error('Customer not found');
}

export async function deleteCustomerRecord(customerId) {
  const index = customers.findIndex(c => c.id === customerId);
  if (index !== -1) {
    customers.splice(index, 1);
    saveCustomers();
    return true;
  }
  return false;
}
