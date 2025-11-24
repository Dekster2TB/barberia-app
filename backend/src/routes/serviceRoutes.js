const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// GET /api/services -> Llama a getServices
router.get('/', serviceController.getServices);

// POST /api/services -> Llama a createService
router.post('/', serviceController.createService);

module.exports = router;