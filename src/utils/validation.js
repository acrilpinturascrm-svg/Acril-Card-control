/**
 * Sistema de validación robusta para ACRILCARD
 * Implementa validaciones completas para todos los datos críticos
 */

// Expresiones regulares para validación
const VALIDATION_PATTERNS = {
  // Teléfonos venezolanos e internacionales
  phone: {
    venezuela: /^(0414|0424|0412|0416|0426|0212|0251|0261|0271|0281|0291|0241|0243|0245|0247|0249|0253|0255|0257|0259|0267|0269|0273|0275|0277|0279|0283|0285|0287|0289|0293|0295|0297|0299)\d{7}$/,
    international: /^\+?[1-9]\d{1,14}$/,
    mobile: /^(04(12|14|16|24|26))\d{7}$/
  },
  
  // Documentos de identidad
  cedula: {
    venezuelan: /^[VEJ]-?\d{6,12}$/i,
    numbers: /^\d{6,12}$/
  },
  
  // Nombres y texto
  name: {
    basic: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,50}$/,
    extended: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-\.\']{2,100}$/
  },
  
  // Códigos de cliente
  customerCode: /^[A-Z]{2,4}\d{3,8}$/,
  
  // Email (opcional)
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// Mensajes de error personalizados
const ERROR_MESSAGES = {
  required: 'Este campo es obligatorio',
  invalid: 'El formato ingresado no es válido',
  tooShort: 'Debe tener al menos {min} caracteres',
  tooLong: 'No puede tener más de {max} caracteres',
  invalidPhone: 'Ingrese un número de teléfono válido (ej: 04141234567)',
  invalidCedula: 'Ingrese una cédula válida (ej: V-12345678)',
  invalidName: 'El nombre solo puede contener letras y espacios',
  duplicateCustomer: 'Ya existe un cliente con este documento',
  duplicateCode: 'Ya existe un cliente con este código',
  invalidStamps: 'Los sellos deben ser un número entre 0 y 1000',
  invalidDate: 'Fecha inválida',
  futureDate: 'La fecha no puede ser futura'
};

/**
 * Clase principal de validación
 */
export class DataValidator {
  constructor() {
    this.errors = {};
    this.warnings = {};
  }

  /**
   * Limpiar errores y warnings
   */
  clear() {
    this.errors = {};
    this.warnings = {};
  }

  /**
   * Verificar si hay errores
   */
  hasErrors() {
    return Object.keys(this.errors).length > 0;
  }

  /**
   * Verificar si hay warnings
   */
  hasWarnings() {
    return Object.keys(this.warnings).length > 0;
  }

  /**
   * Agregar error
   */
  addError(field, message) {
    if (!this.errors[field]) {
      this.errors[field] = [];
    }
    this.errors[field].push(message);
  }

  /**
   * Agregar warning
   */
  addWarning(field, message) {
    if (!this.warnings[field]) {
      this.warnings[field] = [];
    }
    this.warnings[field].push(message);
  }

  /**
   * Validar campo requerido
   */
  validateRequired(value, fieldName) {
    if (!value || (typeof value === 'string' && !value.trim())) {
      this.addError(fieldName, ERROR_MESSAGES.required);
      return false;
    }
    return true;
  }

  /**
   * Validar longitud de texto
   */
  validateLength(value, fieldName, min = 0, max = Infinity) {
    if (!value) return true; // Si está vacío, lo maneja validateRequired
    
    const length = value.toString().trim().length;
    
    if (length < min) {
      this.addError(fieldName, ERROR_MESSAGES.tooShort.replace('{min}', min));
      return false;
    }
    
    if (length > max) {
      this.addError(fieldName, ERROR_MESSAGES.tooLong.replace('{max}', max));
      return false;
    }
    
    return true;
  }

  /**
   * Validar nombre completo
   */
  validateName(name, fieldName = 'name') {
    if (!this.validateRequired(name, fieldName)) return false;
    if (!this.validateLength(name, fieldName, 2, 100)) return false;

    const trimmedName = name.trim();
    
    // Verificar caracteres válidos
    if (!VALIDATION_PATTERNS.name.extended.test(trimmedName)) {
      this.addError(fieldName, ERROR_MESSAGES.invalidName);
      return false;
    }

    // Verificar que no sean solo espacios o caracteres especiales
    if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/.test(trimmedName)) {
      this.addError(fieldName, 'El nombre debe contener al menos una letra');
      return false;
    }

    // Warning para nombres muy cortos
    if (trimmedName.length < 3) {
      this.addWarning(fieldName, 'El nombre parece muy corto');
    }

    // Warning para nombres sin apellido
    if (!trimmedName.includes(' ')) {
      this.addWarning(fieldName, 'Considere incluir el apellido');
    }

