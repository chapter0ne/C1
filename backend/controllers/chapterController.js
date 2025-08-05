const Chapter = require('../models/Chapter');

exports.createChapter = async (req, res, next) => {
  try {
    const chapter = new Chapter({
      book: req.body.book,
      title: req.body.title,
      content: req.body.content
    });
    await chapter.save();
    res.status(201).json(chapter);
  } catch (err) {
    next(err);
  }
};

exports.getChaptersByBook = async (req, res, next) => {
  try {
    const chapters = await Chapter.find({ book: req.params.bookId }).sort('chapterOrder');
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