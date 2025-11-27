const express = require('express');
const router = express.Router();
const managementController = require('../controllers/managementController');
const { protect, developer } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// --- GESTIÓN DE SERVICIOS ---

// POST: Crear nuevo servicio (Imagen opcional)
router.post('/services', protect, developer, upload.single('image'), managementController.createService);

// PUT: Actualizar servicio (Imagen opcional) - 👇 ESTA ES LA RUTA CRÍTICA
router.put('/services/:id', protect, developer, upload.single('image'), managementController.updateService);

// DELETE: Eliminar servicio
router.delete('/services/:id', protect, developer, managementController.deleteService);


// --- GESTIÓN DE BARBEROS ---

router.post('/barbers', protect, developer, upload.single('image'), managementController.createBarber);
router.delete('/barbers/:id', protect, developer, managementController.deleteBarber);

module.exports = router;