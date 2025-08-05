const express = require('express');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const chapterController = require('../controllers/chapterController');
const router = express.Router();

router.post('/', authMiddleware, adminOnly, chapterController.createChapter);
router.get('/book/:bookId', chapterController.getChaptersByBook);
router.get('/', async (req, res, next) => {
  const { bookId } = req.query;
  if (!bookId) {
    return res.status(400).json({ message: 'bookId is required' });
  }
  try {
    const chapters = await require('../models/Chapter').find({ book: bookId }).sort('chapterOrder');
    res.json(chapters);
  } catch (err) {
    next(err);
  }
});
router.put('/:id', authMiddleware, adminOnly, chapterController.updateChapter);
router.delete('/:id', authMiddleware, adminOnly, chapterController.deleteChapter);

module.exports = router; 