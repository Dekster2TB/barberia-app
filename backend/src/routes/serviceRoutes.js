const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// GET /api/services -> Llama a getServices
// Verificamos que la función exista antes de asignarla
if (!serviceController.getServices) {
    throw new Error('Error: La función getServices no está definida en serviceController.');
}

router.get('/', serviceController.getServices);

module.exports = router;