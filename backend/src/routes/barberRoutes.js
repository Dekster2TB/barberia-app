const express = require('express');
const router = express.Router();
const barberController = require('../controllers/barberController');

// GET /api/barbers -> Devuelve la lista completa de barberos
// Esta ruta es pública para que el cliente pueda elegir su barbero preferido
router.get('/', barberController.getBarbers);

module.exports = router;