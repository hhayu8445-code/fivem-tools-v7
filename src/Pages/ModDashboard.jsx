import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/Components/ui/dialog';
import { Textarea } from '@/Components/ui/textarea';
import { toast } from 'sonner';
import LoadingSpinner from '@/Components/LoadingSpinner';
import LoginRequiredModal from '@/Components/LoginRequiredModal';
import { logToDiscord } from '@/utils';

export default function ModDashboard() {
    const [user, setUser] = React.useState(null);
    const [showLoginModal, setShowLoginModal] = React.useState(false);
    const queryClient = useQueryClient();

    React.useEffect(() => {
        base44.auth.me().then(u => {
            if (!u) {
                setShowLoginModal(true);
                return;
            }
            setUser(u);
        });
    }, []);

    // Fetch Pending Reports
    const { data: reports, isLoading: isLoadingReports } = useQuery({
        queryKey: ['reports'],
        queryFn: () => base44.entities.ForumReport.list({
            query: { status: 'pending' },
            sort: { created_date: -1 }
        })
    });

    // Fetch Pending Scripts/Threads
    const { data: pendingThreads, isLoading: isLoadingPending } = useQuery({
        queryKey: ['pendingThreads'],
        queryFn: () => base44.entities.ForumThread.list({
            query: { status: 'pending' },
            sort: { created_date: -1 }
        })
    });

    // Resolve Report Mutation
    const resolveReportMutation = useMutation({
        mutationFn: async ({ id, status, notes }) => {
            await base44.entities.ForumReport.update(id, {
                status,
                resolution_notes: notes
            });
        },
        onSuccess: ({ id, status }) => {
            queryClient.invalidateQueries(['reports']);
            toast.success('Report resolved!');
            logToDiscord('Report Resolved (Mod)', {
                type: 'mod',
                user: user.full_name || user.username,
                email: user.email,
                description: `⚖️ Report ${status}: ${id}`,
                extra: { 'Status': status }
            });
        },
        onError: () => toast.error('Failed to resolve report')
    });

    // Review Thread Mutation (Approve/Reject)
    const reviewThreadMutation = useMutation({
        mutationFn: async ({ id, status }) => {
            await base44.entities.ForumThread.update(id, { status });
        },
        onSuccess: ({ id, status }) => {
            queryClient.invalidateQueries(['pendingThreads']);
            toast.success('Thread reviewed!');
            logToDiscord('Thread Reviewed (Mod)', {
                type: 'mod',
                user: user.full_name || user.username,
                email: user.email,
                description: `📝 Thread ${status}: ${id}`,
                extra: { 'Status': status }
            });
        },
        onError: () => toast.error('Failed to review thread')
    });

    // Fetch Users for Management
    const [userSearch, setUserSearch] = useState('');
    const { data: usersList } = useQuery({
        queryKey: ['usersList', userSearch],
        queryFn: () => base44.entities.UserProfile.list({
            limit: 20
        })
    });

    // Delete Content Mutation
    const deleteContentMutation = useMutation({
        mutationFn: async ({ type, id }) => {
            if (type === 'thread') {
                await base44.entities.ForumThread.delete(id);
            } else {
                await base44.entities.ForumReply.delete(id);
            }
        },
        onSuccess: () => {
            toast.success('Content deleted successfully');
            queryClient.invalidateQueries(['reports']);
        },
        onError: () => toast.error('Failed to delete content')
    });

    // Ban/Unban User Mutation
    const toggleBanMutation = useMutation({
        mutationFn: async ({ email, isBanned }) => {
            const profiles = await base44.entities.UserProfile.list({ query: { user_email: email } });
            if (profiles.length > 0) {
                await base44.entities.UserProfile.update(profiles[0].id, { is_banned: isBanned });
            }
        },
        onSuccess: ({ email, isBanned }) => {
            queryClient.invalidateQueries(['usersList']);
            toast.success('User status updated!');
            logToDiscord(`User ${isBanned ? 'Banned' : 'Unbanned'} (Mod)`, {
                type: 'mod',
                user: user.full_name || user.username,
                email: user.email,
                description: `User ${isBanned ? 'banned' : 'unbanned'}: ${email}`,
                extra: { 'Target User': email }
            });
        },
        onError: () => toast.error('Failed to update user')
    });

    if (!user) return null;

    return (
        <>
            <LoginRequiredModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                message="You must login first to access moderation dashboard"
            />
            <div className="max-w-6xl mx-auto py-8 space-y-8 animate-in fade-in duration-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-400 flex items-center gap-4">
                            <img src="https://img.icons8.com/3d-fluency/94/shield.png" className="w-12 h-12" alt="Shield" />
                            Moderation Dashboard
                        </h1>
                        <p className="text-zinc-400 mt-2 text-lg">Manage reports, users, and content with precision.</p>
                    </div>
                </div>

                <Tabs defaultValue="scripts" className="w-full">
                    <TabsList className="bg-zinc-900/50 backdrop-blur border border-zinc-800 p-1 h-14 rounded-xl">
                        <TabsTrigger value="scripts" className="h-12 rounded-lg data-[state=active]:bg-fuchsia-600 data-[state=active]:text-white text-zinc-400 transition-all">
                            Pending Scripts ({pendingThreads?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="reports" className="h-12 rounded-lg data-[state=active]:bg-fuchsia-600 data-[state=active]:text-white text-zinc-400 transition-all">
                            Pending Reports ({reports?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="users" className="h-12 rounded-lg data-[state=active]:bg-fuchsia-600 data-[state=active]:text-white text-zinc-400 transition-all">
                            User Management
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="scripts" className="mt-8">
                        <div className="grid gap-6">
                            {pendingThreads?.map(thread => (
                                <Card key={thread.id} className="bg-zinc-900/50 border-zinc-800 overflow-hidden backdrop-blur-sm hover:border-fuchsia-500/30 transition-all duration-300 group">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between gap-6">
                                            <div className="space-y-4 flex-1">
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className="border-fuchsia-900 text-fuchsia-400 bg-fuchsia-900/10 px-3 py-1">
                                                        {thread.is_resource ? 'Script/Resource' : 'Thread'}
                                                    </Badge>
                                                    {thread.tags && thread.tags.length > 0 && (
                                                        <Badge variant="secondary" className="bg-violet-900/20 text-violet-300 border-violet-800 px-3 py-1">
                                                            {thread.tags[0]}
                                                        </Badge>
                                                    )}
                                                    <span className="text-zinc-500 text-sm flex items-center gap-1">
                                                        <img src="https://img.icons8.com/3d-fluency/94/user-male-circle.png" className="w-4 h-4" alt="User" />
                                                        {thread.author_name}
                                                    </span>
                                                    <span className="text-zinc-600 text-sm">•</span>
                                                    <span className="text-zinc-500 text-sm">
                                                        {new Date(thread.created_date).toLocaleString()}
                                                    </span>
                                                </div>
                                                <h3 className="text-2xl font-bold text-white group-hover:text-fuchsia-400 transition-colors">{thread.title}</h3>

                                                {thread.virus_scan_link && (
                                                    <div className="bg-zinc-950/50 border border-zinc-800 p-3 rounded-lg inline-flex items-center gap-2 text-sm text-emerald-400">
                                                        <img src="https://cdn3d.iconscout.com/3d/premium/thumb/antivirus-3d-icon-png-download-4159679.png" className="w-5 h-5" alt="Safe" />
                                                        <span>Virus Scan:</span>
                                                        <a href={thread.virus_scan_link} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-300">
                                                            {thread.virus_scan_link}
                                                        </a>
                                                    </div>
                                                )}

                                                <div className="bg-zinc-950/80 border border-zinc-800 p-4 rounded-xl text-zinc-300 text-sm max-h-[200px] overflow-y-auto shadow-inner"
                                                    dangerouslySetInnerHTML={{ __html: thread.content }}
                                                />
                                            </div>

                                            <div className="flex flex-col gap-3 min-w-[160px]">
                                                <Button
                                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20"
                                                    onClick={() => reviewThreadMutation.mutate({ id: thread.id, status: 'active' })}
                                                >
                                                    <img src="https://img.icons8.com/3d-fluency/94/checkmark.png" className="w-5 h-5 mr-2" alt="Approve" /> Approve
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="w-full border-red-900/50 text-red-400 hover:bg-red-950/30 hover:text-red-300"
                                                    onClick={() => reviewThreadMutation.mutate({ id: thread.id, status: 'rejected' })}
                                                >
                                                    <img src="https://img.icons8.com/3d-fluency/94/cancel.png" className="w-5 h-5 mr-2" alt="Reject" /> Reject
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {pendingThreads?.length === 0 && (
                                <div className="text-center py-20 text-zinc-500 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 border-dashed">
                                    <img src="https://cdn3d.iconscout.com/3d/premium/thumb/pending-3d-icon-png-download-5326994.png" className="w-20 h-20 mx-auto mb-6 opacity-80" alt="Done" />
                                    <p className="text-xl font-medium text-zinc-300">All caught up!</p>
                                    <p className="text-sm mt-2">No pending scripts to review.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="reports" className="mt-8">
                        <div className="grid gap-6">
                            {reports?.map(report => (
                                <ReportCard
                                    key={report.id}
                                    report={report}
                                    onResolve={resolveReportMutation.mutate}
                                    onBan={toggleBanMutation.mutate}
                                />
                            ))}
                            {reports?.length === 0 && (
                                <div className="text-center py-20 text-zinc-500 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 border-dashed">
                                    <img src="https://cdn3d.iconscout.com/3d/premium/thumb/pending-3d-icon-png-download-5326994.png" className="w-20 h-20 mx-auto mb-6 opacity-80" alt="Clear" />
                                    <p className="text-xl font-medium text-zinc-300">All clear! No pending reports.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="users" className="mt-8">
                        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <img src="https://img.icons8.com/3d-fluency/94/conference-call.png" className="w-8 h-8" alt="Users" />
                                    User Management
                                </CardTitle>
                                <CardDescription>View and manage registered users.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-6 flex gap-4">
                                    <div className="relative flex-1">
                                        <img src="https://img.icons8.com/3d-fluency/94/search.png" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" alt="Search" />
                                        <Input
                                            placeholder="Search users by email..."
                                            className="pl-12 bg-zinc-950 border-zinc-800 h-12 text-lg"
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {usersList?.filter(u => u.user_email.includes(userSearch)).map(profile => (
                                        <div key={profile.id} className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden ring-2 ring-zinc-800">
                                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.user_email}`} alt="avatar" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-lg">{profile.full_name || 'User'}</div>
                                                    <div className="text-sm text-zinc-500">{profile.user_email}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {profile.is_banned ? (
                                                    <Button
                                                        variant="outline"
                                                        className="border-emerald-900 text-emerald-500 hover:bg-emerald-900/20 h-10 px-4"
                                                        onClick={() => toggleBanMutation.mutate({ email: profile.user_email, isBanned: false })}
                                                    >
                                                        <img src="https://img.icons8.com/3d-fluency/94/unlock.png" className="w-5 h-5 mr-2" alt="Unban" /> Unban
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        className="border-red-900 text-red-500 hover:bg-red-900/20 h-10 px-4"
                                                        onClick={() => toggleBanMutation.mutate({ email: profile.user_email, isBanned: true })}
                                                    >
                                                        <img src="https://img.icons8.com/3d-fluency/94/denied.png" className="w-5 h-5 mr-2" alt="Ban" /> Ban
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}

function ReportCard({ report, onResolve, onBan }) {
    const [targetContent, setTargetContent] = useState(null);

    // Fetch the reported content for context
    React.useEffect(() => {
        const fetchContent = async () => {
            const entity = report.target_type === 'thread' ? base44.entities.ForumThread : base44.entities.ForumReply;
            const items = await entity.list({ query: { id: report.target_id } });
            if (items.length > 0) setTargetContent(items[0]);
        };
        fetchContent();
    }, [report]);

    return (
        <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden backdrop-blur-sm hover:border-red-900/30 transition-all duration-300">
            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="col-span-3 space-y-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <img src="https://img.icons8.com/3d-fluency/94/high-priority.png" className="w-5 h-5" alt="Report" />
                        <span>Reported by {report.user_email}</span>
                        <span>•</span>
                        <span>{new Date(report.created_date).toLocaleDateString()}</span>
                    </div>

                    <div>
                        <div className="text-xs uppercase font-bold text-zinc-500 mb-1">Reason</div>
                        <div className="text-red-300 bg-red-900/10 border border-red-900/20 p-3 rounded-lg flex items-start gap-3">
                            <img src="https://img.icons8.com/3d-fluency/94/attention.png" className="w-6 h-6 mt-0.5" alt="Warning" />
                            {report.reason}
                        </div>
                    </div>

                    {targetContent && (
                        <div>
                            <div className="text-xs uppercase font-bold text-zinc-500 mb-1">Reported Content ({report.target_type})</div>
                            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-zinc-300 text-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <img src="https://img.icons8.com/3d-fluency/94/quote.png" className="w-16 h-16" alt="Quote" />
                                </div>
                                {report.target_type === 'thread' ? (
                                    <div className="font-bold mb-2 text-white text-lg">{targetContent.title}</div>
                                ) : null}
                                <div className="line-clamp-3 relative z-10">{targetContent.content}</div>
                            </div>
                            <div className="mt-2">
                                <a
                                    href={`/community/thread/${report.target_type === 'thread' ? report.target_id : targetContent.thread_id}`}
                                    target="_blank"
                                    className="text-fuchsia-400 hover:underline text-xs flex items-center gap-1 font-medium"
                                >
                                    View Context <img src="https://img.icons8.com/3d-fluency/94/external-link.png" className="w-4 h-4" alt="Link" />
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-l border-zinc-800 pl-6 flex flex-col gap-3 justify-center">
                    <div className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider text-center">Actions</div>
                    <Button
                        variant="outline"
                        className="justify-start border-zinc-700 hover:bg-zinc-800 text-zinc-300 h-10"
                        onClick={() => onResolve({ id: report.id, status: 'dismissed', notes: 'Dismissed by mod' })}
                    >
                        <img src="https://cdn3d.iconscout.com/3d/premium/thumb/pending-3d-icon-png-download-5326994.png" className="w-5 h-5 mr-2" alt="Dismiss" /> Dismiss
                    </Button>
                    <Button
                        variant="outline"
                        className="justify-start border-zinc-700 hover:bg-red-900/20 hover:border-red-900/30 text-red-400 h-10"
                        onClick={() => {
                            // Logic to delete content would go here
                            onResolve({ id: report.id, status: 'resolved', notes: 'Content deleted' });
                        }}
                    >
                        <img src="https://img.icons8.com/3d-fluency/94/trash.png" className="w-5 h-5 mr-2" alt="Delete" /> Delete Content
                    </Button>
                    <Button
                        variant="outline"
                        className="justify-start border-zinc-700 hover:bg-zinc-800 text-zinc-300 h-10"
                        onClick={() => onBan && onBan({ email: targetContent?.author_email, isBanned: true })}
                    >
                        <img src="https://img.icons8.com/3d-fluency/94/denied.png" className="w-5 h-5 mr-2" alt="Ban" /> Ban Author
                    </Button>
                </div>
            </div>
        </Card>
    );
}
