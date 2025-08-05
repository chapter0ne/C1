const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const userNotificationController = require('../controllers/userNotificationController');
const router = express.Router();

router.get('/', authMiddleware, userNotificationController.getUserNotifications);
router.delete('/:id', authMiddleware, userNotificationController.deleteUserNotification);

module.exports = router; 