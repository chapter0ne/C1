
import { useState } from 'react';
import { User } from '@/types/book';

const mockUsers: User[] = [
  {
    id: 'user1',
    username: 'sarahtech',
    email: 'sarah@example.com',
    bio: 'Technology enthusiast and innovation advocate. Sharing the best books on tech and the future.',
    streakCount: 15,
    createdAt: '2023-06-15',
    updatedAt: '2024-01-15'
  },
  {
    id: 'user2',
    username: 'johnphilosopher',
    email: 'john@example.com',
    bio: 'Philosophy professor exploring the intersection of human nature and modern society.',
    streakCount: 23,
    createdAt: '2023-08-20',
    updatedAt: '2024-01-20'
  },
  {
    id: 'user3',
    username: 'emmaentrepreneur',
    email: 'emma@example.com',
    bio: 'Serial entrepreneur and startup mentor. Curating books for the next generation of founders.',
    streakCount: 8,
    createdAt: '2023-11-10',
    updatedAt: '2024-02-01'
  }
];

export const useUserStore = () => {
  const [users] = useState<User[]>(mockUsers);

  return {
    users
  };
};
