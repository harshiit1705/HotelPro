const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  getReservationById,
  cancelReservation,
  payReservation
} = require('../controllers/reservationController');
const { protect } = require('../middleware/auth');

// All reservation endpoints require authenticated session
router.use(protect);

router.post('/', createReservation);
router.get('/my', getMyReservations);
router.get('/:id', getReservationById);
router.put('/:id/cancel', cancelReservation);
router.post('/:id/pay', payReservation);

module.exports = router;

