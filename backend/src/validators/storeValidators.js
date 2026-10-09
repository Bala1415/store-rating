/**
 * Store and Rating Validation Module
 */

const { validateName, validateEmail, validateAddress } = require('./authValidators');

function validateStoreName(name) {
  return validateName(name, 'Store Name');
}

function validateStoreEmail(email) {
  return validateEmail(email);
}

function validateStoreAddress(address) {
  return validateAddress(address);
}

function validateRatingValue(rating) {
  if (rating === undefined || rating === null) {
    return 'Rating is required.';
  }
  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating)) {
    return 'Rating must be an integer between 1 and 5.';
  }
  if (numericRating < 1 || numericRating > 5) {
    return 'Rating must be between 1 and 5.';
  }
  return null;
}

function validateOwnerId(ownerUserId) {
  const numericId = Number(ownerUserId);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return 'A valid store owner user ID is required.';
  }
  return null;
}

module.exports = {
  validateStoreName,
  validateStoreEmail,
  validateStoreAddress,
  validateRatingValue,
  validateOwnerId,
};
