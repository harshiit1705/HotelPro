const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const User = require('../models/User');

// @desc    Get Admin Dashboard Overview & Metrics
// @route   GET /api/admin/metrics
// @access  Private / Admin
const getDashboardMetrics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Room Metrics
    const totalRooms = await Room.countDocuments();
    const activeRooms = await Room.countDocuments({ isActive: true });

    // 2. Reservation Count Metrics
    const totalReservations = await Reservation.countDocuments();
    const confirmedCount = await Reservation.countDocuments({ reservationStatus: 'Confirmed' });
    const checkedInCount = await Reservation.countDocuments({ reservationStatus: 'Checked-In' });
    const checkedOutCount = await Reservation.countDocuments({ reservationStatus: 'Checked-Out' });
    const cancelledCount = await Reservation.countDocuments({ reservationStatus: 'Cancelled' });

    // 3. Occupancy calculation for today
    // Rooms with status Checked-In or Confirmed spanning today
    const currentlyOccupiedRooms = await Reservation.countDocuments({
      reservationStatus: { $in: ['Confirmed', 'Checked-In'] },
      checkIn: { $lte: new Date() },
      checkOut: { $gte: today }
    });

    const occupancyRate = activeRooms > 0
      ? Math.round((currentlyOccupiedRooms / activeRooms) * 100)
      : 0;

    // 4. Financial / Revenue Information derived exclusively from actual recorded data
    const revenueAggregation = await Reservation.aggregate([
      {
        $match: {
          paymentStatus: 'Paid',
          reservationStatus: { $ne: 'Cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          totalSubtotal: { $sum: '$subtotal' },
          totalTax: { $sum: '$taxAmount' },
          totalFees: { $sum: '$serviceFee' }
        }
      }
    ]);

    const revenueData = revenueAggregation[0] || {
      totalRevenue: 0,
      totalSubtotal: 0,
      totalTax: 0,
      totalFees: 0
    };

    // 5. Today's Arrivals & Departures
    const todayCheckIns = await Reservation.countDocuments({
      checkIn: { $gte: today, $lt: tomorrow },
      reservationStatus: { $in: ['Confirmed', 'Pending'] }
    });

    const todayCheckOuts = await Reservation.countDocuments({
      checkOut: { $gte: today, $lt: tomorrow },
      reservationStatus: 'Checked-In'
    });

    // 6. Registered guests count
    const totalGuests = await User.countDocuments({ role: 'guest' });

    // 7. Recent 5 reservations
    const recentReservations = await Reservation.find()
      .populate('room', 'roomNumber title pricePerNight')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      data: {
        rooms: {
          total: totalRooms,
          active: activeRooms,
          inactive: totalRooms - activeRooms
        },
        occupancy: {
          rate: occupancyRate,
          occupiedRooms: currentlyOccupiedRooms,
          availableRooms: Math.max(0, activeRooms - currentlyOccupiedRooms)
        },
        reservations: {
          total: totalReservations,
          confirmed: confirmedCount,
          checkedIn: checkedInCount,
          checkedOut: checkedOutCount,
          cancelled: cancelledCount,
          todayCheckIns,
          todayCheckOuts
        },
        financials: {
          totalRevenue: Math.round(revenueData.totalRevenue * 100) / 100,
          totalSubtotal: Math.round(revenueData.totalSubtotal * 100) / 100,
          totalTax: Math.round(revenueData.totalTax * 100) / 100,
          totalFees: Math.round(revenueData.totalFees * 100) / 100
        },
        guests: {
          total: totalGuests
        },
        recentReservations
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reservations with administrative filters
// @route   GET /api/admin/reservations
// @access  Private / Admin
const getAllReservations = async (req, res) => {
  try {
    const { status, paymentStatus, search, sort = '-createdAt' } = req.query;

    const query = {};

    if (status && status !== 'All') {
      query.reservationStatus = status;
    }

    if (paymentStatus && paymentStatus !== 'All') {
      query.paymentStatus = paymentStatus;
    }

    if (search) {
      query.$or = [
        { 'guestDetails.name': { $regex: search, $options: 'i' } },
        { 'guestDetails.email': { $regex: search, $options: 'i' } },
        { 'guestDetails.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const reservations = await Reservation.find(query)
      .populate('room')
      .populate('user', 'name email phone')
      .sort(sort);

    res.json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update reservation lifecycle status (Check-In, Check-Out, Cancel)
// @route   PATCH /api/admin/reservations/:id/status
// @access  Private / Admin
const updateReservationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const reservation = await Reservation.findById(req.params.id).populate('room');
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Lifecycle validation rules
    if (status === 'Checked-In' && reservation.reservationStatus === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot check in a cancelled reservation' });
    }

    if (status === 'Checked-Out' && reservation.reservationStatus !== 'Checked-In') {
      return res.status(400).json({ success: false, message: 'Reservation must be Checked-In before it can be Checked-Out' });
    }

    reservation.reservationStatus = status;

    if (status === 'Cancelled') {
      reservation.cancelledAt = new Date();
      reservation.cancellationReason = notes || 'Cancelled by Administrator';
      if (reservation.paymentStatus === 'Paid') {
        reservation.paymentStatus = 'Refunded';
      }
    }

    await reservation.save();

    res.json({
      success: true,
      message: `Reservation status updated to ${status}`,
      data: reservation
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all registered guests with booking statistics
// @route   GET /api/admin/guests
// @access  Private / Admin
const getAllGuests = async (req, res) => {
  try {
    const guests = await User.find({ role: 'guest' }).select('-password').sort({ createdAt: -1 });

    // Aggregate booking counts and spend per guest
    const guestStats = await Reservation.aggregate([
      {
        $group: {
          _id: '$user',
          bookingCount: { $sum: 1 },
          totalSpent: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, '$totalPrice', 0]
            }
          },
          lastBookingDate: { $max: '$createdAt' }
        }
      }
    ]);

    const statsMap = {};
    guestStats.forEach((stat) => {
      statsMap[stat._id.toString()] = stat;
    });

    const enrichedGuests = guests.map((guest) => {
      const gObj = guest.toObject();
      const stat = statsMap[guest._id.toString()] || { bookingCount: 0, totalSpent: 0, lastBookingDate: null };
      gObj.bookingCount = stat.bookingCount;
      gObj.totalSpent = Math.round(stat.totalSpent * 100) / 100;
      gObj.lastBookingDate = stat.lastBookingDate;
      return gObj;
    });

    res.json({
      success: true,
      count: enrichedGuests.length,
      data: enrichedGuests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardMetrics,
  getAllReservations,
  updateReservationStatus,
  getAllGuests
};

