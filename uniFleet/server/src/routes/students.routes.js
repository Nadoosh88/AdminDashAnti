
const express = require('express');
const router = express.Router();
const controller = require('../controllers/students.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
router.use(authMiddleware);
router.get('/', controller.getAll);
router.get('/leaderboard', controller.getLeaderboard);
router.post('/blacklist-manual', controller.createManual);
router.post('/:id/blacklist', controller.blacklist);
router.delete('/:id/blacklist', controller.liftBlacklist);
router.delete('/:id', controller.removeStudent);
module.exports = router;
