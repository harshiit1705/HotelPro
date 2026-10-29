const express = require('express');
const router = express.Router();
const {
  getDashboardMetrics,
  getAllReservations,
  updateReservationStatus,
  getAllGuests
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All administrative endpoints require valid admin token
router.use(protect, adminOnly);

router.get('/metrics', getDashboardMetrics);
router.get('/reservations', getAllReservations);
router.patch('/reservations/:id/status', updateReservationStatus);
router.get('/guests', getAllGuests);

module.exports = router;

