const { describe, test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const request = require('./testClient');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const Room = require('../src/models/Room');
const Reservation = require('../src/models/Reservation');

let guestToken;
let otherGuestToken;
let testRoom;

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
    name: 'Alice Wonder',
    email: 'alice@wonderland.com',
    password: 'password123',
    role: 'guest'
  });

  await User.create({
    name: 'Bob Builder',
    email: 'bob@builder.com',
    password: 'password123',
    role: 'guest'
  });

  const loginRes1 = await request(app).post('/api/auth/login').send({
    email: 'alice@wonderland.com',
    password: 'password123'
  });
  guestToken = loginRes1.body.data.token;

  const loginRes2 = await request(app).post('/api/auth/login').send({
    email: 'bob@builder.com',
    password: 'password123'
  });
  otherGuestToken = loginRes2.body.data.token;

  testRoom = await Room.create({
    roomNumber: '305',
    title: 'Emerald Luxury Suite',
    type: 'Suite',
    description: 'Emerald Suite with balcony',
    pricePerNight: 200,
    maxGuests: 3,
    isActive: true
  });
});

describe('Reservation Workflow & Integrity', () => {
  test('Creates reservation with strictly server-side calculated pricing', async () => {
    // 3 nights at $200/night: subtotal $600, tax $60 (10%), fee $25 -> totalPrice $685
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        roomId: testRoom._id,
        checkIn: '2026-12-01',
        checkOut: '2026-12-04',
        adults: 2,
        guestDetails: {
          name: 'Alice Wonder',
          email: 'alice@wonderland.com'
        },
        simulatePayment: true
      });

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.totalNights, 3);
    assert.strictEqual(res.body.data.pricePerNight, 200);
    assert.strictEqual(res.body.data.subtotal, 600);
    assert.strictEqual(res.body.data.taxAmount, 60);
    assert.strictEqual(res.body.data.serviceFee, 25);
    assert.strictEqual(res.body.data.totalPrice, 685);
    // Verified separation of reservation and payment status
    assert.strictEqual(res.body.data.reservationStatus, 'Confirmed');
    assert.strictEqual(res.body.data.paymentStatus, 'Paid');
  });

  test('Rejects overlapping reservation for the same room (409 Conflict)', async () => {
    // 1. Initial booking: Dec 1 to Dec 5
    await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        roomId: testRoom._id,
        checkIn: '2026-12-01',
        checkOut: '2026-12-05',
        adults: 1
      });

    // 2. Conflicting booking attempt: Dec 3 to Dec 7
    const conflictRes = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${otherGuestToken}`)
      .send({
        roomId: testRoom._id,
        checkIn: '2026-12-03',
        checkOut: '2026-12-07',
        adults: 1
      });

    assert.strictEqual(conflictRes.statusCode, 409);
    assert.strictEqual(conflictRes.body.success, false);
    assert.ok(conflictRes.body.message.includes('already been booked'));
  });

  test('Guest cannot cancel another guest’s reservation (403 Forbidden)', async () => {
    const bookingRes = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        roomId: testRoom._id,
        checkIn: '2026-12-10',
        checkOut: '2026-12-12',
        adults: 1
      });

    const bookingId = bookingRes.body.data._id;

    const cancelRes = await request(app)
      .put(`/api/reservations/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${otherGuestToken}`)
      .send({ reason: 'Unauthorized cancellation' });

    assert.strictEqual(cancelRes.statusCode, 403);
    assert.strictEqual(cancelRes.body.success, false);
  });

  test('Guest can cancel their own reservation and receive refund update', async () => {
    const bookingRes = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        roomId: testRoom._id,
        checkIn: '2026-12-20',
        checkOut: '2026-12-23',
        adults: 1,
        simulatePayment: true
      });

    const bookingId = bookingRes.body.data._id;

    const cancelRes = await request(app)
      .put(`/api/reservations/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ reason: 'Trip rescheduled' });

    assert.strictEqual(cancelRes.statusCode, 200);
    assert.strictEqual(cancelRes.body.data.reservationStatus, 'Cancelled');
    assert.strictEqual(cancelRes.body.data.paymentStatus, 'Refunded');
  });
});
