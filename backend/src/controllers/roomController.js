const Room = require('../models/Room');
const Reservation = require('../models/Reservation');
const { calculateStayDuration } = require('../utils/pricing');

// @desc    Get all rooms with date availability & guest filtering
// @route   GET /api/rooms
// @access  Public
const getRooms = async (req, res) => {
  try {
    const { checkIn, checkOut, guests, type, minPrice, maxPrice, search, all } = req.query;

    const query = {};

    // Standard public query only shows active rooms, unless explicitly querying as admin
    if (!all || req.user?.role !== 'admin') {
      query.isActive = true;
    }

    if (type && type !== 'All') {
      query.type = type;
    }

    if (guests) {
      const guestCount = parseInt(guests, 10);
      if (!isNaN(guestCount)) {
        query.maxGuests = { $gte: guestCount };
      }
    }

    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = parseFloat(minPrice);
      if (maxPrice) query.pricePerNight.$lte = parseFloat(maxPrice);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { roomNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Availability filtering based on checkIn and checkOut dates
    if (checkIn && checkOut) {
      const { normalizedCheckIn, normalizedCheckOut } = calculateStayDuration(checkIn, checkOut);

      // Find all overlapping active reservations
      // Overlap condition: existingCheckIn < newCheckOut AND existingCheckOut > newCheckIn
      const overlappingReservations = await Reservation.find({
        reservationStatus: { $in: ['Pending', 'Confirmed', 'Checked-In'] },
        checkIn: { $lt: normalizedCheckOut },
        checkOut: { $gt: normalizedCheckIn }
      }).select('room');

      const bookedRoomIds = overlappingReservations.map((r) => r.room.toString());
      if (bookedRoomIds.length > 0) {
        query._id = { $nin: bookedRoomIds };
      }
    }

    const rooms = await Room.find(query).sort({ isFeatured: -1, pricePerNight: 1 });

    res.json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.json({ success: true, data: room });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid room ID or not found' });
  }
};

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Private / Admin
const createRoom = async (req, res) => {
  try {
    const { roomNumber, title, type, description, pricePerNight, maxGuests, bedType, sizeSqFt, amenities, images, isFeatured } = req.body;

    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({ success: false, message: `Room number ${roomNumber} already exists` });
    }

    const room = await Room.create({
      roomNumber,
      title,
      type,
      description,
      pricePerNight,
      maxGuests,
      bedType,
      sizeSqFt,
      amenities: Array.isArray(amenities) ? amenities : amenities?.split(',').map((s) => s.trim()) || [],
      images: Array.isArray(images) && images.length ? images : ['/images/img_1.jpg'],
      isFeatured: Boolean(isFeatured),
      isActive: true
    });

    res.status(201).json({ success: true, data: room });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update an existing room
// @route   PUT /api/rooms/:id
// @access  Private / Admin
const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Check room number collision if changed
    if (req.body.roomNumber && req.body.roomNumber !== room.roomNumber) {
      const duplicate = await Room.findOne({ roomNumber: req.body.roomNumber });
      if (duplicate) {
        return res.status(400).json({ success: false, message: `Room number ${req.body.roomNumber} is already taken` });
      }
    }

    const updated = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Toggle room active/inactive status
// @route   PATCH /api/rooms/:id/toggle-active
// @access  Private / Admin
const toggleRoomActive = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    room.isActive = !room.isActive;
    await room.save();

    res.json({
      success: true,
      data: room,
      message: `Room is now ${room.isActive ? 'Active' : 'Deactivated'}`
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a room (or deactivate if has history)
// @route   DELETE /api/rooms/:id
// @access  Private / Admin
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Check if active reservations exist
    const hasActiveReservations = await Reservation.findOne({
      room: room._id,
      reservationStatus: { $in: ['Pending', 'Confirmed', 'Checked-In'] }
    });

    if (hasActiveReservations) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete room with active upcoming reservations. You may deactivate it instead.'
      });
    }

    await Room.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  toggleRoomActive,
  deleteRoom
};

