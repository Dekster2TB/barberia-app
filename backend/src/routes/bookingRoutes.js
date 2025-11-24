const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware'); // <-- IMPORTAR

// Rutas Públicas (Cualquiera puede ver disponibilidad y reservar)
router.get('/available', bookingController.getAvailability);
router.post('/', bookingController.createReservation);

// ⚠️ RUTA PROTEGIDA: Solo si el token es válido Y tiene rol 'admin'
router.get('/', protect, admin, bookingController.getBookings); // <-- APLICAR MIDDLEWARE

module.exports = router;