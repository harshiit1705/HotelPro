const { describe, test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const request = require('./testClient');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');

before(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB();
});

after(async () => {
  await disconnectDB();
});

beforeEach(async () => {
  await User.deleteMany();
});

describe('Authentication API Endpoints', () => {
  test('POST /api/auth/register should register a new guest with hashed password and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'James Bond',
        email: '007@mi6.gov.uk',
        password: 'password123',
        phone: '+44 20 7946 0991'
      });

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.strictEqual(res.body.data.role, 'guest');
    assert.strictEqual(res.body.data.email, '007@mi6.gov.uk');
  });

  test('POST /api/auth/register should reject duplicate email address', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'James Bond',
        email: '007@mi6.gov.uk',
        password: 'password123'
      });

    const duplicateRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate James',
        email: '007@mi6.gov.uk',
        password: 'anotherpassword'
      });

    assert.strictEqual(duplicateRes.statusCode, 400);
    assert.strictEqual(duplicateRes.body.success, false);
  });

  test('POST /api/auth/login should authenticate valid credentials', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Sherlock Holmes',
        email: 'sherlock@bakerstreet.com',
        password: 'elementary123'
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'sherlock@bakerstreet.com',
        password: 'elementary123'
      });

    assert.strictEqual(loginRes.statusCode, 200);
    assert.strictEqual(loginRes.body.success, true);
    assert.ok(loginRes.body.data.token);
  });

  test('POST /api/auth/login should reject incorrect password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Sherlock Holmes',
        email: 'sherlock@bakerstreet.com',
        password: 'elementary123'
      });

    const badLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'sherlock@bakerstreet.com',
        password: 'wrongpassword'
      });

    assert.strictEqual(badLoginRes.statusCode, 401);
    assert.strictEqual(badLoginRes.body.success, false);
  });

  test('GET /api/auth/me should return current user when authorized', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Dr. Watson',
        email: 'watson@bakerstreet.com',
        password: 'password123'
      });

    const token = regRes.body.data.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(meRes.statusCode, 200);
    assert.strictEqual(meRes.body.data.name, 'Dr. Watson');
  });
});
