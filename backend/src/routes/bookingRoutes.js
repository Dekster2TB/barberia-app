const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

// --- RUTAS PÚBLICAS ---
// Ver disponibilidad
router.get('/available', bookingController.getAvailability);
// Crear una reserva
router.post('/', bookingController.createReservation);

// --- RUTAS PROTEGIDAS (ADMIN) ---
// Ver todas las reservas (Esta es la que usa tu tabla)
router.get('/', protect, admin, bookingController.getBookings); 

// 👇 ESTA ES LA QUE TE FALTA O ESTÁ MAL ESCRITA
// Actualizar estado (Cancelar/Finalizar)
router.patch('/:id', protect, admin, bookingController.updateBookingStatus); 

module.exports = router;