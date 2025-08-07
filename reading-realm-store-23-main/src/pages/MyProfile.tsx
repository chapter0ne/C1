
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useReadingLists } from '@/hooks/useReadingLists';

const MyProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id || user?._id || '';
  
  console.log('MyProfile - User:', user);
  console.log('MyProfile - UserId:', userId);
  
  const { profile, isLoading: profileLoading, updateProfile } = useProfile(userId);
  const { readingLists, isLoading: listsLoading } = useReadingLists(userId);

  if (authLoading) {
    return <div>Loading authentication...</div>;
  }

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  if (profileLoading || listsLoading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div>
      <h1>My Profile</h1>
      <h2>User Info</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <h2>Profile Info</h2>
      <pre>{JSON.stringify(profile, null, 2)}</pre>
      <h2>My Reading Lists</h2>
      <ul>
        {readingLists.map((list: any) => (
          <li key={list._id || list.id}>{list.name}</li>
        ))}
      </ul>
      {/* Add profile update form as needed, using updateProfile mutation */}
    </div>
  );
};

export default MyProfile;
