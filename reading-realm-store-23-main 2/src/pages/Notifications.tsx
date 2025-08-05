import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';

const Notifications = () => {
  const { user } = useAuth();
  const userId = user?.id || '';
  const { data: notifications = [], isLoading } = useNotifications(userId);

  if (isLoading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <div>
      <h1>Notifications</h1>
      <ul>
        {notifications.map((notification: any) => (
          <li key={notification.id}>
            <strong>{notification.title}</strong>: {notification.content}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications; 