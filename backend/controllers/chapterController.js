const Chapter = require('../models/Chapter');
const { resolveBookId } = require('../utils/resolveBookId');

exports.createChapter = async (req, res, next) => {
  try {
    const chapter = new Chapter({
      book: req.body.book,
      title: req.body.title,
      content: req.body.content,
      order: req.body.order // Save chapter order
    });
    await chapter.save();
    res.status(201).json(chapter);
  } catch (err) {
    next(err);
  }
};

exports.getChaptersByBook = async (req, res, next) => {
  try {
    const bookIdResolved = await resolveBookId(req.params.bookId);
    if (!bookIdResolved) return res.status(404).json({ message: 'Book not found' });
    const chapters = await Chapter.find({ book: bookIdResolved }).sort('order');
    res.json(chapters);
  } catch (err) {
    next(err);
  }
};

exports.updateChapter = async (req, res, next) => {
  try {
    const chapter = await Chapter.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        content: req.body.content
      },
      { new: true }
    );
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
    res.json(chapter);
  } catch (err) {
    next(err);
  }
};

exports.deleteChapter = async (req, res, next) => {
  try {
    const chapter = await Chapter.findByIdAndDelete(req.params.id);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
    res.json({ message: 'Chapter deleted' });
  } catch (err) {
    next(err);
  }
};