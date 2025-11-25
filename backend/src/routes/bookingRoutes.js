const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

// ============================================================
// ⚠️ REGLA DE ORO: Las rutas específicas van PRIMERO
// ============================================================

// 1. Rutas Públicas Específicas
router.get('/available', bookingController.getAvailability);
router.get('/my-bookings', bookingController.getClientBookings); // <--- AQUÍ ARRIBA, ANTES DE /:id

// 2. Crear Reserva
router.post('/', bookingController.createReservation);

// 3. Acciones Específicas (que no chocan con /:id porque tienen /cancel/)
router.patch('/cancel/:id', bookingController.cancelClientBooking);

// ============================================================
// ⚠️ Las rutas con parámetros dinámicos (/:id) van AL FINAL
// ============================================================

// 4. Rutas de Admin
// GET /api/bookings/ (Raíz del recurso)
router.get('/', protect, admin, bookingController.getBookings); 

// PATCH /api/bookings/:id (Esta captura cualquier cosa después de la barra)
router.patch('/:id', protect, admin, bookingController.updateBookingStatus); 

module.exports = router;