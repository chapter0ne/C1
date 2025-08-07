import React from 'react';
import { useParams } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useReadingLists } from '@/hooks/useReadingLists';

const UserProfile = () => {
  const { username } = useParams();
  // Assume you have a way to get userId from username, or adjust as needed
  const userId = username || '';
  const { profile, isLoading: profileLoading } = useProfile(userId);
  const { readingLists, isLoading: listsLoading } = useReadingLists(userId);

  if (profileLoading || listsLoading) {
    return <div>Loading user profile...</div>;
  }

  return (
    <div>
      <h1>User Profile: {username}</h1>
      <h2>Profile Info</h2>
      <pre>{JSON.stringify(profile, null, 2)}</pre>
      <h2>User's Reading Lists</h2>
      <ul>
        {readingLists.map((list: any) => (
          <li key={list._id || list.id}>{list.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserProfile;
