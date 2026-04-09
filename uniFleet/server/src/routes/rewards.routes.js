
const express = require('express');
const router = express.Router();
const controller = require('../controllers/rewards.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
router.use(authMiddleware);
router.get('/rules', controller.getRules);
router.put('/rules', controller.updateRules);
module.exports = router;
