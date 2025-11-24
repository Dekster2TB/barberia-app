const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/login - Iniciar sesión (Público)
router.post('/login', authController.login);

// PATCH /api/auth/change-password - Cambiar clave (Protegido)
router.patch('/change-password', protect, authController.changePassword);

module.exports = router;