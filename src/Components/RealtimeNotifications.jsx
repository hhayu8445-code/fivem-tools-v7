import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function RealtimeNotifications({ userEmail }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [lastCheck, setLastCheck] = React.useState(Date.now());

  const { data: notifications } = useQuery({
    queryKey: ['realtime-notifications', userEmail],
    queryFn: async () => {
      const notifs = await base44.entities.Notification.list({
        query: { user_email: userEmail, is_read: false },
        sort: { created_date: -1 },
        limit: 50
      });
      return notifs;
    },
    enabled: !!userEmail,
    refetchInterval: 3000, // Check every 3 seconds for real-time feel
    refetchIntervalInBackground: true
  });

  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    // Check for new notifications since last check
    const newNotifications = notifications.filter(n => {
      const notifTime = new Date(n.created_date).getTime();
      return notifTime > lastCheck;
    });

    if (newNotifications.length > 0) {
      newNotifications.forEach(notif => {
        toast.info(notif.message, {
          duration: 5000,
          icon: <img src="https://img.icons8.com/3d-fluency/94/bell.png" className="w-5 h-5" alt="" />,
          action: notif.link ? {
            label: 'View',
            onClick: () => navigate(notif.link)
          } : undefined,
          className: 'bg-zinc-900 border-zinc-800 text-white'
        });
      });
      
      setLastCheck(Date.now());
    }
  }, [notifications, lastCheck, navigate]);

  return null; // This is a headless component
}
