
export interface Book {
  id: number;
  title: string;
  author: string;
  progress: number;
  color: string;
  description: string;
  published: string;
  genre: string;
  pages: number;
}

export const books: Book[] = [
  {
    id: 1,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    progress: 85,
    color: "from-chapterRed-500 to-chapterRed-600",
    description: "A romantic novel of manners that follows the character development of Elizabeth Bennet, who learns about the repercussions of hasty judgments.",
    published: "1813",
    genre: "Classic Literature",
    pages: 279
  },
  {
    id: 2,
    title: "Frankenstein",
    author: "Mary Shelley",
    progress: 35,
    color: "from-chapterRed-300 to-chapterRed-400",
    description: "A Gothic novel that tells the story of Victor Frankenstein, a young scientist who creates a sapient creature in an unorthodox scientific experiment.",
    published: "1818",
    genre: "Gothic Fiction",
    pages: 280
  },
  {
    id: 3,
    title: "The Art of War",
    author: "Sun Tzu",
    progress: 10,
    color: "from-gray-700 to-gray-900",
    description: "An ancient Chinese military treatise that has influenced both Eastern and Western military thinking, business tactics, legal strategy and beyond.",
    published: "5th century BC",
    genre: "Military Strategy",
    pages: 273
  }
];

export const recentlyAddedBook = {
  title: "The Time Machine",
  author: "H.G. Wells",
  pages: 154
};
