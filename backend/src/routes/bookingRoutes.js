const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// GET /api/bookings/available?date=YYYY-MM-DD
router.get('/available', bookingController.getAvailability);

// POST /api/bookings
router.post('/', bookingController.createReservation);

module.exports = router;