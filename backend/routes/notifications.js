const express = require('express');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');
const router = express.Router();

router.post('/', authMiddleware, adminOnly, notificationController.createNotification);
router.get('/', authMiddleware, notificationController.getAllNotifications);
router.get('/:id', authMiddleware, notificationController.getNotificationById);
router.delete('/:id', authMiddleware, adminOnly, notificationController.deleteNotification);

module.exports = router; 