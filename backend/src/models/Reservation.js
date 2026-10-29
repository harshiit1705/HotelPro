const mongoose = require('mongoose');
const { ReservationModel: MemoryReservationModel } = require('../config/memoryDb');

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true
    },
    guestDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: '' },
      specialRequests: { type: String, default: '' }
    },
    checkIn: {
      type: Date,
      required: true
    },
    checkOut: {
      type: Date,
      required: true
    },
    adults: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    children: {
      type: Number,
      default: 0,
      min: 0
    },
    totalNights: {
      type: Number,
      required: true,
      min: 1
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    taxAmount: {
      type: Number,
      required: true,
      min: 0
    },
    serviceFee: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    reservationStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled'],
      default: 'Confirmed'
    },
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Paid', 'Refunded', 'Partially-Refunded'],
      default: 'Unpaid'
    },
    paymentDetails: {
      transactionId: { type: String, default: '' },
      method: { type: String, default: 'Test Card' },
      paidAt: { type: Date },
      amountPaid: { type: Number, default: 0 }
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    cancelledAt: {
      type: Date
    }
  },
  { timestamps: true }
);

const MongooseReservation = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema);

const ReservationProxy = new Proxy(MongooseReservation, {
  get(target, prop) {
    if (global.USE_IN_MEMORY_DB) {
      return MemoryReservationModel[prop];
    }
    return target[prop];
  }
});

module.exports = ReservationProxy;
