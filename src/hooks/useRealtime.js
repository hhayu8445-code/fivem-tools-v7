import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useEffect } from 'react';

export function useOnlineUsers() {
  return useQuery({
    queryKey: ['onlineUsers'],
    queryFn: async () => {
      const users = await base44.entities.UserProfile.list({
        sort: { last_seen: -1 },
        limit: 100
      });
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return users.filter(u => u.last_seen && new Date(u.last_seen) > fiveMinutesAgo);
    },
    refetchInterval: 15000
  });
}

export function useUpdatePresence(userEmail) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userEmail) return;

    const updatePresence = async () => {
      try {
        const profiles = await base44.entities.UserProfile.list({ query: { user_email: userEmail } });
        if (profiles[0]) {
          await base44.entities.UserProfile.update(profiles[0].id, {
            last_seen: new Date().toISOString()
          });
          queryClient.invalidateQueries(['onlineUsers']);
        }
      } catch (error) {
        console.error('Presence update failed:', error);
      }
    };

    updatePresence();
    const interval = setInterval(updatePresence, 60000);
    return () => clearInterval(interval);
  }, [userEmail, queryClient]);
}

export function useLiveNotifications(userEmail) {
  return useQuery({
    queryKey: ['notifications', userEmail],
    queryFn: () => base44.entities.Notification.list({
      query: { user_email: userEmail, is_read: false },
      sort: { created_at: -1 }
    }),
    enabled: !!userEmail,
    refetchInterval: 20000
  });
}
