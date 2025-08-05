const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Get current user's profile (authenticated users can access their own profile)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update current user's profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { fullName, bio, avatarUrl } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { fullName, bio, avatarUrl },
      { new: true, runValidators: true }
    ).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's reading lists (placeholder - will be implemented with ReadingList model)
router.get('/reading-lists', authMiddleware, async (req, res) => {
  try {
    // For now, return empty array until ReadingList model is implemented
    res.json([]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new reading list
router.post('/reading-lists', authMiddleware, async (req, res) => {
  try {
    // For now, return placeholder until ReadingList model is implemented
    res.status(501).json({ message: 'Reading lists not yet implemented' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 