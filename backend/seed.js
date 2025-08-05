const mongoose = require('mongoose');
const Book = require('./models/Book');
const Chapter = require('./models/Chapter');
require('dotenv').config();

// Mock books data
const mockBooks = [
  // Romance Books
  {
    title: 'Love in the Digital Age',
    author: 'Sarah Johnson',
    description: 'A modern romance about finding love in the age of social media.',
    genre: 'Romance',
    cover_image_url: '/placeholder.svg',
    price: 2500,
    is_free: false,
    status: 'published',
    tags: ['romance', 'love', 'digital', 'modern'],
    created_at: new Date('2024-01-15T00:00:00Z'),
    chapters: [
      {
        title: 'First Swipe',
        content: 'Emma stared at her phone screen, wondering if she should swipe right...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'The Billionaire\'s Heart',
    author: 'Maria Rodriguez',
    description: 'A steamy romance between a CEO and his assistant.',
    genre: 'Romance',
    cover_image_url: '/placeholder.svg',
    price: 4156,
    is_free: false,
    status: 'published',
    tags: ['romance', 'billionaire', 'office', 'steamy'],
    created_at: new Date('2024-01-20T00:00:00Z'),
    chapters: [
      {
        title: 'The Interview',
        content: 'Alexandra walked into the towering office building, her heart racing...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'Summer Love Letters',
    author: 'James Wilson',
    description: 'A sweet romance about pen pals who fall in love.',
    genre: 'Romance',
    cover_image_url: '/placeholder.svg',
    price: 2912,
    is_free: false,
    status: 'published',
    tags: ['romance', 'letters', 'summer', 'sweet'],
    created_at: new Date('2024-01-25T00:00:00Z'),
    chapters: [
      {
        title: 'Dear Stranger',
        content: 'The first letter arrived on a warm June morning...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'Free Romance Collection',
    author: 'Emma Davis',
    description: 'A collection of free romantic short stories.',
    genre: 'Romance',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    status: 'published',
    tags: ['romance', 'free', 'short stories', 'collection'],
    created_at: new Date('2024-02-01T00:00:00Z'),
    chapters: [
      {
        title: 'Coffee Shop Encounter',
        content: 'She spilled her coffee on his laptop...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'The Wedding Planner',
    author: 'Lisa Chen',
    description: 'A romance about a wedding planner who falls for a client.',
    genre: 'Romance',
    cover_image_url: '/placeholder.svg',
    price: 5364,
    is_free: false,
    status: 'published',
    tags: ['romance', 'wedding', 'planner', 'professional'],
    created_at: new Date('2024-02-05T00:00:00Z'),
    chapters: [
      {
        title: 'The First Meeting',
        content: 'Sophie had planned hundreds of weddings, but this one felt different...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'Love in Paris',
    author: 'Pierre Dubois',
    description: 'A romantic tale set in the City of Light.',
    genre: 'Romance',
    cover_image_url: '/placeholder.svg',
    price: 3455,
    is_free: false,
    status: 'published',
    tags: ['romance', 'paris', 'travel', 'french'],
    created_at: new Date('2024-02-10T00:00:00Z'),
    chapters: [
      {
        title: 'Arrival in Paris',
        content: 'The Eiffel Tower sparkled in the distance as Claire stepped off the train...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'The Doctor\'s Heart',
    author: 'Dr. Michael Brown',
    description: 'A medical romance about love in the emergency room.',
    genre: 'Romance',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    status: 'published',
    tags: ['romance', 'medical', 'doctor', 'free'],
    created_at: new Date('2024-02-15T00:00:00Z'),
    chapters: [
      {
        title: 'Emergency Room',
        content: 'The emergency room was chaos, but Dr. Sarah couldn\'t help but notice...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'Second Chance Love',
    author: 'Jennifer Smith',
    description: 'A story about rekindling an old flame.',
    genre: 'Romance',
    cover_image_url: '/placeholder.svg',
    price: 1590,
    is_free: false,
    status: 'published',
    tags: ['romance', 'second chance', 'reunion', 'nostalgia'],
    created_at: new Date('2024-02-20T00:00:00Z'),
    chapters: [
      {
        title: 'The Reunion',
        content: 'Ten years had passed since they last saw each other...',
        chapter_order: 1
      }
    ]
  },

  // Horror Books
  {
    title: 'The Haunted Mansion',
    author: 'Stephen Black',
    description: 'A family moves into a house with a dark secret.',
    genre: 'Horror',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    status: 'published',
    tags: ['horror', 'haunted', 'mansion', 'ghost'],
    created_at: new Date('2024-01-10T00:00:00Z'),
    chapters: [
      {
        title: 'Moving Day',
        content: 'The movers carried the last box into the old Victorian house...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'The Last Patient',
    author: 'Dr. Emily White',
    description: 'A psychiatrist discovers her patients are disappearing.',
    genre: 'Horror',
    cover_image_url: '/placeholder.svg',
    price: 5848,
    is_free: false,
    status: 'published',
    tags: ['horror', 'psychological', 'thriller', 'medical'],
    created_at: new Date('2024-01-12T00:00:00Z'),
    chapters: [
      {
        title: 'Session One',
        content: 'Dr. White opened her notebook and looked at her new patient...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'The Forest Calls',
    author: 'Robert Green',
    description: 'A camping trip turns into a nightmare.',
    genre: 'Horror',
    cover_image_url: '/placeholder.svg',
    price: 1422,
    is_free: false,
    status: 'published',
    tags: ['horror', 'forest', 'camping', 'survival'],
    created_at: new Date('2024-01-18T00:00:00Z'),
    chapters: [
      {
        title: 'The Hike',
        content: 'The trail seemed endless as the group ventured deeper into the woods...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'Free Horror Collection',
    author: 'Various Authors',
    description: 'A collection of spine-chilling horror stories.',
    genre: 'Horror',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    status: 'published',
    tags: ['horror', 'free', 'collection', 'short stories'],
    created_at: new Date('2024-01-22T00:00:00Z'),
    chapters: [
      {
        title: 'The Mirror',
        content: 'She looked into the mirror and saw something that wasn\'t her reflection...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'The Asylum',
    author: 'Thomas Gray',
    description: 'A journalist investigates an abandoned mental hospital.',
    genre: 'Horror',
    cover_image_url: '/placeholder.svg',
    price: 2954,
    is_free: false,
    status: 'published',
    tags: ['horror', 'asylum', 'investigation', 'psychological'],
    created_at: new Date('2024-01-28T00:00:00Z'),
    chapters: [
      {
        title: 'The Investigation',
        content: 'The old asylum loomed before him, its windows like hollow eyes...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'The Doll House',
    author: 'Amanda Lee',
    description: 'A child\'s doll house holds a terrifying secret.',
    genre: 'Horror',
    cover_image_url: '/placeholder.svg',
    price: 1385,
    is_free: false,
    status: 'published',
    tags: ['horror', 'doll', 'child', 'supernatural'],
    created_at: new Date('2024-02-02T00:00:00Z'),
    chapters: [
      {
        title: 'The Gift',
        content: 'Little Emma unwrapped her birthday present and found the most beautiful doll house...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'The Last Laugh',
    author: 'Carlos Mendez',
    description: 'A comedian discovers his jokes are coming true.',
    genre: 'Horror',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    status: 'published',
    tags: ['horror', 'comedy', 'supernatural', 'free'],
    created_at: new Date('2024-02-08T00:00:00Z'),
    chapters: [
      {
        title: 'The Joke',
        content: 'Mike told a joke about his neighbor, and the next day...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'The Experiment',
    author: 'Dr. Sarah Kim',
    description: 'A scientist\'s experiment goes horribly wrong.',
    genre: 'Horror',
    cover_image_url: '/placeholder.svg',
    price: 3137,
    is_free: false,
    status: 'published',
    tags: ['horror', 'science', 'experiment', 'laboratory'],
    created_at: new Date('2024-02-12T00:00:00Z'),
    chapters: [
      {
        title: 'Day One',
        content: 'The laboratory was sterile and quiet as Dr. Kim prepared her experiment...',
        chapter_order: 1
      }
    ]
  },

  // Thriller Books
  {
    title: 'The Silent Witness',
    author: 'Detective Mike Johnson',
    description: 'A detective must solve a murder with no evidence.',
    genre: 'Thriller',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    status: 'published',
    tags: ['thriller', 'detective', 'murder', 'mystery'],
    created_at: new Date('2024-01-05T00:00:00Z'),
    chapters: [
      {
        title: 'The Crime Scene',
        content: 'Detective Johnson stood over the body, puzzled by the lack of evidence...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'The Perfect Alibi',
    author: 'Lisa Thompson',
    description: 'A woman creates the perfect alibi for a crime she didn\'t commit.',
    genre: 'Thriller',
    cover_image_url: '/placeholder.svg',
    price: 4200,
    is_free: false,
    status: 'published',
    tags: ['thriller', 'alibi', 'suspense', 'legal'],
    created_at: new Date('2024-01-08T00:00:00Z'),
    chapters: [
      {
        title: 'The Setup',
        content: 'Rachel carefully planned every detail of her alibi...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'The Last Call',
    author: 'David Wilson',
    description: 'A phone call changes everything for a businessman.',
    genre: 'Thriller',
    cover_image_url: '/placeholder.svg',
    price: 3800,
    is_free: false,
    status: 'published',
    tags: ['thriller', 'phone', 'business', 'suspense'],
    created_at: new Date('2024-01-14T00:00:00Z'),
    chapters: [
      {
        title: 'The Call',
        content: 'The phone rang at exactly 3:47 AM...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'The Double Agent',
    author: 'James Bond',
    description: 'A spy must choose between loyalty and love.',
    genre: 'Thriller',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    status: 'published',
    tags: ['thriller', 'spy', 'espionage', 'free'],
    created_at: new Date('2024-01-16T00:00:00Z'),
    chapters: [
      {
        title: 'The Mission',
        content: 'Agent Smith received his orders with a heavy heart...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'The Time Bomb',
    author: 'Robert Chen',
    description: 'A bomb squad races against time to save the city.',
    genre: 'Thriller',
    cover_image_url: '/placeholder.svg',
    price: 5100,
    is_free: false,
    status: 'published',
    tags: ['thriller', 'bomb', 'action', 'emergency'],
    created_at: new Date('2024-01-24T00:00:00Z'),
    chapters: [
      {
        title: 'The Timer',
        content: 'The digital display showed 00:15:32...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'The Witness Protection',
    author: 'Maria Garcia',
    description: 'A witness must disappear to stay alive.',
    genre: 'Thriller',
    cover_image_url: '/placeholder.svg',
    price: 2900,
    is_free: false,
    status: 'published',
    tags: ['thriller', 'witness', 'protection', 'crime'],
    created_at: new Date('2024-01-30T00:00:00Z'),
    chapters: [
      {
        title: 'The Testimony',
        content: 'Sarah\'s hands shook as she prepared to testify...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'The Cyber Attack',
    author: 'Alex Tech',
    description: 'A hacker threatens to bring down the internet.',
    genre: 'Thriller',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    status: 'published',
    tags: ['thriller', 'cyber', 'hacker', 'technology'],
    created_at: new Date('2024-02-03T00:00:00Z'),
    chapters: [
      {
        title: 'The Breach',
        content: 'The first server went down at exactly 9:47 AM...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'The Last Flight',
    author: 'Captain Tom Harris',
    description: 'A pilot must land a plane with a bomb on board.',
    genre: 'Thriller',
    cover_image_url: '/placeholder.svg',
    price: 4400,
    is_free: false,
    status: 'published',
    tags: ['thriller', 'plane', 'pilot', 'action'],
    created_at: new Date('2024-02-07T00:00:00Z'),
    chapters: [
      {
        title: 'Takeoff',
        content: 'Flight 237 began its ascent into the night sky...',
        chapter_order: 1
      }
    ]
  },

  // Fiction Books
  {
    title: 'The Time Traveler\'s Wife',
    author: 'Audrey Niffenegger',
    description: 'A love story that transcends time itself.',
    genre: 'Fiction',
    cover_image_url: '/placeholder.svg',
    price: 3500,
    is_free: false,
    status: 'published',
    tags: ['fiction', 'time travel', 'romance', 'literary'],
    created_at: new Date('2024-01-03T00:00:00Z'),
    chapters: [
      {
        title: 'The First Meeting',
        content: 'Henry stood naked in the library, clutching a book...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'A classic tale of the American Dream.',
    genre: 'Fiction',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    status: 'published',
    tags: ['fiction', 'classic', 'american', 'free'],
    created_at: new Date('2024-01-07T00:00:00Z'),
    chapters: [
      {
        title: 'Chapter 1',
        content: 'In my younger and more vulnerable years my father gave me some advice...',
        chapter_order: 1
      }
    ]
  },

  // Sci-Fi Books
  {
    title: 'The Martian',
    author: 'Andy Weir',
    description: 'An astronaut must survive alone on Mars.',
    genre: 'Sci-Fi',
    cover_image_url: '/placeholder.svg',
    price: 4800,
    is_free: false,
    status: 'published',
    tags: ['sci-fi', 'mars', 'space', 'survival'],
    created_at: new Date('2024-01-09T00:00:00Z'),
    chapters: [
      {
        title: 'Sol 1',
        content: 'I\'m pretty much fucked. That\'s my considered opinion...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'Dune',
    author: 'Frank Herbert',
    description: 'A science fiction epic set on a desert planet.',
    genre: 'Sci-Fi',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    status: 'published',
    tags: ['sci-fi', 'epic', 'desert', 'free'],
    created_at: new Date('2024-01-11T00:00:00Z'),
    chapters: [
      {
        title: 'The Beginning',
        content: 'A beginning is the time for taking the most delicate care...',
        chapter_order: 1
      }
    ]
  },

  // Adventure Books
  {
    title: 'The Lost City',
    author: 'Indiana Jones',
    description: 'An archaeologist searches for a lost civilization.',
    genre: 'Adventure',
    cover_image_url: '/placeholder.svg',
    price: 3200,
    is_free: false,
    status: 'published',
    tags: ['adventure', 'archaeology', 'lost city', 'exploration'],
    created_at: new Date('2024-01-13T00:00:00Z'),
    chapters: [
      {
        title: 'The Map',
        content: 'The ancient map was fragile and yellowed with age...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'Treasure Island',
    author: 'Robert Louis Stevenson',
    description: 'A classic adventure story about pirates and treasure.',
    genre: 'Adventure',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    status: 'published',
    tags: ['adventure', 'pirates', 'treasure', 'free'],
    created_at: new Date('2024-01-17T00:00:00Z'),
    chapters: [
      {
        title: 'The Old Sea Dog',
        content: 'Squire Trelawney, Dr. Livesey, and the rest of these gentlemen...',
        chapter_order: 1
      }
    ]
  },

  // Mystery Books
  {
    title: 'The Hound of the Baskervilles',
    author: 'Arthur Conan Doyle',
    description: 'Sherlock Holmes investigates a supernatural mystery.',
    genre: 'Mystery',
    cover_image_url: '/placeholder.svg',
    price: 2800,
    is_free: false,
    status: 'published',
    tags: ['mystery', 'sherlock holmes', 'detective', 'supernatural'],
    created_at: new Date('2024-01-19T00:00:00Z'),
    chapters: [
      {
        title: 'Mr. Sherlock Holmes',
        content: 'Mr. Sherlock Holmes, who was usually very late in the mornings...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'Murder on the Orient Express',
    author: 'Agatha Christie',
    description: 'A murder mystery on a luxury train.',
    genre: 'Mystery',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    status: 'published',
    tags: ['mystery', 'train', 'murder', 'free'],
    created_at: new Date('2024-01-21T00:00:00Z'),
    chapters: [
      {
        title: 'The Crime',
        content: 'It was five minutes past nine when the train stopped...',
        chapter_order: 1
      }
    ]
  },

  // Fantasy Books
  {
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    description: 'A hobbit embarks on an epic journey.',
    genre: 'Fantasy',
    cover_image_url: '/placeholder.svg',
    price: 3600,
    is_free: false,
    status: 'published',
    tags: ['fantasy', 'hobbit', 'journey', 'tolkien'],
    created_at: new Date('2024-01-23T00:00:00Z'),
    chapters: [
      {
        title: 'An Unexpected Party',
        content: 'In a hole in the ground there lived a hobbit...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'The Name of the Wind',
    author: 'Patrick Rothfuss',
    description: 'A fantasy novel about a legendary musician.',
    genre: 'Fantasy',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    status: 'published',
    tags: ['fantasy', 'music', 'magic', 'free'],
    created_at: new Date('2024-01-27T00:00:00Z'),
    chapters: [
      {
        title: 'A Place for Demons',
        content: 'It was night again. The Waystone Inn lay in silence...',
        chapter_order: 1
      }
    ]
  },

  // Crime Books
  {
    title: 'The Godfather',
    author: 'Mario Puzo',
    description: 'A classic crime novel about the Corleone family.',
    genre: 'Crime',
    cover_image_url: '/placeholder.svg',
    price: 4000,
    is_free: false,
    status: 'published',
    tags: ['crime', 'mafia', 'family', 'organized crime'],
    created_at: new Date('2024-01-29T00:00:00Z'),
    chapters: [
      {
        title: 'The Don',
        content: 'Amerigo Bonasera sat in New York Criminal Court Number 3...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'The Big Sleep',
    author: 'Raymond Chandler',
    description: 'A hardboiled detective novel.',
    genre: 'Crime',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    status: 'published',
    tags: ['crime', 'detective', 'noir', 'free'],
    created_at: new Date('2024-02-04T00:00:00Z'),
    chapters: [
      {
        title: 'The Sternwood Case',
        content: 'It was about eleven o\'clock in the morning...',
        chapter_order: 1
      }
    ]
  },

  // Short Stories
  {
    title: 'Short Story Collection',
    author: 'Various Authors',
    description: 'A diverse collection of short stories from different genres.',
    genre: 'Short Stories',
    cover_image_url: '/placeholder.svg',
    price: 1800,
    is_free: false,
    status: 'published',
    tags: ['short stories', 'collection', 'various', 'literary'],
    created_at: new Date('2024-02-06T00:00:00Z'),
    chapters: [
      {
        title: 'The Last Sunset',
        content: 'She watched the sun set for the last time...',
        chapter_order: 1
      }
    ]
  },
  {
    title: 'Free Short Stories',
    author: 'Emerging Writers',
    description: 'A collection of free short stories from new authors.',
    genre: 'Short Stories',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    status: 'published',
    tags: ['short stories', 'free', 'emerging', 'new authors'],
    created_at: new Date('2024-02-09T00:00:00Z'),
    chapters: [
      {
        title: 'The Coffee Shop',
        content: 'Every morning at 7:15, she ordered the same coffee...',
        chapter_order: 1
      }
    ]
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/reading-realm');
    console.log('Connected to MongoDB');

    // Clear existing books and chapters
    await Book.deleteMany({});
    await Chapter.deleteMany({});
    console.log('Cleared existing data');

    // Create books and their chapters
    for (const bookData of mockBooks) {
      const { chapters, ...bookFields } = bookData;
      
      // Create the book
      const book = new Book(bookFields);
      await book.save();
      console.log(`Created book: ${book.title}`);

      // Create chapters for the book
      for (const chapterData of chapters) {
        const chapter = new Chapter({
          book: book._id,
          title: chapterData.title,
          content: chapterData.content,
          chapter_order: chapterData.chapter_order
        });
        await chapter.save();
      }
      console.log(`Created ${chapters.length} chapters for: ${book.title}`);
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 