const Notification = require('../models/Notification');

exports.createNotification = async (req, res, next) => {
  try {
    const notification = new Notification({ ...req.body, sentBy: req.user.userId });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    next(err);
  }
};

exports.getAllNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

exports.getNotificationById = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    next(err);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const notificationId = req.params.id;
    const user = req.user;
    console.log('[deleteNotification] Attempting to delete notification:', notificationId, 'by user:', user ? user.userId : 'none');
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      console.log('[deleteNotification] Notification not found:', notificationId);
      return res.status(404).json({ message: 'Notification not found' });
    }
    // Log userId and notification.recipient for debugging
    console.log('[deleteNotification] userId:', user.userId, 'notification.recipient:', notification.recipient.toString());
    // Use .equals() for ObjectId comparison
    if (user && !notification.recipient.equals(user.userId)) {
      console.log('[deleteNotification] User not authorized to delete this notification:', notificationId);
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }
    await Notification.findByIdAndDelete(notificationId);
    console.log('[deleteNotification] Notification deleted:', notificationId);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error('[deleteNotification] Error:', err);
    next(err);
  }
}; 