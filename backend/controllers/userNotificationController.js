const User = require('../models/User');
const UserNotification = require('../models/UserNotification');
const mongoose = require('mongoose');

// Send follow request
exports.sendFollowRequest = async (req, res, next) => {
  try {
    const targetUsername = req.params.username;
    const requesterId = req.user.userId;
    const target = await User.findOne({ username: targetUsername });
    const requesterUser = await User.findById(requesterId);
    if (!target || !requesterUser) return res.status(404).json({ message: 'User not found' });
    if (target._id.equals(requesterId)) return res.status(400).json({ message: 'Cannot follow yourself' });
    // Prevent duplicate requests
    const alreadyRequested = target.followRequests.some(r => r.requester.equals(requesterId) && r.status === 'pending');
    if (alreadyRequested) return res.status(400).json({ message: 'Request already sent' });
    // Add request
    target.followRequests.push({ requester: requesterId, status: 'pending' });
    await target.save();
    // Prevent duplicate notifications
    const existingNotif = await UserNotification.findOne({
      recipient: target._id,
      type: 'follow_request',
      'data.requester': requesterId,
      isRead: false
    });
    if (existingNotif) {
    } else {
      await UserNotification.create({
        recipient: target._id,
        type: 'follow_request',
        title: 'New Follow Request',
        message: 'You have a new follow request',
        data: {
          requester: requesterId,
          requesterUsername: requesterUser.username,
          requesterName: requesterUser.fullName || requesterUser.username
        }
      });
    }
    res.json({ message: 'Follow request sent' });
  } catch (err) {
    next(err);
  }
};

// Accept follow request
exports.acceptFollowRequest = async (req, res, next) => {
  try {
    const targetUsername = req.params.username;
    const requesterUsername = req.params.requester;
    const target = await User.findOne({ username: targetUsername });
    const requester = await User.findOne({ username: requesterUsername });
    if (!target || !requester) return res.status(404).json({ message: 'User not found' });
    // Find request
    const request = target.followRequests.find(r => r.requester.equals(requester._id) && r.status === 'pending');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    request.status = 'accepted';
    // Add to followers/following
    if (!target.followers.includes(requester._id)) target.followers.push(requester._id);
    if (!requester.following.includes(target._id)) requester.following.push(target._id);
    await target.save();
    await requester.save();
    // Create notification for requester
    await UserNotification.create({
      recipient: requester._id,
      type: 'follow_accepted',
      title: 'Follow Request Accepted',
      message: `${target.username} accepted your follow request`,
      data: { accepter: target._id }
    });
    // Remove original follow request notification
    await UserNotification.deleteMany({
      recipient: target._id,
      type: 'follow_request',
      'data.requester': requester._id
    });
    res.json({ message: 'Follow request accepted' });
  } catch (err) {
    next(err);
  }
};

// Reject follow request
exports.rejectFollowRequest = async (req, res, next) => {
  try {
    const targetUsername = req.params.username;
    const requesterUsername = req.params.requester;
    const target = await User.findOne({ username: targetUsername });
    const requester = await User.findOne({ username: requesterUsername });
    if (!target || !requester) return res.status(404).json({ message: 'User not found' });
    // Find request
    const request = target.followRequests.find(r => r.requester.equals(requester._id) && r.status === 'pending');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    request.status = 'rejected';
    await target.save();
    // Create notification for requester
    await UserNotification.create({
      recipient: requester._id,
      type: 'follow_rejected',
      title: 'Follow Request Rejected',
      message: `${target.username} rejected your follow request`,
      data: { rejecter: target._id }
    });
    // Remove original follow request notification
    await UserNotification.deleteMany({
      recipient: target._id,
      type: 'follow_request',
      'data.requester': requester._id
    });
    res.json({ message: 'Follow request rejected' });
  } catch (err) {
    next(err);
  }
};

// Get notifications for logged-in user
exports.getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const notifications = await UserNotification.find({ recipient: userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

// Delete notification (only recipient)
exports.deleteUserNotification = async (req, res, next) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.userId;
    const notification = await UserNotification.findById(notificationId);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    if (!notification.recipient.equals(userId)) return res.status(403).json({ message: 'Not authorized to delete this notification' });
    await UserNotification.findByIdAndDelete(notificationId);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
}; 