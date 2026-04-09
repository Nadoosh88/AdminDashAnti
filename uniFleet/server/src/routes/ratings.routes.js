
const express = require('express');
const router = express.Router();
const controller = require('../controllers/ratings.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
router.use(authMiddleware);
router.get('/analytics', controller.getAnalytics);
router.get('/comments', controller.getComments);
module.exports = router;
