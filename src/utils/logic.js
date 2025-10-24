// Pure business logic helpers for customer operations

export function digitsOnly(value) {
  return String(value ?? '').replace(/[^0-9]/g, '');
}

export function normalizeStr(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

// Generate a unique customer code based on name and idNumber
// Format: 3 first letters of name (letters only, uppercased) + last 4 digits of idNumber
// If duplicate, append -<n>
export function generateCustomerCode(idType, idNumber, name, existingCustomers = []) {
  if (!name || !idNumber) return 'ERROR-CODE';
  try {
    const namePrefix = String(name)
      .trim()
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .substring(0, 3);
    const numericId = digitsOnly(idNumber);
    const idSuffix = numericId.slice(-4);
    if (!idSuffix) return 'ERROR-CODE';

    let code = `${namePrefix}${idSuffix}`;
    let counter = 1;
    const exists = (c) => (c?.code ?? '') === code;
    while (existingCustomers.some(exists)) {
      code = `${namePrefix}${idSuffix}-${counter}`;
      counter += 1;
      if (counter > 100) break; // safety
    }
    return code;
  } catch {
    return 'ERROR-CODE';
  }
}

export function getProgressPercentage(stamps, stampsPerReward) {
  const per = Math.max(1, Number(stampsPerReward) || 1);
  const s = Math.max(0, Number(stamps) || 0);
  return (s % per) * (100 / per);
}
