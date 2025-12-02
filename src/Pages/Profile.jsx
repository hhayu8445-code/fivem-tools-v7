import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Skeleton } from '@/Components/ui/skeleton';
import { formatDistanceToNow, format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAchievements } from '@/utils';
import LoadingSpinner from '@/Components/LoadingSpinner';

export default function Profile() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    const navigate = useNavigate();

    const { data: profile, isLoading } = useQuery({
        queryKey: ['publicProfile', email],
        queryFn: async () => {
            if (!email) return null;
            const profiles = await base44.entities.UserProfile.list({ query: { user_email: email } });
            return profiles[0];
        },
        enabled: !!email
    });

    const { data: recentPosts } = useQuery({
        queryKey: ['userPosts', email],
        queryFn: () => base44.entities.ForumThread.list({
            query: { author_email: email },
            sort: { created_date: -1 },
            limit: 5
        }),
        enabled: !!email
    });

    if (isLoading) return <LoadingSpinner fullScreen />;
    if (!profile) return <div className="p-10 text-center text-zinc-500">User not found</div>;

    const isOnline = new Date(profile.last_seen) > new Date(Date.now() - 15 * 60 * 1000);
    const achievements = getAchievements(profile);

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Cover & Header */}
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="h-48 bg-gradient-to-r from-fuchsia-900/20 to-purple-900/20 relative">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1533134486753-c833f0ed4866?q=80&w=2000')] bg-cover bg-center opacity-10 mix-blend-overlay" />
                </div>
                <div className="px-8 pb-8">
                    <div className="relative -mt-16 mb-4 flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
                        <div className="flex items-end gap-6">
                            <div className="relative">
                                <Avatar className="w-32 h-32 border-4 border-zinc-950 shadow-xl">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`} />
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                                {isOnline && (
                                    <span className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 border-4 border-zinc-950 rounded-full" title="Online"></span>
                                )}
                            </div>
                            <div className="mb-2 space-y-1">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold text-white">{email.split('@')[0]}</h1>
                                    {profile.membership_tier === 'admin' && <Badge className="bg-red-500/20 text-red-400 border-red-500/30">ADMIN</Badge>}
                                    {profile.membership_tier === 'moderator' && <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">MOD</Badge>}
                                    {profile.membership_tier === 'vip' && <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">VIP</Badge>}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-zinc-500">
                                    <span className="flex items-center gap-1"><img src="https://img.icons8.com/3d-fluency/94/calendar.png" className="w-4 h-4" alt="Joined" /> Joined {format(new Date(profile.created_date || Date.now()), 'MMM yyyy')}</span>
                                    {profile.discord_id && <span className="flex items-center gap-1 text-indigo-400"><img src="https://img.icons8.com/3d-fluency/94/conference-call.png" className="w-4 h-4" alt="Discord" /> Discord Linked</span>}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => navigate(`/messages?to=${email}`)} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-full">
                                <img src="https://cdn3d.iconscout.com/3d/premium/thumb/message-3d-icon-png-download-5576258.png" className="w-4 h-4 mr-2" alt="Message" /> Message
                            </Button>
                        </div>
                    </div>

                    {/* Signature */}
                    {profile.forum_signature && (
                        <div className="bg-zinc-950/50 border border-zinc-800 p-4 rounded-xl text-sm text-zinc-400 italic max-w-2xl">
                            <ReactMarkdown>{profile.forum_signature}</ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats & Badges */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <img src="https://img.icons8.com/3d-fluency/94/trophy.png" className="w-5 h-5" alt="Stats" /> Community Stats
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-zinc-950 p-3 rounded-lg text-center">
                                <div className="text-2xl font-bold text-white">{profile.posts_count}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">Posts</div>
                            </div>
                            <div className="bg-zinc-950 p-3 rounded-lg text-center">
                                <div className="text-2xl font-bold text-white">{profile.likes_received_count}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">Likes</div>
                            </div>
                            <div className="bg-zinc-950 p-3 rounded-lg text-center">
                                <div className="text-2xl font-bold text-white">{profile.points}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">Points</div>
                            </div>
                            <div className="bg-zinc-950 p-3 rounded-lg text-center">
                                <div className="text-2xl font-bold text-white">{profile.daily_downloads_count}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">Downloads</div>
                            </div>
                            <div className="col-span-2 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-4 rounded-lg flex items-center justify-between mt-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-500/10 rounded-lg">
                                        <img src="https://img.icons8.com/3d-fluency/94/star.png" className="w-6 h-6" alt="Reputation" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Reputation</div>
                                        <div className="text-2xl font-bold text-white">{profile.reputation || 0}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-zinc-500">Community Rank</div>
                                    <div className="text-sm font-bold text-fuchsia-400">
                                        {(profile.reputation || 0) > 500 ? 'Legend' : (profile.reputation || 0) > 100 ? 'Expert' : (profile.reputation || 0) > 20 ? 'Rising Star' : 'Member'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h3 className="font-bold text-white mb-4">Badges</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {achievements.map((ach, i) => (
                                <div key={i} className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 p-2 text-center ${ach.color}`} title={ach.desc}>
                                    <img src={ach.icon} className="w-6 h-6" alt={ach.name} />
                                    <span className="text-[10px] font-bold truncate w-full">{ach.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h3 className="font-bold text-white mb-4">Recent Discussions</h3>
                        <div className="space-y-4">
                            {recentPosts?.length > 0 ? (
                                recentPosts.map(post => (
                                    <div key={post.id} className="group flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl hover:border-fuchsia-500/30 transition-all cursor-pointer" onClick={() => navigate(`/community/thread/${post.id}`)}>
                                        <div>
                                            <h4 className="font-semibold text-zinc-200 group-hover:text-fuchsia-400 transition-colors">{post.title}</h4>
                                            <p className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                                                <img src="https://img.icons8.com/3d-fluency/94/clock.png" className="w-3 h-3" alt="Time" /> {formatDistanceToNow(new Date(post.created_date))} ago
                                                <span>•</span>
                                                {post.replies_count} replies
                                            </p>
                                        </div>
                                        <img src="https://img.icons8.com/3d-fluency/94/forward.png" className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" alt="Go" />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-zinc-500">No recent activity.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
