
const express = require('express');
const router = express.Router();
const controller = require('../controllers/alerts.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
router.use(authMiddleware);
router.get('/', controller.getAll);
router.patch('/:id/resolve', controller.resolveAlert);
module.exports = router;
