const express = require('express');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const userController = require('../controllers/userController');
const router = express.Router();

router.get('/', authMiddleware, adminOnly, userController.getAllUsers);
router.get('/search', (req, res, next) => {
  console.log('[USERS SEARCH ROUTE] Path:', req.path);
  console.log('[USERS SEARCH ROUTE] Headers:', req.headers);
  console.log('[USERS SEARCH ROUTE] Query:', req.query);
  next();
}, authMiddleware, userController.searchUsers);
router.get('/:username', authMiddleware, adminOnly, userController.getUserByUsername);
router.put('/:username', authMiddleware, adminOnly, userController.updateUserByUsername);
router.delete('/:username', authMiddleware, adminOnly, userController.deleteUserByUsername);
router.post('/:username/follow', authMiddleware, userController.followUserByUsername);
router.post('/:username/unfollow', authMiddleware, userController.unfollowUserByUsername);
router.get('/:username/followers', authMiddleware, userController.getFollowersByUsername);
router.get('/:username/following', authMiddleware, userController.getFollowingByUsername);

module.exports = router; 