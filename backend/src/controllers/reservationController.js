const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const { calculateStayDuration, calculatePricing } = require('../utils/pricing');

// @desc    Create a new reservation (Guest or Admin)
// @route   POST /api/reservations
// @access  Private
const createReservation = async (req, res) => {
  try {
    const {
      roomId,
      checkIn,
      checkOut,
      adults = 1,
      children = 0,
      guestDetails = {},
      simulatePayment = false,
      paymentMethod = 'Test Card'
    } = req.body;

    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Room ID, check-in date, and check-out date are required'
      });
    }

    // 1. Fetch Room and verify it is active
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    if (!room.isActive) {
      return res.status(400).json({ success: false, message: 'This room is currently inactive and cannot be reserved' });
    }

    // 2. Validate dates & duration
    const { nights, normalizedCheckIn, normalizedCheckOut } = calculateStayDuration(checkIn, checkOut);

    // 3. Guest capacity check
    const totalGuests = (parseInt(adults, 10) || 1) + (parseInt(children, 10) || 0);
    if (totalGuests > room.maxGuests) {
      return res.status(400).json({
        success: false,
        message: `Total guests (${totalGuests}) exceeds the maximum capacity of ${room.maxGuests} for this room`
      });
    }

    // 4. Overlap Check: Prevent overlapping active reservations
    // An active reservation overlaps if existingCheckIn < newCheckOut AND existingCheckOut > newCheckIn
    const conflictingReservation = await Reservation.findOne({
      room: room._id,
      reservationStatus: { $in: ['Pending', 'Confirmed', 'Checked-In'] },
      checkIn: { $lt: normalizedCheckOut },
      checkOut: { $gt: normalizedCheckIn }
    });

    if (conflictingReservation) {
      return res.status(409).json({
        success: false,
        message: 'This room has already been booked for the requested dates. Please choose alternate dates or rooms.'
      });
    }

    // 5. Server-Side Price Calculation (Never trust client prices)
    const pricing = calculatePricing(room.pricePerNight, nights);

    // 6. Assemble Guest Details
    const finalGuestDetails = {
      name: guestDetails.name || req.user.name,
      email: guestDetails.email || req.user.email,
      phone: guestDetails.phone || req.user.phone || '',
      specialRequests: guestDetails.specialRequests || ''
    };

    // 7. Payment status handling (distinct from reservationStatus)
    const isPaid = Boolean(simulatePayment);
    const paymentStatus = isPaid ? 'Paid' : 'Unpaid';
    const paymentDetails = isPaid
      ? {
          transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          method: paymentMethod || 'Visa ending in 4242',
          paidAt: new Date(),
          amountPaid: pricing.totalPrice
        }
      : {
          transactionId: '',
          method: 'Pending at Desk / Card on Arrival',
          amountPaid: 0
        };

    // 8. Create Reservation
    const reservation = await Reservation.create({
      user: req.user._id,
      room: room._id,
      guestDetails: finalGuestDetails,
      checkIn: normalizedCheckIn,
      checkOut: normalizedCheckOut,
      adults: parseInt(adults, 10) || 1,
      children: parseInt(children, 10) || 0,
      totalNights: pricing.totalNights,
      pricePerNight: pricing.pricePerNight,
      subtotal: pricing.subtotal,
      taxAmount: pricing.taxAmount,
      serviceFee: pricing.serviceFee,
      totalPrice: pricing.totalPrice,
      reservationStatus: 'Confirmed',
      paymentStatus,
      paymentDetails
    });

    // Populate room before returning
    const populatedReservation = await Reservation.findById(reservation._id).populate('room');

    res.status(201).json({
      success: true,
      message: 'Reservation created and confirmed successfully',
      data: populatedReservation
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user's reservations
// @route   GET /api/reservations/my
// @access  Private
const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('room')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reservation by ID
// @route   GET /api/reservations/:id
// @access  Private
const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('room')
      .populate('user', 'name email phone');

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Access control: Guest can only view their own reservation; Admin can view any
    if (req.user.role !== 'admin' && reservation.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to view this reservation' });
    }

    res.json({ success: true, data: reservation });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid reservation ID or not found' });
  }
};

// @desc    Cancel reservation (Guest or Admin)
// @route   PUT /api/reservations/:id/cancel
// @access  Private
const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Role check: Only owner or admin can cancel
    if (req.user.role !== 'admin' && reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: You cannot cancel another guest’s reservation' });
    }

    // Eligibility check
    if (reservation.reservationStatus === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'This reservation is already cancelled' });
    }

    if (reservation.reservationStatus === 'Checked-Out') {
      return res.status(400).json({ success: false, message: 'Completed stays cannot be cancelled' });
    }

    reservation.reservationStatus = 'Cancelled';
    reservation.cancellationReason = req.body.reason || 'Cancelled by user';
    reservation.cancelledAt = new Date();

    // If paid, mark payment as Refunded (or Partially-Refunded)
    if (reservation.paymentStatus === 'Paid') {
      reservation.paymentStatus = 'Refunded';
    }

    await reservation.save();

    res.json({
      success: true,
      message: 'Reservation cancelled successfully',
      data: reservation
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Simulate or Process Payment for Reservation
// @route   POST /api/reservations/:id/pay
// @access  Private
const payReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (req.user.role !== 'admin' && reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: You cannot pay for another guest’s reservation' });
    }

    if (reservation.paymentStatus === 'Paid') {
      return res.status(400).json({ success: false, message: 'This reservation has already been paid in full' });
    }

    const { paymentMethod = 'Credit Card (Visa •••• 4242)' } = req.body;

    reservation.paymentStatus = 'Paid';
    reservation.paymentDetails = {
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      method: paymentMethod,
      paidAt: new Date(),
      amountPaid: reservation.totalPrice
    };

    await reservation.save();

    res.json({
      success: true,
      message: 'Payment completed successfully (Test Mode)',
      data: reservation
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  getReservationById,
  cancelReservation,
  payReservation
};

