const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/db');

describe('Full End-to-End API Integration Tests', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('Health Check Endpoint', () => {
    test('GET /api/health returns healthy and database connected', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.database.success).toBe(true);
    });
  });

  describe('Authentication Flows', () => {
    test('POST /api/auth/login succeeds for Admin and sets HttpOnly cookie', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@roxiler.com', password: 'Admin@1234' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('ADMIN');
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toMatch(/auth_token=/);
      expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/);
    });

    test('POST /api/auth/login rejects invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@roxiler.com', password: 'WrongPassword@123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('POST /api/auth/signup enforces 20-60 character name constraint', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Short Name',
          email: 'test.short@gmail.com',
          password: 'User@1234',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/between 20 and 60 characters/);
    });

    test('POST /api/auth/signup creates a normal user with strictly USER role', async () => {
      const uniqueEmail = `test.user.${Date.now()}@gmail.com`;
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Integration Test Customer Account', // >20 chars
          email: uniqueEmail,
          password: 'User@1234',
          address: '123 Testing Blvd',
          role: 'ADMIN', // Attempting to escalate role
        });

      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe('USER'); // Role escalation prevented!
      expect(res.headers['set-cookie']).toBeDefined();
    });
  });

  describe('Role-Based Authorization & Store Management', () => {
    let adminCookie;
    let userCookie;
    let ownerCookie;

    beforeAll(async () => {
      const adminRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@roxiler.com', password: 'Admin@1234' });
      adminCookie = adminRes.headers['set-cookie'];

      const userRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'chris.user@gmail.com', password: 'User@1234' });
      userCookie = userRes.headers['set-cookie'];

      const ownerRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'alice.owner@roxiler.com', password: 'Owner@1234' });
      ownerCookie = ownerRes.headers['set-cookie'];
    });

    test('GET /api/admin/dashboard allows ADMIN and returns DB-backed totals', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats.totalUsers).toBeGreaterThanOrEqual(7);
      expect(res.body.stats.totalStores).toBeGreaterThanOrEqual(3);
      expect(res.body.stats.totalRatings).toBeGreaterThanOrEqual(5);
    });

    test('GET /api/admin/dashboard forbids USER (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Cookie', userCookie);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    test('GET /api/owner/dashboard allows Store Owner to view only their store', async () => {
      const res = await request(app)
        .get('/api/owner/dashboard')
        .set('Cookie', ownerCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.hasStore).toBe(true);
      expect(res.body.store.name).toBe('Downtown Gourmet Artisan Bakery');
      expect(Array.isArray(res.body.ratings)).toBe(true);
    });

    test('GET /api/owner/dashboard handles unassigned store owner with clean empty state', async () => {
      const charlesRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'charles.owner@roxiler.com', password: 'Owner@1234' });

      const res = await request(app)
        .get('/api/owner/dashboard')
        .set('Cookie', charlesRes.headers['set-cookie']);

      expect(res.status).toBe(200);
      expect(res.body.hasStore).toBe(false);
      expect(res.body.store).toBeNull();
      expect(res.body.ratings).toEqual([]);
    });

    test('POST /api/stores/:id/ratings allows USER to submit/modify rating without duplicates', async () => {
      // 1. Submit rating of 5 for store 1
      const res1 = await request(app)
        .post('/api/stores/1/ratings')
        .set('Cookie', userCookie)
        .send({ rating: 5 });

      expect(res1.status).toBe(200);
      expect(res1.body.rating).toBe(5);

      // 2. Modify rating to 4 for store 1 (updates existing record, no duplicate created)
      const res2 = await request(app)
        .post('/api/stores/1/ratings')
        .set('Cookie', userCookie)
        .send({ rating: 4 });

      expect(res2.status).toBe(200);
      expect(res2.body.rating).toBe(4);

      // Verify in DB that only 1 record exists for this user and store 1
      const [rows] = await pool.query(
        'SELECT COUNT(*) AS count FROM ratings WHERE user_id = (SELECT id FROM users WHERE email = ?) AND store_id = 1',
        ['chris.user@gmail.com']
      );
      expect(rows[0].count).toBe(1);
    });
  });
});
