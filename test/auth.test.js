import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { seedDatabase } from '../src/database/seed.js';

describe('X Mart Authentication & Session API Endpoints', () => {
  before(async () => {
    await seedDatabase();
  });

  const testEmail = `newuser_${Date.now()}@example.com`;
  const testPhone = '089-987-6543';
  const testPassword = 'Password@123';
  let registeredToken = null;

  describe('POST /api/auth/register', () => {
    test('should register a new customer account successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Somying Sukjai',
          phone: testPhone,
          email: testEmail,
          password: testPassword
        })
        .expect('Content-Type', /json/)
        .expect(201);

      assert.equal(res.body.success, true);
      assert.ok(res.body.token, 'Should return session token');
      assert.ok(res.body.user);
      assert.equal(res.body.user.name, 'Somying Sukjai');
      assert.equal(res.body.user.email, testEmail);
      assert.equal(res.body.user.phone, testPhone);
      assert.equal(res.body.user.role, 'customer');
      assert.equal(res.body.user.password_hash, undefined, 'Password hash must never leak in response');

      registeredToken = res.body.token;
    });

    test('should reject registration if email is already taken', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Tester',
          phone: '081-000-9999',
          email: testEmail,
          password: 'AnotherPassword123'
        })
        .expect(409);

      assert.equal(res.body.success, false);
      assert.match(res.body.error, /already exists/i);
    });

    test('should reject registration with invalid email or missing name', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'A',
          phone: '0812345678',
          email: 'not-an-email',
          password: '123'
        })
        .expect(400);

      assert.equal(res.body.success, false);
    });
  });

  describe('POST /api/auth/login', () => {
    test('should log in successfully using registered email and password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: testEmail,
          password: testPassword
        })
        .expect(200);

      assert.equal(res.body.success, true);
      assert.ok(res.body.token);
      assert.equal(res.body.user.email, testEmail);
      assert.equal(res.body.user.name, 'Somying Sukjai');
    });

    test('should log in successfully using registered phone number', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: testPhone,
          password: testPassword
        })
        .expect(200);

      assert.equal(res.body.success, true);
      assert.ok(res.body.token);
      assert.equal(res.body.user.phone, testPhone);
    });

    test('should log in with seeded customer John Doe (Admin@123)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'john.doe@example.com',
          password: 'Admin@123'
        })
        .expect(200);

      assert.equal(res.body.success, true);
      assert.ok(res.body.token);
      assert.equal(res.body.user.name, 'John Doe');
      assert.equal(res.body.user.role, 'customer');
    });

    test('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: testEmail,
          password: 'WrongPassword'
        })
        .expect(401);

      assert.equal(res.body.success, false);
      assert.match(res.body.error, /invalid/i);
    });

    test('should reject login with non-existent account', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'ghost_user_9999@example.com',
          password: 'SomePassword'
        })
        .expect(401);

      assert.equal(res.body.success, false);
    });
  });

  describe('GET /api/auth/me & POST /api/auth/logout', () => {
    test('should return authenticated user profile using session token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${registeredToken}`)
        .expect(200);

      assert.equal(res.body.success, true);
      assert.equal(res.body.user.email, testEmail);
    });

    test('should return 401 when accessing /me without token or invalid token', async () => {
      await request(app).get('/api/auth/me').expect(401);
      await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalid-token').expect(401);
    });

    test('should invalidate token upon logout', async () => {
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${registeredToken}`)
        .expect(200);

      assert.equal(logoutRes.body.success, true);

      // Now /me should reject
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${registeredToken}`)
        .expect(401);
    });
  });
});
