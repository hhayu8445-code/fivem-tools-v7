import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/Components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Skeleton } from '@/Components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { getIconUrl } from '@/utils';
import { useTrendingThreadsSync, useHotThreadsSync, useForumSyncManager } from '@/hooks/useForumSync';
import LoadingSpinner from '@/Components/LoadingSpinner';

export default function Community() {
    const navigate = useNavigate();
    const [currentAd, setCurrentAd] = React.useState(0);
    const adBanners = [
        'https://cdn.discordapp.com/attachments/1252388644480618527/1368659142616813588/fiyat_listesi.png?ex=692f3328&is=692de1a8&hm=52d01e571fc0f6fb63d424e3997deb5e80a5af22d02ea9066c9aae711f7eff59',
        'https://cdn.discordapp.com/attachments/1252388644480618527/1375726682635239474/20.png?ex=692f3410&is=692de290&hm=97437a02a8ec0befd20f63d4bf6214eb436d0c26e890ac88825e6baec894ed9d',
        'https://cdn.discordapp.com/attachments/1252388644480618527/1433174567916142592/Banner.png?ex=692f3cd4&is=692deb54&hm=832dfdb162d145d63a22c7dc057b941e5aa7204f46a9b38f15d6a7cddb219fed'
    ];

    const [threadsLoading, setThreadsLoading] = useState(true);
    const [hotLoading, setHotLoading] = useState(true);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setCurrentAd((prev) => (prev + 1) % adBanners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // ✅ REALTIME SYNC: Event-driven trending threads (updated every 15 seconds)
    const recentThreads = useTrendingThreadsSync();
    const { pause: pauseSync, resume: resumeSync } = useForumSyncManager();

    // ✅ Auto-update loading state for trending
    useEffect(() => {
      if (recentThreads && recentThreads.length >= 0) {
        setThreadsLoading(false);
      }
    }, [recentThreads]);

    // ✅ REALTIME SYNC: Event-driven hot threads (updated every 8 seconds)
    const hotThreads = useHotThreadsSync();

    // ✅ Auto-update loading state for hot
    useEffect(() => {
      if (hotThreads && hotThreads.length >= 0) {
        setHotLoading(false);
      }
    }, [hotThreads]);

    const { data: categories, isLoading: catsLoading } = useQuery({
        queryKey: ['forumCategories'],
        queryFn: () => base44.entities.ForumCategory.list({ sort: { order: 1 } }),
        staleTime: 60000,
        refetchInterval: 30000
    });

    // ✅ REALTIME: Online users updated every 15 seconds
    const { data: onlineUsers } = useQuery({
        queryKey: ['onlineUsers'],
        queryFn: async () => {
            const users = await base44.entities.UserProfile.list({
                sort: { last_seen: -1 },
                limit: 20
            });
            const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
            return users.filter(u => u.last_seen && new Date(u.last_seen) > fifteenMinsAgo);
        },
        staleTime: 5000,
        refetchInterval: 15000
    });

    return (
        <div className="max-w-7xl mx-auto space-y-6">

            {/* Top Banner Ad Area */}
            <div className="w-full h-[150px] md:h-[200px] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 relative group">
                {adBanners.map((banner, index) => (
                    <img
                        key={index}
                        src={banner}
                        alt="Ad"
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${index === currentAd ? 'opacity-80 group-hover:opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}
                        onContextMenu={(e) => e.preventDefault()}
                        draggable="false"
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Sidebar Left (Ads) */}
                <div className="hidden lg:block space-y-6">
                    <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 p-4">
                        <img src="https://www.qbox.re/static/screenshots/qbox-logo2.png" alt="Sponsor" className="w-full h-auto object-cover" onContextMenu={(e) => e.preventDefault()} draggable="false" />
                    </div>
                    <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                        <img src="https://forum-cfx-re.akamaized.net/original/4X/f/6/b/f6bac3f89493570ff9e81398f525b895401ada58.jpeg" alt="Sponsor" className="w-full h-auto object-cover" onContextMenu={(e) => e.preventDefault()} draggable="false" />
                    </div>
                    <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 p-4">
                        <img src="https://ardelanyamanel.gallerycdn.vsassets.io/extensions/ardelanyamanel/fivem-esx-intellisense/2.0.7/1751908072411/Microsoft.VisualStudio.Services.Icons.Default" alt="Sponsor" className="w-full h-auto object-cover" onContextMenu={(e) => e.preventDefault()} draggable="false" />
                    </div>
                </div>

                {/* Main Forum List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 backdrop-blur-sm">
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            <img src="https://cdn3d.iconscout.com/3d/premium/thumb/message-3d-icon-png-download-5576258.png" className="w-8 h-8" alt="Forum" /> Community Forums
                        </h1>
                        <Button
                            onClick={() => navigate('/community/create-thread')}
                            size="sm"
                            className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg shadow-[0_0_15px_rgba(217,70,239,0.3)]"
                        >
                            <img src="https://img.icons8.com/3d-fluency/94/plus.png" className="mr-2 w-4 h-4" alt="New" /> New Topic
                        </Button>
                    </div>

                    {catsLoading ? (
                        <div className="flex justify-center py-10">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : (
                        categories?.map((cat) => {
                            const iconUrl = getIconUrl(cat.icon);
                            return (
                                <Link
                                    key={cat.id}
                                    to={`/community/category/${cat.id}`}
                                    className="block group"
                                >
                                    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-4 transition-all duration-300 hover:bg-zinc-900 hover:border-fuchsia-500/30 hover:shadow-[0_0_20px_rgba(217,70,239,0.05)] flex items-center gap-4">
                                        <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 group-hover:text-fuchsia-400 group-hover:border-fuchsia-500/30 transition-colors shrink-0">
                                            <img src={iconUrl} className="w-6 h-6" alt={cat.name} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-bold text-zinc-200 group-hover:text-fuchsia-200 transition-colors mb-0.5 truncate">
                                                {cat.name}
                                            </h3>
                                            <p className="text-zinc-500 text-xs truncate">{cat.description}</p>
                                        </div>
                                        <div className="hidden sm:block text-right">
                                            <div className="text-xs font-medium text-zinc-400">12k Posts</div>
                                            <div className="text-[10px] text-zinc-600">Updated 2m ago</div>
                                        </div>
                                        <img src="https://img.icons8.com/3d-fluency/94/forward.png" className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" alt="Go" />
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>

                {/* Sidebar Right (Stats & Recent) */}
                <div className="space-y-6">
                    {/* Ad Widget */}
                    <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 relative">
                        <img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExb20ydGl6a21pY3FxdG5ndWtqbmlrNGRrcWV6YWg5bGN2MDE4OGx6ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/NACV6SPFQ8Fqndeek9/giphy.gif" alt="Ad" className="w-full h-auto object-cover" />
                    </div>

                    {/* Video Sponsor */}
                    <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                        <video
                            src="https://r2.fivemanage.com/pjW8diq5cgbXePkRb7YQg/ts(1).mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-auto"
                        />
                    </div>

                    {/* Video Sponsor 2 */}
                    <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                        <video
                            src="https://r2.fivemanage.com/pjW8diq5cgbXePkRb7YQg/render.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-auto"
                        />
                    </div>

                    {/* Online Stats Widget */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 backdrop-blur-sm">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <img src="https://img.icons8.com/3d-fluency/94/conference-call.png" className="w-4 h-4" alt="Users" /> Online Members
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {onlineUsers?.map(user => (
                                <div key={user.id} className="group relative">
                                    <Link to={`/messages?to=${user.user_email}`}>
                                        <Avatar className="w-8 h-8 border border-zinc-800 group-hover:border-emerald-500 transition-colors cursor-pointer">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user_email}`} />
                                            <AvatarFallback>{user.user_email[0]}</AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-900 rounded-full"></span>
                                </div>
                            ))}
                            {(!onlineUsers || onlineUsers.length === 0) && (
                                <p className="text-xs text-zinc-500">No one else is online right now.</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Topics */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 backdrop-blur-sm">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <img src="https://img.icons8.com/3d-fluency/94/clock.png" className="w-4 h-4" alt="Recent" /> Latest Activity
                        </h3>
                        <div className="space-y-3">
                            {threadsLoading ? (
                                [1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full bg-zinc-950" />)
                            ) : recentThreads?.length > 0 ? (
                                recentThreads.map(thread => (
                                    <Link key={thread.id} to={`/community/thread/${thread.id}`} className="block group">
                                        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors">
                                            <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 border border-zinc-700 shrink-0">
                                                {thread.author_name?.[0] || 'U'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-zinc-300 truncate group-hover:text-fuchsia-400 transition-colors leading-tight">
                                                    {thread.title}
                                                </p>
                                                <p className="text-[10px] text-zinc-500 mt-0.5">
                                                    {formatDistanceToNow(new Date(thread.created_date))} ago
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-xs text-zinc-500 text-center py-4">No discussions yet</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
