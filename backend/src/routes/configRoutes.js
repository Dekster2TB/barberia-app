const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

// Rutas: /api/config
router.get('/', configController.getConfig);
router.put('/', configController.updateConfig); // Podrías agregar middleware de auth aquí si quieres protegerlo

module.exports = router;