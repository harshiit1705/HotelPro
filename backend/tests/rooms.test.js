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
    name: 'Admin Test',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin'
  });

  await User.create({
    name: 'Guest Test',
    email: 'guest@test.com',
    password: 'password123',
    role: 'guest'
  });

  const loginAdmin = await request(app).post('/api/auth/login').send({
    email: 'admin@test.com',
    password: 'password123'
  });
  adminToken = loginAdmin.body.data.token;

  const loginGuest = await request(app).post('/api/auth/login').send({
    email: 'guest@test.com',
    password: 'password123'
  });
  guestToken = loginGuest.body.data.token;
});

describe('Rooms Management & Search API', () => {
  test('Admin can create a new room and verify details', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        roomNumber: '501',
        title: 'Penthouse Panorama',
        type: 'Presidential',
        description: 'Spectacular penthouse with 360-degree views',
        pricePerNight: 500,
        maxGuests: 4,
        amenities: ['Jacuzzi', 'Private Terrace', 'Butler Service'],
        images: ['/images/hero_1.jpg']
      });

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.data.roomNumber, '501');
    assert.strictEqual(res.body.data.pricePerNight, 500);
  });

  test('Guest cannot create a new room (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        roomNumber: '502',
        title: 'Illegal Room',
        type: 'Single',
        description: 'Should fail',
        pricePerNight: 100,
        maxGuests: 1
      });

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.success, false);
  });

  test('Date-based availability search properly filters out booked rooms', async () => {
    const roomA = await Room.create({
      roomNumber: '101',
      title: 'Room A',
      type: 'Single',
      description: 'Single Room',
      pricePerNight: 100,
      maxGuests: 2,
      isActive: true
    });

    const roomB = await Room.create({
      roomNumber: '102',
      title: 'Room B',
      type: 'Double',
      description: 'Double Room',
      pricePerNight: 150,
      maxGuests: 2,
      isActive: true
    });

    const guestUser = await User.findOne({ email: 'guest@test.com' });

    await Reservation.create({
      user: guestUser._id,
      room: roomA._id,
      guestDetails: { name: 'Guest Test', email: 'guest@test.com' },
      checkIn: new Date('2026-11-10T00:00:00.000Z'),
      checkOut: new Date('2026-11-15T00:00:00.000Z'),
      adults: 1,
      totalNights: 5,
      pricePerNight: 100,
      subtotal: 500,
      taxAmount: 50,
      serviceFee: 25,
      totalPrice: 575,
      reservationStatus: 'Confirmed',
      paymentStatus: 'Paid'
    });

    const searchRes = await request(app)
      .get('/api/rooms?checkIn=2026-11-12&checkOut=2026-11-14');

    assert.strictEqual(searchRes.statusCode, 200);
    assert.strictEqual(searchRes.body.count, 1);
    assert.strictEqual(searchRes.body.data[0].roomNumber, '102');
  });
});
