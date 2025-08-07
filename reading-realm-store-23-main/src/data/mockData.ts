
export const mockBooks = [
  // Romance Books
  {
    id: '1',
    title: 'Love in the Digital Age',
    author: 'Sarah Johnson',
    description: 'A modern romance about finding love in the age of social media.',
    genre: 'Romance',
    cover_image_url: '/placeholder.svg',
    price: 2500,
    is_free: false,
    isFree: false,
    status: 'published' as const,
    tags: ['romance', 'love', 'digital', 'modern'],
    created_at: '2024-01-15T00:00:00Z',
    chapters: [
      {
        id: '1',
        title: 'First Swipe',
        content: 'Emma stared at her phone screen, wondering if she should swipe right...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '2',
    title: 'The Billionaire\'s Heart',
    author: 'Maria Rodriguez',
    description: 'A steamy romance between a CEO and his assistant.',
    genre: 'Romance',
    cover_image_url: '/placeholder.svg',
    price: 4156,
    is_free: false,
    isFree: false,
    status: 'published' as const,
    tags: ['romance', 'billionaire', 'office', 'steamy'],
    created_at: '2024-01-20T00:00:00Z',
    chapters: [
      {
        id: '2',
        title: 'The Interview',
        content: 'Alexandra walked into the towering office building, her heart racing...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '3',
    title: 'Summer Love Letters',
    author: 'James Wilson',
    description: 'A sweet romance about pen pals who fall in love.',
    genre: 'Romance',
    cover_image_url: '/placeholder.svg',
    price: 2912,
    is_free: false,
    isFree: false,
    status: 'published' as const,
    tags: ['romance', 'letters', 'summer', 'sweet'],
    created_at: '2024-01-25T00:00:00Z',
    chapters: [
      {
        id: '3',
        title: 'Dear Stranger',
        content: 'The first letter arrived on a warm June morning...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '4',
    title: 'Free Romance Collection',
    author: 'Emma Davis',
    description: 'A collection of free romantic short stories.',
    genre: 'Romance',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    isFree: true,
    status: 'published' as const,
    tags: ['romance', 'free', 'short stories', 'collection'],
    created_at: '2024-02-01T00:00:00Z',
    chapters: [
      {
        id: '4',
        title: 'Coffee Shop Encounter',
        content: 'She spilled her coffee on his laptop...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '5',
    title: 'The Wedding Planner',
    author: 'Lisa Chen',
    description: 'A romance about a wedding planner who falls for a client.',
    genre: 'Romance',
    cover_image_url: '/placeholder.svg',
    price: 5364,
    is_free: false,
    isFree: false,
    status: 'published' as const,
    tags: ['romance', 'wedding', 'planner', 'professional'],
    created_at: '2024-02-05T00:00:00Z',
    chapters: [
      {
        id: '5',
        title: 'The First Meeting',
        content: 'Sophie had planned hundreds of weddings, but this one felt different...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '6',
    title: 'Love in Paris',
    author: 'Pierre Dubois',
    description: 'A romantic tale set in the City of Light.',
    genre: 'Romance',
    cover_image_url: '/placeholder.svg',
    price: 3455,
    is_free: false,
    isFree: false,
    status: 'published' as const,
    tags: ['romance', 'paris', 'travel', 'french'],
    created_at: '2024-02-10T00:00:00Z',
    chapters: [
      {
        id: '6',
        title: 'Arrival in Paris',
        content: 'The Eiffel Tower sparkled in the distance as Claire stepped off the train...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '7',
    title: 'The Doctor\'s Heart',
    author: 'Dr. Michael Brown',
    description: 'A medical romance about love in the emergency room.',
    genre: 'Romance',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    isFree: true,
    status: 'published' as const,
    tags: ['romance', 'medical', 'doctor', 'free'],
    created_at: '2024-02-15T00:00:00Z',
    chapters: [
      {
        id: '7',
        title: 'Emergency Room',
        content: 'The emergency room was chaos, but Dr. Sarah couldn\'t help but notice...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '8',
    title: 'Second Chance Love',
    author: 'Jennifer Smith',
    description: 'A story about rekindling an old flame.',
    genre: 'Romance',
    cover_image_url: '/placeholder.svg',
    price: 1590,
    is_free: false,
    isFree: false,
    status: 'published' as const,
    tags: ['romance', 'second chance', 'reunion', 'nostalgia'],
    created_at: '2024-02-20T00:00:00Z',
    chapters: [
      {
        id: '8',
        title: 'The Reunion',
        content: 'Ten years had passed since they last saw each other...',
        chapter_order: 1
      }
    ]
  },

  // Horror Books
  {
    id: '9',
    title: 'The Haunted Mansion',
    author: 'Stephen Black',
    description: 'A family moves into a house with a dark secret.',
    genre: 'Horror',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    isFree: true,
    status: 'published' as const,
    tags: ['horror', 'haunted', 'mansion', 'ghost'],
    created_at: '2024-01-10T00:00:00Z',
    chapters: [
      {
        id: '9',
        title: 'Moving Day',
        content: 'The movers carried the last box into the old Victorian house...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '10',
    title: 'The Last Patient',
    author: 'Dr. Emily White',
    description: 'A psychiatrist discovers her patients are disappearing.',
    genre: 'Horror',
    cover_image_url: '/placeholder.svg',
    price: 5848,
    is_free: false,
    isFree: false,
    status: 'published' as const,
    tags: ['horror', 'psychological', 'thriller', 'medical'],
    created_at: '2024-01-12T00:00:00Z',
    chapters: [
      {
        id: '10',
        title: 'Session One',
        content: 'Dr. White opened her notebook and looked at her new patient...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '11',
    title: 'The Forest Calls',
    author: 'Robert Green',
    description: 'A camping trip turns into a nightmare.',
    genre: 'Horror',
    cover_image_url: '/placeholder.svg',
    price: 1422,
    is_free: false,
    isFree: false,
    status: 'published' as const,
    tags: ['horror', 'forest', 'camping', 'survival'],
    created_at: '2024-01-18T00:00:00Z',
    chapters: [
      {
        id: '11',
        title: 'The Hike',
        content: 'The trail seemed endless as the group ventured deeper into the woods...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '12',
    title: 'Free Horror Collection',
    author: 'Various Authors',
    description: 'A collection of spine-chilling horror stories.',
    genre: 'Horror',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    isFree: true,
    status: 'published' as const,
    tags: ['horror', 'free', 'collection', 'short stories'],
    created_at: '2024-01-22T00:00:00Z',
    chapters: [
      {
        id: '12',
        title: 'The Mirror',
        content: 'She looked into the mirror and saw something that wasn\'t her reflection...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '13',
    title: 'The Asylum',
    author: 'Thomas Gray',
    description: 'A journalist investigates an abandoned mental hospital.',
    genre: 'Horror',
    cover_image_url: '/placeholder.svg',
    price: 2954,
    is_free: false,
    isFree: false,
    status: 'published' as const,
    tags: ['horror', 'asylum', 'investigation', 'psychological'],
    created_at: '2024-01-28T00:00:00Z',
    chapters: [
      {
        id: '13',
        title: 'The Investigation',
        content: 'The old asylum loomed before him, its windows like hollow eyes...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '14',
    title: 'The Doll House',
    author: 'Amanda Lee',
    description: 'A child\'s doll house holds a terrifying secret.',
    genre: 'Horror',
    cover_image_url: '/placeholder.svg',
    price: 1385,
    is_free: false,
    isFree: false,
    status: 'published' as const,
    tags: ['horror', 'doll', 'child', 'supernatural'],
    created_at: '2024-02-02T00:00:00Z',
    chapters: [
      {
        id: '14',
        title: 'The Gift',
        content: 'Little Emma unwrapped her birthday present and found the most beautiful doll house...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '15',
    title: 'The Last Laugh',
    author: 'Carlos Mendez',
    description: 'A comedian discovers his jokes are coming true.',
    genre: 'Horror',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    isFree: true,
    status: 'published' as const,
    tags: ['horror', 'comedy', 'supernatural', 'free'],
    created_at: '2024-02-08T00:00:00Z',
    chapters: [
      {
        id: '15',
        title: 'The Joke',
        content: 'Mike told a joke about his neighbor, and the next day...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '16',
    title: 'The Experiment',
    author: 'Dr. Sarah Kim',
    description: 'A scientist\'s experiment goes horribly wrong.',
    genre: 'Horror',
    cover_image_url: '/placeholder.svg',
    price: 3137,
    is_free: false,
    isFree: false,
    status: 'published' as const,
    tags: ['horror', 'science', 'experiment', 'laboratory'],
    created_at: '2024-02-12T00:00:00Z',
    chapters: [
      {
        id: '16',
        title: 'Day One',
        content: 'The laboratory was sterile and quiet as Dr. Kim prepared her experiment...',
        chapter_order: 1
      }
    ]
  },

  // Thriller Books
  {
    id: '17',
    title: 'The Silent Witness',
    author: 'Detective Mike Johnson',
    description: 'A detective must solve a murder with no evidence.',
    genre: 'Thriller',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    isFree: true,
    status: 'published' as const,
    tags: ['thriller', 'detective', 'murder', 'mystery'],
    created_at: '2024-01-05T00:00:00Z',
    chapters: [
      {
        id: '17',
        title: 'The Crime Scene',
        content: 'Detective Johnson stood over the body, puzzled by the lack of evidence...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '18',
    title: 'The Perfect Alibi',
    author: 'Lisa Thompson',
    description: 'A woman creates the perfect alibi for a crime she didn\'t commit.',
    genre: 'Thriller',
    cover_image_url: '/placeholder.svg',
    price: 4200,
    is_free: false,
    isFree: false,
    status: 'published' as const,
    tags: ['thriller', 'alibi', 'suspense', 'legal'],
    created_at: '2024-01-08T00:00:00Z',
    chapters: [
      {
        id: '18',
        title: 'The Setup',
        content: 'Rachel carefully planned every detail of her alibi...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '19',
    title: 'The Last Call',
    author: 'David Wilson',
    description: 'A phone call changes everything for a businessman.',
    genre: 'Thriller',
    cover_image_url: '/placeholder.svg',
    price: 3800,
    is_free: false,
    isFree: false,
    status: 'published' as const,
    tags: ['thriller', 'phone', 'business', 'suspense'],
    created_at: '2024-01-14T00:00:00Z',
    chapters: [
      {
        id: '19',
        title: 'The Call',
        content: 'The phone rang at exactly 3:47 AM...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '20',
    title: 'The Double Agent',
    author: 'James Bond',
    description: 'A spy must choose between loyalty and love.',
    genre: 'Thriller',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    isFree: true,
    status: 'published' as const,
    tags: ['thriller', 'spy', 'espionage', 'free'],
    created_at: '2024-01-16T00:00:00Z',
    chapters: [
      {
        id: '20',
        title: 'The Mission',
        content: 'Agent Smith received his orders with a heavy heart...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '21',
    title: 'The Time Bomb',
    author: 'Robert Chen',
    description: 'A bomb squad races against time to save the city.',
    genre: 'Thriller',
    cover_image_url: '/placeholder.svg',
    price: 5100,
    is_free: false,
    isFree: false,
    status: 'published' as const,
    tags: ['thriller', 'bomb', 'action', 'emergency'],
    created_at: '2024-01-24T00:00:00Z',
    chapters: [
      {
        id: '21',
        title: 'The Timer',
        content: 'The digital display showed 00:15:32...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '22',
    title: 'The Witness Protection',
    author: 'Maria Garcia',
    description: 'A witness must disappear to stay alive.',
    genre: 'Thriller',
    cover_image_url: '/placeholder.svg',
    price: 2900,
    is_free: false,
    isFree: false,
    status: 'published' as const,
    tags: ['thriller', 'witness', 'protection', 'crime'],
    created_at: '2024-01-30T00:00:00Z',
    chapters: [
      {
        id: '22',
        title: 'The Testimony',
        content: 'Sarah\'s hands shook as she prepared to testify...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '23',
    title: 'The Cyber Attack',
    author: 'Alex Tech',
    description: 'A hacker threatens to bring down the internet.',
    genre: 'Thriller',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    isFree: true,
    status: 'published' as const,
    tags: ['thriller', 'cyber', 'hacker', 'technology'],
    created_at: '2024-02-03T00:00:00Z',
    chapters: [
      {
        id: '23',
        title: 'The Breach',
        content: 'The first server went down at exactly 9:47 AM...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '24',
    title: 'The Last Flight',
    author: 'Captain Tom Harris',
    description: 'A pilot must land a plane with a bomb on board.',
    genre: 'Thriller',
    cover_image_url: '/placeholder.svg',
    price: 4400,
    is_free: false,
    isFree: false,
    status: 'published' as const,
    tags: ['thriller', 'plane', 'pilot', 'action'],
    created_at: '2024-02-07T00:00:00Z',
    chapters: [
      {
        id: '24',
        title: 'Takeoff',
        content: 'Flight 237 began its ascent into the night sky...',
        chapter_order: 1
      }
    ]
  },

  // Fiction Books
  {
    id: '25',
    title: 'The Time Traveler\'s Wife',
    author: 'Audrey Niffenegger',
    description: 'A love story that transcends time itself.',
    genre: 'Fiction',
    cover_image_url: '/placeholder.svg',
    price: 3500,
    is_free: false,
    isFree: false,
    status: 'published' as const,
    tags: ['fiction', 'time travel', 'romance', 'literary'],
    created_at: '2024-01-03T00:00:00Z',
    chapters: [
      {
        id: '25',
        title: 'The First Meeting',
        content: 'Henry stood naked in the library, clutching a book...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '26',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'A classic tale of the American Dream.',
    genre: 'Fiction',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    isFree: true,
    status: 'published' as const,
    tags: ['fiction', 'classic', 'american', 'free'],
    created_at: '2024-01-07T00:00:00Z',
    chapters: [
      {
        id: '26',
        title: 'Chapter 1',
        content: 'In my younger and more vulnerable years my father gave me some advice...',
        chapter_order: 1
      }
    ]
  },

  // Sci-Fi Books
  {
    id: '27',
    title: 'The Martian',
    author: 'Andy Weir',
    description: 'An astronaut must survive alone on Mars.',
    genre: 'Sci-Fi',
    cover_image_url: '/placeholder.svg',
    price: 4800,
    is_free: false,
    isFree: false,
    status: 'published' as const,
    tags: ['sci-fi', 'mars', 'space', 'survival'],
    created_at: '2024-01-09T00:00:00Z',
    chapters: [
      {
        id: '27',
        title: 'Sol 1',
        content: 'I\'m pretty much fucked. That\'s my considered opinion...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '28',
    title: 'Dune',
    author: 'Frank Herbert',
    description: 'A science fiction epic set on a desert planet.',
    genre: 'Sci-Fi',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    isFree: true,
    status: 'published' as const,
    tags: ['sci-fi', 'epic', 'desert', 'free'],
    created_at: '2024-01-11T00:00:00Z',
    chapters: [
      {
        id: '28',
        title: 'The Beginning',
        content: 'A beginning is the time for taking the most delicate care...',
        chapter_order: 1
      }
    ]
  },

  // Adventure Books
  {
    id: '29',
    title: 'The Lost City',
    author: 'Indiana Jones',
    description: 'An archaeologist searches for a lost civilization.',
    genre: 'Adventure',
    cover_image_url: '/placeholder.svg',
    price: 3200,
    is_free: false,
    isFree: false,
    status: 'published' as const,
    tags: ['adventure', 'archaeology', 'lost city', 'exploration'],
    created_at: '2024-01-13T00:00:00Z',
    chapters: [
      {
        id: '29',
        title: 'The Map',
        content: 'The ancient map was fragile and yellowed with age...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '30',
    title: 'Treasure Island',
    author: 'Robert Louis Stevenson',
    description: 'A classic adventure story about pirates and treasure.',
    genre: 'Adventure',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    isFree: true,
    status: 'published' as const,
    tags: ['adventure', 'pirates', 'treasure', 'free'],
    created_at: '2024-01-17T00:00:00Z',
    chapters: [
      {
        id: '30',
        title: 'The Old Sea Dog',
        content: 'Squire Trelawney, Dr. Livesey, and the rest of these gentlemen...',
        chapter_order: 1
      }
    ]
  },

  // Mystery Books
  {
    id: '31',
    title: 'The Hound of the Baskervilles',
    author: 'Arthur Conan Doyle',
    description: 'Sherlock Holmes investigates a supernatural mystery.',
    genre: 'Mystery',
    cover_image_url: '/placeholder.svg',
    price: 2800,
    is_free: false,
    isFree: false,
    status: 'published' as const,
    tags: ['mystery', 'sherlock holmes', 'detective', 'supernatural'],
    created_at: '2024-01-19T00:00:00Z',
    chapters: [
      {
        id: '31',
        title: 'Mr. Sherlock Holmes',
        content: 'Mr. Sherlock Holmes, who was usually very late in the mornings...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '32',
    title: 'Murder on the Orient Express',
    author: 'Agatha Christie',
    description: 'A murder mystery on a luxury train.',
    genre: 'Mystery',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    isFree: true,
    status: 'published' as const,
    tags: ['mystery', 'train', 'murder', 'free'],
    created_at: '2024-01-21T00:00:00Z',
    chapters: [
      {
        id: '32',
        title: 'The Crime',
        content: 'It was five minutes past nine when the train stopped...',
        chapter_order: 1
      }
    ]
  },

  // Fantasy Books
  {
    id: '33',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    description: 'A hobbit embarks on an epic journey.',
    genre: 'Fantasy',
    cover_image_url: '/placeholder.svg',
    price: 3600,
    is_free: false,
    isFree: false,
    status: 'published' as const,
    tags: ['fantasy', 'hobbit', 'journey', 'tolkien'],
    created_at: '2024-01-23T00:00:00Z',
    chapters: [
      {
        id: '33',
        title: 'An Unexpected Party',
        content: 'In a hole in the ground there lived a hobbit...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '34',
    title: 'The Name of the Wind',
    author: 'Patrick Rothfuss',
    description: 'A fantasy novel about a legendary musician.',
    genre: 'Fantasy',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    isFree: true,
    status: 'published' as const,
    tags: ['fantasy', 'music', 'magic', 'free'],
    created_at: '2024-01-27T00:00:00Z',
    chapters: [
      {
        id: '34',
        title: 'A Place for Demons',
        content: 'It was night again. The Waystone Inn lay in silence...',
        chapter_order: 1
      }
    ]
  },

  // Crime Books
  {
    id: '35',
    title: 'The Godfather',
    author: 'Mario Puzo',
    description: 'A classic crime novel about the Corleone family.',
    genre: 'Crime',
    cover_image_url: '/placeholder.svg',
    price: 4000,
    is_free: false,
    isFree: false,
    status: 'published' as const,
    tags: ['crime', 'mafia', 'family', 'organized crime'],
    created_at: '2024-01-29T00:00:00Z',
    chapters: [
      {
        id: '35',
        title: 'The Don',
        content: 'Amerigo Bonasera sat in New York Criminal Court Number 3...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '36',
    title: 'The Big Sleep',
    author: 'Raymond Chandler',
    description: 'A hardboiled detective novel.',
    genre: 'Crime',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    isFree: true,
    status: 'published' as const,
    tags: ['crime', 'detective', 'noir', 'free'],
    created_at: '2024-02-04T00:00:00Z',
    chapters: [
      {
        id: '36',
        title: 'The Sternwood Case',
        content: 'It was about eleven o\'clock in the morning...',
        chapter_order: 1
      }
    ]
  },

  // Short Stories
  {
    id: '37',
    title: 'Short Story Collection',
    author: 'Various Authors',
    description: 'A diverse collection of short stories from different genres.',
    genre: 'Short Stories',
    cover_image_url: '/placeholder.svg',
    price: 1800,
    is_free: false,
    isFree: false,
    status: 'published' as const,
    tags: ['short stories', 'collection', 'various', 'literary'],
    created_at: '2024-02-06T00:00:00Z',
    chapters: [
      {
        id: '37',
        title: 'The Last Sunset',
        content: 'She watched the sun set for the last time...',
        chapter_order: 1
      }
    ]
  },
  {
    id: '38',
    title: 'Free Short Stories',
    author: 'Emerging Writers',
    description: 'A collection of free short stories from new authors.',
    genre: 'Short Stories',
    cover_image_url: '/placeholder.svg',
    price: 0,
    is_free: true,
    isFree: true,
    status: 'published' as const,
    tags: ['short stories', 'free', 'emerging', 'new authors'],
    created_at: '2024-02-09T00:00:00Z',
    chapters: [
      {
        id: '38',
        title: 'The Coffee Shop',
        content: 'Every morning at 7:15, she ordered the same coffee...',
        chapter_order: 1
      }
    ]
  }
];

export const mockReadingLists = [
  {
    id: '1',
    title: 'Tech Essentials',
    description: 'Must-read books about technology',
    creator_id: 'user_1',
    creator_name: 'BookLover123',
    book_ids: ['1'],
    followers_count: 25,
    is_public: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Culinary Adventures',
    description: 'Explore the world of cooking',
    creator_id: 'user_2',
    creator_name: 'ChefReader',
    book_ids: ['2'],
    followers_count: 15,
    is_public: true,
    created_at: '2024-01-02T00:00:00Z'
  }
];

export const mockChapters = [
  {
    id: '1',
    book_id: '1',
    title: 'Introduction to Digital Age',
    content: 'Welcome to the digital age. In this chapter, we explore the fundamental concepts that shape our modern technological landscape...',
    chapter_order: 1
  },
  {
    id: '2',
    book_id: '1',
    title: 'The Internet Revolution',
    content: 'The internet has transformed how we communicate, work, and live. This chapter examines the profound impact of global connectivity...',
    chapter_order: 2
  }
];
