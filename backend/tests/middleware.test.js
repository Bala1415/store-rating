const jwt = require('jsonwebtoken');
const { requireRoles } = require('../src/middleware/roleMiddleware');
const { generateToken } = require('../src/utils/token');

describe('Security and Authorization Middleware Tests', () => {
  describe('requireRoles Middleware', () => {
    test('Denies access when req.user is absent', () => {
      const middleware = requireRoles('ADMIN');
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    test('Denies access when user role is not in allowed list', () => {
      const middleware = requireRoles('ADMIN');
      const req = { user: { id: 1, role: 'USER' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Forbidden'),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('Allows access when user role matches allowed list', () => {
      const middleware = requireRoles('ADMIN', 'STORE_OWNER');
      const req = { user: { id: 2, role: 'STORE_OWNER' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('JWT Utility Functions', () => {
    test('Generates and signs valid JWT', () => {
      const payload = { id: 42, email: 'test@example.com', role: 'USER' };
      const token = generateToken(payload);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });
});
