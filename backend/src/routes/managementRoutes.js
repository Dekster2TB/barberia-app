const express = require('express');
const router = express.Router();
const managementController = require('../controllers/managementController');
const { protect, developer } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// Todas estas rutas requieren:
// 1. protect: Estar logueado (Token válido).
// 2. developer: Tener rol 'developer' (Admin financiero/técnico).
// 3. upload.single('image'): Permite subir una foto a Cloudinary.

// --- GESTIÓN DE SERVICIOS ---

// Crear nuevo servicio (con imagen opcional)
router.post('/services', protect, developer, upload.single('image'), managementController.createService);

// Actualizar servicio existente (con imagen opcional)
router.put('/services/:id', protect, developer, upload.single('image'), managementController.updateService);

// Eliminar servicio
router.delete('/services/:id', protect, developer, managementController.deleteService);


// --- GESTIÓN DE BARBEROS ---

// Contratar nuevo barbero (con foto opcional)
router.post('/barbers', protect, developer, upload.single('image'), managementController.createBarber);

// Actualizar barbero existente (con foto opcional)
router.put('/barbers/:id', protect, developer, upload.single('image'), managementController.updateBarber);

// Despedir/Eliminar barbero
router.delete('/barbers/:id', protect, developer, managementController.deleteBarber);

module.exports = router;