    return true;
  }

  /**
   * Validar número de teléfono
   */
  validatePhone(phone, fieldName = 'phone') {
    if (!this.validateRequired(phone, fieldName)) return false;

    // Limpiar el teléfono de espacios y caracteres especiales
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Verificar longitud básica
    if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      this.addError(fieldName, ERROR_MESSAGES.invalidPhone);
      return false;
    }

    // Verificar que solo contenga números y +
    if (!/^[\+]?[\d]+$/.test(cleanPhone)) {
      this.addError(fieldName, 'El teléfono solo puede contener números');
      return false;
    }

    // Validaciones específicas para Venezuela
    if (cleanPhone.startsWith('0') || cleanPhone.startsWith('+58')) {
      const venezuelanPhone = cleanPhone.replace(/^\+58/, '0');
      
      if (!VALIDATION_PATTERNS.phone.venezuela.test(venezuelanPhone)) {
        this.addError(fieldName, 'Número de teléfono venezolano inválido');
        return false;
      }
    } else {
      // Validación internacional básica
      if (!VALIDATION_PATTERNS.phone.international.test(cleanPhone)) {
        this.addError(fieldName, ERROR_MESSAGES.invalidPhone);
        return false;
      }
    }

    return true;
  }

  /**
   * Validar cédula de identidad
   */
  validateCedula(idType, idNumber, fieldName = 'cedula') {
    if (!this.validateRequired(idType, `${fieldName}Type`)) return false;
    if (!this.validateRequired(idNumber, `${fieldName}Number`)) return false;

    // Validar tipo de documento
    const validTypes = ['V', 'E', 'J', 'P', 'G'];
    if (!validTypes.includes(idType.toUpperCase())) {
      this.addError(`${fieldName}Type`, 'Tipo de documento inválido (V/E/J/P/G)');
      return false;
    }

    // Limpiar número de documento
    const cleanNumber = idNumber.toString().replace(/\D/g, '');
    
    // Validar longitud del número
    if (cleanNumber.length < 6 || cleanNumber.length > 12) {
      this.addError(`${fieldName}Number`, 'El número debe tener entre 6 y 12 dígitos');
      return false;
    }

    // Validaciones específicas por tipo
    if (idType.toUpperCase() === 'V' || idType.toUpperCase() === 'E') {
      // Cédulas venezolanas y de extranjeros
      if (cleanNumber.length < 7 || cleanNumber.length > 9) {
        this.addWarning(`${fieldName}Number`, 'Longitud inusual para cédula venezolana');
      }
    }

    // Verificar números secuenciales obvios
    if (/^(\d)\1+$/.test(cleanNumber)) {
      this.addWarning(`${fieldName}Number`, 'Número de documento sospechoso (todos los dígitos iguales)');
    }

    return true;
  }

  /**
   * Validar código de cliente
   */
  validateCustomerCode(code, fieldName = 'code') {
    if (!this.validateRequired(code, fieldName)) return false;

    const cleanCode = code.toString().trim().toUpperCase();
    
    if (!VALIDATION_PATTERNS.customerCode.test(cleanCode)) {
      this.addError(fieldName, 'Código inválido (formato: ABC1234)');
      return false;
    }

    return true;
  }

  /**
   * Validar sellos
   */
  validateStamps(stamps, fieldName = 'stamps') {
    const numStamps = parseInt(stamps);
    
    if (isNaN(numStamps)) {
      this.addError(fieldName, 'Los sellos deben ser un número');
      return false;
    }

    if (numStamps < 0) {
      this.addError(fieldName, 'Los sellos no pueden ser negativos');
      return false;
    }

    if (numStamps > 1000) {
      this.addError(fieldName, 'Número de sellos excesivo (máximo 1000)');
      return false;
    }

    // Warning para números altos
    if (numStamps > 100) {
      this.addWarning(fieldName, 'Número de sellos muy alto, verifique');
    }

    return true;
  }

  /**
   * Validar fecha
   */
  validateDate(date, fieldName = 'date', allowFuture = false) {
    if (!date) return true; // Fecha opcional

    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      this.addError(fieldName, ERROR_MESSAGES.invalidDate);
      return false;
    }

    if (!allowFuture && dateObj > new Date()) {
      this.addError(fieldName, ERROR_MESSAGES.futureDate);
      return false;
    }

    // Warning para fechas muy antiguas (más de 10 años)
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    
    if (dateObj < tenYearsAgo) {
      this.addWarning(fieldName, 'Fecha muy antigua, verifique');
    }

    return true;
  }

  /**
   * Validar email (opcional)
   */
  validateEmail(email, fieldName = 'email') {
    if (!email || !email.trim()) return true; // Email opcional

    if (!VALIDATION_PATTERNS.email.test(email.trim())) {
      this.addError(fieldName, 'Email inválido');
      return false;
    }

    return true;
  }

  /**
   * Validar cliente completo
   */
  validateCustomer(customer, existingCustomers = []) {
    this.clear();

    const {
      name,
      phone,
      idType,
      idNumber,
      code,
      stamps = 0,
      email,
      joinDate,
      lastPurchase
    } = customer;

    // Validaciones básicas
    this.validateName(name);
    this.validatePhone(phone);
    this.validateCedula(idType, idNumber);
    this.validateStamps(stamps);
    this.validateEmail(email);
    this.validateDate(joinDate, 'joinDate');
    this.validateDate(lastPurchase, 'lastPurchase');

    // Validar código si se proporciona
    if (code) {
      this.validateCustomerCode(code);
    }

    // Verificar duplicados
    if (existingCustomers.length > 0) {
      this.validateUniqueness(customer, existingCustomers);
    }

    return !this.hasErrors();
  }

  /**
   * Validar unicidad del cliente
   */
  validateUniqueness(customer, existingCustomers) {
    const { idType, idNumber, code, phone } = customer;
    
    // Verificar documento duplicado
    const duplicateDoc = existingCustomers.find(existing => 
      existing.id !== customer.id && 
      existing.idType === idType && 
      existing.idNumber === idNumber
    );
    
    if (duplicateDoc) {
      this.addError('cedula', ERROR_MESSAGES.duplicateCustomer);
    }

    // Verificar código duplicado
    if (code) {
      const duplicateCode = existingCustomers.find(existing => 
        existing.id !== customer.id && 
        existing.code === code
      );
      
      if (duplicateCode) {
        this.addError('code', ERROR_MESSAGES.duplicateCode);
      }
    }

    // Warning para teléfono duplicado (no error, puede ser familia)
    const duplicatePhone = existingCustomers.find(existing => 
      existing.id !== customer.id && 
      existing.phone === phone
    );
    
    if (duplicatePhone) {
      this.addWarning('phone', 'Este teléfono ya está registrado con otro cliente');
    }
  }

  /**
   * Validar datos de importación masiva
   */
  validateBulkImport(customers) {
    const results = {
      valid: [],
      invalid: [],
      warnings: []
    };

    customers.forEach((customer, index) => {
      const validator = new DataValidator();
      const isValid = validator.validateCustomer(customer, customers);
      
      if (isValid) {
        results.valid.push({
          index,
          customer,
          warnings: validator.warnings
        });
        
        if (validator.hasWarnings()) {
          results.warnings.push({
            index,
            customer,
            warnings: validator.warnings
          });
        }
      } else {
        results.invalid.push({
          index,
          customer,
          errors: validator.errors,
          warnings: validator.warnings
        });
      }
    });

    return results;
  }

  /**
   * Obtener resumen de errores
   */
  getErrorSummary() {
    const errorCount = Object.keys(this.errors).length;
    const warningCount = Object.keys(this.warnings).length;
    
    return {
      hasErrors: errorCount > 0,
      hasWarnings: warningCount > 0,
      errorCount,
      warningCount,
      errors: this.errors,
      warnings: this.warnings
    };
  }
}

