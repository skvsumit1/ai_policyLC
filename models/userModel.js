const { v4: uuidv4 } = require('uuid');

const VALID_ROLES = ['policyholder', 'admin', 'underwriter'];

function createUser({ name, email, password, role = 'policyholder' }) {
  return {
    id: `u-${uuidv4().slice(0, 8)}`,
    name,
    email,
    password,
    role,
    createdAt: new Date().toISOString()
  };
}

function validateUser(data) {
  const errors = [];
  if (!data.name) errors.push('Name is required');
  if (!data.email) errors.push('Email is required');
  if (!data.password) errors.push('Password is required');
  if (data.role && !VALID_ROLES.includes(data.role)) {
    errors.push(`Role must be one of: ${VALID_ROLES.join(', ')}`);
  }
  return errors;
}

module.exports = { createUser, validateUser, VALID_ROLES };
