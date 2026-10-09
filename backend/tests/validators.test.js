const {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
  validateRole,
  normalizeEmail,
} = require('../src/validators/authValidators');
const {
  validateRatingValue,
  validateStoreName,
  validateOwnerId,
} = require('../src/validators/storeValidators');

describe('Input Validation Suite - Roxiler Assessment Constraints', () => {
  describe('Name Validation (20 - 60 characters)', () => {
    test('Rejects name shorter than 20 characters', () => {
      expect(validateName('Alice Short')).toMatch(/between 20 and 60 characters/);
      expect(validateName('1234567890123456789')).toMatch(/between 20 and 60 characters/); // 19 chars
    });

    test('Rejects name longer than 60 characters', () => {
      const longName = 'A'.repeat(61);
      expect(validateName(longName)).toMatch(/between 20 and 60 characters/);
    });

    test('Accepts valid name between 20 and 60 characters', () => {
      const validName = 'System Administrator Roxiler'; // 28 chars
      expect(validateName(validName)).toBeNull();
    });

    test('Validates store name under the same constraint', () => {
      expect(validateStoreName('Short Store')).toMatch(/between 20 and 60 characters/);
      expect(validateStoreName('Downtown Gourmet Artisan Bakery')).toBeNull();
    });
  });

  describe('Password Validation (8 - 16 characters, 1 uppercase, 1 special char)', () => {
    test('Rejects passwords under 8 characters', () => {
      expect(validatePassword('Pass@1')).toMatch(/between 8 and 16 characters/);
    });

    test('Rejects passwords over 16 characters', () => {
      expect(validatePassword('Pass@wordVeryLong12345')).toMatch(/between 8 and 16 characters/);
    });

    test('Rejects passwords lacking an uppercase letter', () => {
      expect(validatePassword('password@123')).toMatch(/uppercase letter/);
    });

    test('Rejects passwords lacking a special character', () => {
      expect(validatePassword('Password123')).toMatch(/special character/);
    });

    test('Accepts compliant passwords', () => {
      expect(validatePassword('Admin@1234')).toBeNull();
      expect(validatePassword('Owner#5678')).toBeNull();
      expect(validatePassword('User$9012')).toBeNull();
    });
  });

  describe('Email Validation & Normalization', () => {
    test('Rejects invalid email formats', () => {
      expect(validateEmail('not-an-email')).toMatch(/Invalid email/);
      expect(validateEmail('missing@domain')).toMatch(/Invalid email/);
      expect(validateEmail('@missinguser.com')).toMatch(/Invalid email/);
    });

    test('Accepts valid email formats', () => {
      expect(validateEmail('admin@roxiler.com')).toBeNull();
      expect(validateEmail('user.test+tag@gmail.com')).toBeNull();
    });

    test('Normalizes emails by trimming and lowercasing', () => {
      expect(normalizeEmail('  Admin@Roxiler.COM  ')).toBe('admin@roxiler.com');
    });
  });

  describe('Address Validation (Max 400 characters)', () => {
    test('Accepts empty or null address', () => {
      expect(validateAddress(null)).toBeNull();
      expect(validateAddress('')).toBeNull();
      expect(validateAddress(undefined)).toBeNull();
    });

    test('Rejects address exceeding 400 characters', () => {
      const longAddress = 'A'.repeat(401);
      expect(validateAddress(longAddress)).toMatch(/must not exceed 400 characters/);
    });

    test('Accepts valid address', () => {
      expect(validateAddress('100 Corporate Parkway, Suite 500, Tech District')).toBeNull();
    });
  });

  describe('Rating Validation (Integer 1 - 5)', () => {
    test('Rejects rating below 1', () => {
      expect(validateRatingValue(0)).toMatch(/between 1 and 5/);
      expect(validateRatingValue(-1)).toMatch(/between 1 and 5/);
    });

    test('Rejects rating above 5', () => {
      expect(validateRatingValue(6)).toMatch(/between 1 and 5/);
    });

    test('Rejects non-integer ratings', () => {
      expect(validateRatingValue(3.5)).toMatch(/must be an integer/);
      expect(validateRatingValue('abc')).toMatch(/must be an integer/);
    });

    test('Accepts valid ratings 1 through 5', () => {
      expect(validateRatingValue(1)).toBeNull();
      expect(validateRatingValue(3)).toBeNull();
      expect(validateRatingValue(5)).toBeNull();
    });
  });

  describe('Role Validation', () => {
    test('Rejects unauthorized roles', () => {
      expect(validateRole('SUPERADMIN')).toMatch(/Role must be one of/);
      expect(validateRole('GUEST')).toMatch(/Role must be one of/);
    });

    test('Accepts allowed roles: ADMIN, USER, STORE_OWNER', () => {
      expect(validateRole('ADMIN')).toBeNull();
      expect(validateRole('USER')).toBeNull();
      expect(validateRole('STORE_OWNER')).toBeNull();
    });
  });

  describe('Store Owner ID Validation', () => {
    test('Rejects invalid or non-numeric owner ID', () => {
      expect(validateOwnerId('abc')).toMatch(/valid store owner/);
      expect(validateOwnerId(0)).toMatch(/valid store owner/);
      expect(validateOwnerId(-5)).toMatch(/valid store owner/);
    });

    test('Accepts positive integer owner ID', () => {
      expect(validateOwnerId(2)).toBeNull();
      expect(validateOwnerId('3')).toBeNull();
    });
  });
});
