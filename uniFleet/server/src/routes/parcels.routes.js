
const express = require('express');
const router = express.Router();
const controller = require('../controllers/parcels.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
router.use(authMiddleware);
router.get('/', controller.getAll);
router.post('/', controller.create);
router.patch('/:id/status', controller.updateStatus);
router.delete('/:id', controller.remove);
module.exports = router;
