const User = require('../models/User');
const UserLibrary = require('../models/UserLibrary');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash');
    
    // Get library counts for all users
    const userIds = users.map(user => user._id);
    const libraryCounts = await UserLibrary.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', count: { $sum: 1 } } }
    ]);
    
    // Create a map of userId to library count
    const libraryCountMap = {};
    libraryCounts.forEach(item => {
      libraryCountMap[item._id.toString()] = item.count;
    });
    
    // Add library count to each user
    const usersWithLibraryCount = users.map(user => {
      const userObj = user.toObject();
      userObj.libraryCount = libraryCountMap[user._id.toString()] || 0;
      return userObj;
    });
    
    res.json(usersWithLibraryCount);
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

// --- New Social/Search Features ---
exports.searchUsers = async (req, res, next) => {
  try {
    console.log('[searchUsers] Query:', req.query);
    const { role, query } = req.query;
    const filter = {};
    if (role) filter.roles = role;
    if (query) filter.$or = [
      { username: { $regex: query, $options: 'i' } },
      { fullName: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ];
    console.log('[searchUsers] Filter:', filter);
    const users = await User.find(filter).select('-passwordHash').limit(20);
    res.json(users);
  } catch (err) {
    console.error('[searchUsers] Error:', err);
    next(err);
  }
};

exports.followUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const userId = req.user.userId;
    if (userId === targetId) return res.status(400).json({ message: 'Cannot follow yourself' });
    const user = await User.findById(userId);
    const target = await User.findById(targetId);
    if (!user || !target) return res.status(404).json({ message: 'User not found' });
    if (!user.following.includes(targetId)) user.following.push(targetId);
    if (!target.followers.includes(userId)) target.followers.push(userId);
    await user.save();
    await target.save();
    res.json({ message: 'Followed', followerCount: target.followers.length });
  } catch (err) {
    next(err);
  }
};

exports.unfollowUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const userId = req.user.userId;
    if (userId === targetId) return res.status(400).json({ message: 'Cannot unfollow yourself' });
    const user = await User.findById(userId);
    const target = await User.findById(targetId);
    if (!user || !target) return res.status(404).json({ message: 'User not found' });
    user.following = user.following.filter(id => id.toString() !== targetId);
    target.followers = target.followers.filter(id => id.toString() !== userId);
    await user.save();
    await target.save();
    res.json({ message: 'Unfollowed', followerCount: target.followers.length });
  } catch (err) {
    next(err);
  }
};

exports.getFollowers = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'username fullName avatarUrl roles').select('followers');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ followers: user.followers, count: user.followers.length });
  } catch (err) {
    next(err);
  }
};

exports.getFollowing = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'username fullName avatarUrl roles').select('following');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ following: user.following, count: user.following.length });
  } catch (err) {
    next(err);
  }
};

// Username-based versions
exports.getUserByUsername = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateUserByUsername = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate({ username: req.params.username }, req.body, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.deleteUserByUsername = async (req, res, next) => {
  try {
    const user = await User.findOneAndDelete({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

exports.followUserByUsername = async (req, res, next) => {
  try {
    const targetUsername = req.params.username;
    const userId = req.user.userId;
    const user = await User.findById(userId);
    const target = await User.findOne({ username: targetUsername });
    if (!user || !target) return res.status(404).json({ message: 'User not found' });
    if (user.username === targetUsername) return res.status(400).json({ message: 'Cannot follow yourself' });
    if (!user.following.includes(target._id)) user.following.push(target._id);
    if (!target.followers.includes(user._id)) target.followers.push(user._id);
    await user.save();
    await target.save();
    res.json({ message: 'Followed', followerCount: target.followers.length });
  } catch (err) {
    next(err);
  }
};

exports.unfollowUserByUsername = async (req, res, next) => {
  try {
    const targetUsername = req.params.username;
    const userId = req.user.userId;
    const user = await User.findById(userId);
    const target = await User.findOne({ username: targetUsername });
    if (!user || !target) return res.status(404).json({ message: 'User not found' });
    if (user.username === targetUsername) return res.status(400).json({ message: 'Cannot unfollow yourself' });
    user.following = user.following.filter(id => id.toString() !== target._id.toString());
    target.followers = target.followers.filter(id => id.toString() !== user._id.toString());
    await user.save();
    await target.save();
    res.json({ message: 'Unfollowed', followerCount: target.followers.length });
  } catch (err) {
    next(err);
  }
};

exports.getFollowersByUsername = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username }).populate('followers', 'username fullName avatarUrl roles').select('followers');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ followers: user.followers, count: user.followers.length });
  } catch (err) {
    next(err);
  }
};

exports.getFollowingByUsername = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username }).populate('following', 'username fullName avatarUrl roles').select('following');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ following: user.following, count: user.following.length });
  } catch (err) {
    next(err);
  }
}; 