// Instancia singleton para uso global
export const validator = new DataValidator();

// Funciones de utilidad para validaciones rápidas
export const validateQuick = {
  name: (name) => {
    const v = new DataValidator();
    v.validateName(name);
    return !v.hasErrors();
  },
  
  phone: (phone) => {
    const v = new DataValidator();
    v.validatePhone(phone);
    return !v.hasErrors();
  },
  
  cedula: (idType, idNumber) => {
    const v = new DataValidator();
    v.validateCedula(idType, idNumber);
    return !v.hasErrors();
  },
  
  customer: (customer, existingCustomers = []) => {
    const v = new DataValidator();
    return v.validateCustomer(customer, existingCustomers);
  }
};

// Funciones de sanitización
export const sanitize = {
  name: (name) => {
    if (!name) return '';
    return name
      .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-\.\']/g, '') // Solo caracteres válidos (letras, espacios, guiones, puntos, apostrofes)
      .replace(/\s+/g, ' ') // Múltiples espacios a uno solo
      .trim() // Eliminar espacios al inicio y final solo al guardar
      .substring(0, 100); // Limitar longitud
  },
  
  phone: (phone) => {
    if (!phone) return '';
    return phone.replace(/[\s\-\(\)]/g, '').substring(0, 15);
  },
  
  idNumber: (idNumber) => {
    if (!idNumber) return '';
    return idNumber.toString().replace(/\D/g, '').substring(0, 12);
  },
  
  code: (code) => {
    if (!code) return '';
    return code.toString().trim().toUpperCase().substring(0, 20);
  }
};

export default DataValidator;
