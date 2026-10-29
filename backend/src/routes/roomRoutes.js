const express = require('express');
const router = express.Router();
const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  toggleRoomActive,
  deleteRoom
} = require('../controllers/roomController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getRooms);
router.get('/:id', getRoomById);

// Admin-only operations
router.post('/', protect, adminOnly, createRoom);
router.put('/:id', protect, adminOnly, updateRoom);
router.patch('/:id/toggle-active', protect, adminOnly, toggleRoomActive);
router.delete('/:id', protect, adminOnly, deleteRoom);

module.exports = router;

