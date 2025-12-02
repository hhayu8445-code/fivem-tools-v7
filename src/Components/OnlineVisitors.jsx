import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import MemberBadge from './MemberBadge';

export default function OnlineVisitors() {
  const { data: onlineUsers } = useQuery({
    queryKey: ['onlineVisitors'],
    queryFn: async () => {
      const users = await base44.entities.UserProfile.list({
        sort: { last_seen: -1 },
        limit: 50
      });
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return users.filter(u => new Date(u.last_seen) > fiveMinutesAgo);
    },
    refetchInterval: 10000 // Update every 10 seconds
  });

  const totalOnline = onlineUsers?.length || 0;

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>Online Now</span>
          </div>
          <span className="text-emerald-400 font-bold">{totalOnline}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {onlineUsers?.map(user => (
            <div key={user.id} className="group relative">
              <div className="relative">
                <Avatar className="w-10 h-10 border-2 border-zinc-800 group-hover:border-emerald-500 transition-all cursor-pointer">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user_email}`} />
                  <AvatarFallback>{user.user_email[0]}</AvatarFallback>
                </Avatar>
                <MemberBadge tier={user.membership_tier} size="xs" className="absolute -bottom-0.5 -right-0.5" />
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {user.user_email.split('@')[0]}
              </div>
            </div>
          ))}
        </div>
        {totalOnline === 0 && (
          <p className="text-xs text-zinc-500 text-center py-4">No one else is online</p>
        )}
      </CardContent>
    </Card>
  );
}
