import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function RealtimeNotifications({ userEmail }) {
  const navigate = useNavigate();
  const lastCheckRef = useRef(Date.now());

  const { data: notifications } = useQuery({
    queryKey: ['realtime-notifications', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      try {
        const notifs = await base44.entities.Notification.list({
          query: { user_email: userEmail, is_read: false },
          sort: { created_date: -1 },
          limit: 50
        });
        return notifs || [];
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return [];
      }
    },
    enabled: !!userEmail,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
    retry: 1
  });

  useEffect(() => {
    if (!notifications || !Array.isArray(notifications) || notifications.length === 0) return;

    try {
      const newNotifications = notifications.filter(n => {
        if (!n || !n.created_date) return false;
        const notifTime = new Date(n.created_date).getTime();
        return notifTime > lastCheckRef.current;
      });

      if (newNotifications.length > 0) {
        newNotifications.forEach(notif => {
          if (!notif || !notif.message) return;
          
          toast.info(notif.message, {
            duration: 5000,
            action: notif.link ? {
              label: 'View',
              onClick: () => {
                try {
                  navigate(notif.link);
                } catch (e) {
                  console.error('Navigation error:', e);
                }
              }
            } : undefined
          });
        });
        
        lastCheckRef.current = Date.now();
      }
    } catch (error) {
      console.error('Notification processing error:', error);
    }
  }, [notifications, navigate]);

  return null;
}
