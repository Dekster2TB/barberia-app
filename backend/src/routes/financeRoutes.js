const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { protect, developer } = require('../middleware/authMiddleware');

// GET /api/finance/stats (Solo Dev)
router.get('/stats', protect, developer, financeController.getMonthlyStats);

module.exports = router;