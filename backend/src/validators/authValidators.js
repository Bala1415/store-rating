/**
 * Authentication and User Validation Module
 * Enforces assignment constraints for name, email, password, address, and roles.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 8-16 characters, at least 1 uppercase letter, at least 1 special character
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;
const VALID_ROLES = ['ADMIN', 'USER', 'STORE_OWNER'];

function validateName(name, fieldName = 'Name') {
  if (typeof name !== 'string') {
    return `${fieldName} is required and must be text.`;
  }
  const trimmed = name.trim();
  if (trimmed.length < 20 || trimmed.length > 60) {
    return `${fieldName} must be between 20 and 60 characters in length. Current length: ${trimmed.length}.`;
  }
  return null;
}

function validateEmail(email) {
  if (typeof email !== 'string') {
    return 'Email address is required.';
  }
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Email address cannot be empty.';
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Invalid email address format.';
  }
  return null;
}

function validatePassword(password) {
  if (typeof password !== 'string') {
    return 'Password is required.';
  }
  if (password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'Password must contain at least one special character.';
  }
  return null;
}

function validateAddress(address) {
  if (address === undefined || address === null || address === '') {
    return null; // Address is optional
  }
  if (typeof address !== 'string') {
    return 'Address must be text.';
  }
  const trimmed = address.trim();
  if (trimmed.length > 400) {
    return `Address must not exceed 400 characters. Current length: ${trimmed.length}.`;
  }
  return null;
}

function validateRole(role) {
  if (!role || !VALID_ROLES.includes(role)) {
    return `Role must be one of: ${VALID_ROLES.join(', ')}.`;
  }
  return null;
}

function normalizeEmail(email) {
  return email ? email.trim().toLowerCase() : '';
}

function normalizeText(text) {
  return text ? text.trim() : '';
}

module.exports = {
  EMAIL_REGEX,
  PASSWORD_REGEX,
  VALID_ROLES,
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
  validateRole,
  normalizeEmail,
  normalizeText,
};
