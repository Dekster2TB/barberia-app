const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Rutas Públicas
router.get('/available', bookingController.getAvailability);
router.post('/', bookingController.createReservation);

// 👇 RUTA NUEVA: GET /api/bookings
router.get('/', bookingController.getBookings); 

module.exports = router;