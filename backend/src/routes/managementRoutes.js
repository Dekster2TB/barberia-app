const express = require('express');
const router = express.Router();
const managementController = require('../controllers/managementController');
const { protect, developer } = require('../middleware/authMiddleware'); // Solo Devs
const { upload } = require('../config/cloudinary'); // Middleware de subida

// Todas las rutas requieren:
// 1. Estar logueado (protect)
// 2. Ser Desarrollador (developer)

// --- SERVICIOS ---
// POST: Crear servicio (soporta imagen)
router.post('/services', protect, developer, upload.single('image'), managementController.createService);
// DELETE: Borrar servicio
router.delete('/services/:id', protect, developer, managementController.deleteService);

// --- BARBEROS ---
// POST: Contratar barbero (soporta imagen)
router.post('/barbers', protect, developer, upload.single('image'), managementController.createBarber);
// DELETE: Despedir barbero
router.delete('/barbers/:id', protect, developer, managementController.deleteBarber);

module.exports = router;