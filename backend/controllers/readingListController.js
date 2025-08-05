const ReadingList = require('../models/ReadingList');
const ReadingListComment = require('../models/ReadingListComment');
const User = require('../models/User');
const Book = require('../models/Book');

// Create a new reading list
exports.createReadingList = async (req, res) => {
  try {
    const { title, description, books, isPublic = true, tags, category } = req.body;
    const userId = req.user.userId; // Changed from req.user.id to req.user.userId

    if (!title || !books || books.length === 0) {
      return res.status(400).json({ message: 'Title and at least one book are required' });
    }

    if (books.length > 20) {
      return res.status(400).json({ message: 'Reading list cannot contain more than 20 books' });
    }

    const readingList = new ReadingList({
      title,
      description,
      creator: userId,
      books: books.map((bookId, index) => ({
        book: bookId,
        order: index
      })),
      isPublic,
      tags,
      category
    });

    await readingList.save();
    await readingList.populate('creator', 'username avatarUrl streakCount');
    await readingList.populate('books.book', 'title author coverImageUrl');

    res.status(201).json(readingList);
  } catch (error) {
    res.status(500).json({ message: 'Error creating reading list', error: error.message });
  }
};

// Get all reading lists (public ones)
exports.getReadingLists = async (req, res) => {
  try {
    const { page = 1, limit = 10, creator, category } = req.query;
    const skip = (page - 1) * limit;

    let query = { isPublic: true };
    if (creator) query.creator = creator;
    if (category) query.category = category;

    const readingLists = await ReadingList.find(query)
      .populate('creator', 'username avatarUrl streakCount')
      .populate('books.book', 'title author coverImageUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ReadingList.countDocuments(query);

    res.json({
      readingLists,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reading lists', error: error.message });
  }
};

// Get a specific reading list
exports.getReadingList = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId; // Changed from req.user.id to req.user.userId

    const readingList = await ReadingList.findById(id)
      .populate('creator', 'username avatarUrl streakCount bio')
      .populate('books.book', 'title author coverImageUrl description price isFree')
      .populate('followers', 'username avatarUrl');

    if (!readingList) {
      return res.status(404).json({ message: 'Reading list not found' });
    }

    // Check if user can view (public or creator)
    if (!readingList.isPublic && readingList.creator._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Increment view count
    readingList.viewCount += 1;
    await readingList.save();

    res.json(readingList);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reading list', error: error.message });
  }
};

// Update reading list
exports.updateReadingList = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId; // Changed from req.user.id to req.user.userId
    const { title, description, books, isPublic, tags, category } = req.body;

    const readingList = await ReadingList.findById(id);
    if (!readingList) {
      return res.status(404).json({ message: 'Reading list not found' });
    }

    if (readingList.creator.toString() !== userId) {
      return res.status(403).json({ message: 'Only the creator can update this reading list' });
    }

    if (books && books.length > 20) {
      return res.status(400).json({ message: 'Reading list cannot contain more than 20 books' });
    }

    const updates = {};
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (isPublic !== undefined) updates.isPublic = isPublic;
    if (tags) updates.tags = tags;
    if (category) updates.category = category;
    if (books) {
      updates.books = books.map((bookId, index) => ({
        book: bookId,
        order: index
      }));
    }

    const updatedList = await ReadingList.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    ).populate('creator', 'username avatarUrl streakCount')
     .populate('books.book', 'title author coverImageUrl');

    res.json(updatedList);
  } catch (error) {
    res.status(500).json({ message: 'Error updating reading list', error: error.message });
  }
};

// Delete reading list
exports.deleteReadingList = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId; // Changed from req.user.id to req.user.userId

    const readingList = await ReadingList.findById(id);
    if (!readingList) {
      return res.status(404).json({ message: 'Reading list not found' });
    }

    if (readingList.creator.toString() !== userId) {
      return res.status(403).json({ message: 'Only the creator can delete this reading list' });
    }

    // Delete associated comments
    await ReadingListComment.deleteMany({ readingList: id });

    await ReadingList.findByIdAndDelete(id);
    res.json({ message: 'Reading list deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting reading list', error: error.message });
  }
};

// Follow/unfollow reading list
exports.toggleFollowReadingList = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId; // Changed from req.user.id to req.user.userId

    const readingList = await ReadingList.findById(id);
    if (!readingList) {
      return res.status(404).json({ message: 'Reading list not found' });
    }

    const isFollowing = readingList.followers.includes(userId);
    
    if (isFollowing) {
      readingList.followers = readingList.followers.filter(follower => follower.toString() !== userId);
    } else {
      readingList.followers.push(userId);
    }

    await readingList.save();
    await readingList.populate('followers', 'username avatarUrl');

    res.json({
      isFollowing: !isFollowing,
      followerCount: readingList.followers.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling follow status', error: error.message });
  }
};

// Add comment to reading list
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId; // Changed from req.user.id to req.user.userId
    const { content, parentComment } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    if (content.length > 500) {
      return res.status(400).json({ message: 'Comment cannot exceed 500 characters' });
    }

    const readingList = await ReadingList.findById(id);
    if (!readingList) {
      return res.status(404).json({ message: 'Reading list not found' });
    }

    const comment = new ReadingListComment({
      readingList: id,
      user: userId,
      content: content.trim(),
      parentComment
    });

    await comment.save();
    await comment.populate('user', 'username avatarUrl');

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
};

// Get comments for reading list
exports.getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const comments = await ReadingListComment.find({ readingList: id })
      .populate('user', 'username avatarUrl')
      .populate('parentComment')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ReadingListComment.countDocuments({ readingList: id });

    res.json({
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
};

// Get user's reading lists
exports.getUserReadingLists = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId; // Changed from req.user.id to req.user.userId
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { creator: userId };
    
    // If viewing own lists, show all. If viewing others, show only public
    if (userId !== currentUserId) {
      query.isPublic = true;
    }

    const readingLists = await ReadingList.find(query)
      .populate('creator', 'username avatarUrl streakCount')
      .populate('books.book', 'title author coverImageUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ReadingList.countDocuments(query);

    res.json({
      readingLists,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user reading lists', error: error.message });
  }
}; 