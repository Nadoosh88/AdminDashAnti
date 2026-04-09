
const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboard.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
router.get('/stats', authMiddleware, controller.getStats);
module.exports = router;
