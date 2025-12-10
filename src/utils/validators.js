/**
 * Validation utility functions
 */

const validateTenantData = (data) => {
  const errors = [];

  if (!data.name || data.name.trim() === '') {
    errors.push('Tenant name is required');
  }

  if (data.plan && !['FREE', 'PRO'].includes(data.plan)) {
    errors.push('Plan must be either FREE or PRO');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateMaterialData = (data) => {
  const errors = [];

  if (!data.name || data.name.trim() === '') {
    errors.push('Material name is required');
  }

  if (!data.unit || data.unit.trim() === '') {
    errors.push('Material unit is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateTransactionData = (data) => {
  const errors = [];

  if (!data.type) {
    errors.push('Transaction type is required');
  } else if (!['IN', 'OUT'].includes(data.type)) {
    errors.push('Transaction type must be either IN or OUT');
  }

  if (!data.quantity) {
    errors.push('Quantity is required');
  } else if (typeof data.quantity !== 'number' || data.quantity <= 0) {
    errors.push('Quantity must be a positive number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateTenantData,
  validateMaterialData,
  validateTransactionData
};
