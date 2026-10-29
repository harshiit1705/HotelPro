const mongoose = require('mongoose');
const { RoomModel: MemoryRoomModel } = require('../config/memoryDb');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Please provide a room number'],
      unique: true,
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a room title/name'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Please provide a room type'],
      enum: ['Single', 'Double', 'Suite', 'Deluxe', 'Family', 'Presidential'],
      default: 'Deluxe'
    },
    description: {
      type: String,
      required: [true, 'Please provide a description of the room'],
      trim: true
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Please provide the price per night'],
      min: [0, 'Price must be non-negative']
    },
    maxGuests: {
      type: Number,
      required: [true, 'Please provide maximum guest capacity'],
      min: [1, 'Maximum guests must be at least 1'],
      default: 2
    },
    bedType: {
      type: String,
      default: 'King Bed'
    },
    sizeSqFt: {
      type: Number,
      default: 450
    },
    amenities: {
      type: [String],
      default: ['High-Speed Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Mini Bar', 'Room Service']
    },
    images: {
      type: [String],
      default: ['/images/img_1.jpg']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const MongooseRoom = mongoose.models.Room || mongoose.model('Room', roomSchema);

const RoomProxy = new Proxy(MongooseRoom, {
  get(target, prop) {
    if (global.USE_IN_MEMORY_DB) {
      return MemoryRoomModel[prop];
    }
    return target[prop];
  }
});

module.exports = RoomProxy;
