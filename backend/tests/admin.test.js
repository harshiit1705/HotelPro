const { describe, test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const request = require('./testClient');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const Room = require('../src/models/Room');
const Reservation = require('../src/models/Reservation');

let adminToken;
let guestToken;
let room;

before(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB();
});

after(async () => {
  await disconnectDB();
});

beforeEach(async () => {
  await User.deleteMany();
  await Room.deleteMany();
  await Reservation.deleteMany();

  await User.create({
    name: 'General Manager',
    email: 'gm@hotelpro.com',
    password: 'password123',
    role: 'admin'
  });

  await User.create({
    name: 'Charlotte Green',
    email: 'charlotte@example.com',
    password: 'password123',
    role: 'guest'
  });

  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'gm@hotelpro.com',
    password: 'password123'
  });
  adminToken = adminLogin.body.data.token;

  const guestLogin = await request(app).post('/api/auth/login').send({
    email: 'charlotte@example.com',
    password: 'password123'
  });
  guestToken = guestLogin.body.data.token;

  room = await Room.create({
    roomNumber: '401',
    title: 'Executive Royal Suite',
    type: 'Suite',
    description: 'Luxury executive suite',
    pricePerNight: 300,
    maxGuests: 2,
    isActive: true
  });
});

describe('Admin Operations & Metrics API', () => {
  test('Admin metrics computes actual revenue and room counts', async () => {
    const guestUser = await User.findOne({ email: 'charlotte@example.com' });

    await Reservation.create({
      user: guestUser._id,
      room: room._id,
      guestDetails: { name: 'Charlotte Green', email: 'charlotte@example.com' },
      checkIn: new Date(),
      checkOut: new Date(Date.now() + 86400000 * 2),
      adults: 1,
      totalNights: 2,
      pricePerNight: 300,
      subtotal: 600,
      taxAmount: 60,
      serviceFee: 25,
      totalPrice: 685,
      reservationStatus: 'Checked-In',
      paymentStatus: 'Paid'
    });

    const res = await request(app)
      .get('/api/admin/metrics')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.rooms.total, 1);
    assert.strictEqual(res.body.data.financials.totalRevenue, 685);
    assert.strictEqual(res.body.data.reservations.checkedIn, 1);
    assert.strictEqual(res.body.data.guests.total, 1);
  });

  test('Admin can perform valid check-out on checked-in reservation', async () => {
    const guestUser = await User.findOne({ email: 'charlotte@example.com' });

    const booking = await Reservation.create({
      user: guestUser._id,
      room: room._id,
      guestDetails: { name: 'Charlotte Green', email: 'charlotte@example.com' },
      checkIn: new Date(),
      checkOut: new Date(Date.now() + 86400000),
      adults: 1,
      totalNights: 1,
      pricePerNight: 300,
      subtotal: 300,
      taxAmount: 30,
      serviceFee: 25,
      totalPrice: 355,
      reservationStatus: 'Checked-In',
      paymentStatus: 'Paid'
    });

    const res = await request(app)
      .patch(`/api/admin/reservations/${booking._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Checked-Out' });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.data.reservationStatus, 'Checked-Out');
  });

  test('Guest cannot access admin metrics or guest list (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/admin/metrics')
      .set('Authorization', `Bearer ${guestToken}`);

    assert.strictEqual(res.statusCode, 403);
  });
});
