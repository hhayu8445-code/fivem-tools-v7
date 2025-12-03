import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { forumManagement } from '@/utils/forumManagement';
import LoginRequiredModal from '@/Components/LoginRequiredModal';
import LoadingOverlay from '@/Components/LoadingOverlay';

export default function ForumModerationDashboard() {
    const { user, loading: authLoading } = useAuth();
    const [showLoginModal, setShowLoginModal] = React.useState(!user && !authLoading);
    const [selectedThread, setSelectedThread] = useState(null);
    const [lockReason, setLockReason] = useState('');

    React.useEffect(() => {
        if (authLoading) return;
        setShowLoginModal(!user);
    }, [user, authLoading]);

    // Get pending reports
    const { data: pendingReports = [], refetch: refetchReports } = useQuery({
        queryKey: ['pendingReports'],
        queryFn: () => forumManagement.getPendingReports(100),
        enabled: !!user,
        refetchInterval: 30000
    });

    // Get forum statistics
    const { data: forumStats } = useQuery({
        queryKey: ['forumStats'],
        queryFn: forumManagement.getForumStats,
        enabled: !!user,
        refetchInterval: 60000
    });

    // Get trending threads
    const { data: trendingThreads = [] } = useQuery({
        queryKey: ['trendingThreads'],
        queryFn: () => forumManagement.getTrendingThreads(7, 20),
        enabled: !!user
    });

    // Get hot threads
    const { data: hotThreads = [] } = useQuery({
        queryKey: ['hotThreads'],
        queryFn: () => forumManagement.getHotThreads(24, 20),
        enabled: !!user
    });

    // Mutations
    const pinThreadMutation = useMutation({
        mutationFn: async (threadId) => {
            const threads = await base44.entities.ForumThread.list({ query: { id: threadId }, limit: 1 });
            const thread = threads[0];
            return forumManagement.pinThread(threadId, !thread.is_pinned, user);
        },
        onSuccess: (result) => {
            toast.success(result.message || 'Thread updated');
            refetchReports();
        },
        onError: (err) => {
            toast.error('Failed: ' + err.message);
        }
    });

    const lockThreadMutation = useMutation({
        mutationFn: async () => {
            if (!selectedThread) throw new Error('No thread selected');
            return forumManagement.lockThread(selectedThread.id, !selectedThread.is_locked, user, lockReason);
        },
        onSuccess: (result) => {
            toast.success(result.message || 'Thread locked');
            setSelectedThread(null);
            setLockReason('');
            refetchReports();
        },
        onError: (err) => {
            toast.error('Failed: ' + err.message);
        }
    });

    const handleReportMutation = useMutation({
        mutationFn: async ({ reportId, action, notes }) => {
            return forumManagement.handleReport(reportId, action, user, notes);
        },
        onSuccess: () => {
            toast.success('Report handled');
            refetchReports();
        },
        onError: (err) => {
            toast.error('Failed: ' + err.message);
        }
    });

    if (!user) return <div className="p-10 text-white">Access Denied</div>;

    return (
        <>
            <LoginRequiredModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                message="You must login first"
            />
            <div className="max-w-7xl mx-auto py-10 space-y-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <img src="https://img.icons8.com/3d-fluency/94/shield.png" className="w-10 h-10" alt="Moderation" />
                    Forum Moderation Dashboard
                </h1>

                {/* Forum Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-fuchsia-400">{forumStats?.total_threads || 0}</div>
                            <p className="text-zinc-400 text-sm">Total Threads</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-violet-400">{forumStats?.total_replies || 0}</div>
                            <p className="text-zinc-400 text-sm">Total Replies</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-amber-400">{forumStats?.pinned_threads || 0}</div>
                            <p className="text-zinc-400 text-sm">Pinned Threads</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-red-400">{forumStats?.locked_threads || 0}</div>
                            <p className="text-zinc-400 text-sm">Locked Threads</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="reports" className="w-full">
                    <TabsList className="bg-zinc-900 border border-zinc-800">
                        <TabsTrigger value="reports">Pending Reports</TabsTrigger>
                        <TabsTrigger value="trending">Trending Threads</TabsTrigger>
                        <TabsTrigger value="hot">Hot Threads</TabsTrigger>
                    </TabsList>

                    {/* Pending Reports */}
                    <TabsContent value="reports" className="mt-6 space-y-4">
                        {pendingReports.length === 0 ? (
                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardContent className="pt-6 text-center text-zinc-400">
                                    No pending reports
                                </CardContent>
                            </Card>
                        ) : (
                            pendingReports.map(report => (
                                <Card key={report.id} className="bg-zinc-900 border-zinc-800">
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-medium text-zinc-300">
                                                    {report.content_type.toUpperCase()} - {report.reason}
                                                </p>
                                                <p className="text-xs text-zinc-500">Reported by: {report.reporter_email}</p>
                                                <p className="text-xs text-zinc-500">
                                                    {formatDistanceToNow(new Date(report.created_date))} ago
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleReportMutation.mutate({ reportId: report.id, action: 'approve', notes: '' })}
                                                    disabled={handleReportMutation.isPending}
                                                >
                                                    ✅ Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-red-600 hover:bg-red-700"
                                                    onClick={() => handleReportMutation.mutate({ reportId: report.id, action: 'reject', notes: '' })}
                                                    disabled={handleReportMutation.isPending}
                                                >
                                                    ❌ Reject
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    {/* Trending Threads */}
                    <TabsContent value="trending" className="mt-6 space-y-4">
                        {trendingThreads.map(thread => (
                            <Card key={thread.id} className="bg-zinc-900 border-zinc-800">
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-white mb-2">{thread.title}</h3>
                                            <div className="flex gap-4 text-xs text-zinc-400">
                                                <span>👍 {thread.likes_count || 0} likes</span>
                                                <span>💬 {thread.replies_count || 0} replies</span>
                                                <span>👁️ {thread.views || 0} views</span>
                                                <span>⭐ Score: {thread.score || 0}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => pinThreadMutation.mutate(thread.id)}
                                                disabled={pinThreadMutation.isPending}
                                            >
                                                {thread.is_pinned ? '📌 Unpin' : '📌 Pin'}
                                            </Button>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setSelectedThread(thread)}
                                                    >
                                                        🔒 {thread.is_locked ? 'Unlock' : 'Lock'}
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                                                    <DialogHeader>
                                                        <DialogTitle>Lock Thread</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <Label>Reason</Label>
                                                            <Textarea
                                                                value={lockReason}
                                                                onChange={(e) => setLockReason(e.target.value)}
                                                                placeholder="Why are you locking this thread?"
                                                                className="bg-zinc-950 border-zinc-800 mt-2"
                                                            />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button
                                                            onClick={() => lockThreadMutation.mutate()}
                                                            disabled={lockThreadMutation.isPending}
                                                            className="bg-red-600 hover:bg-red-700"
                                                        >
                                                            {lockThreadMutation.isPending ? 'Locking...' : 'Lock Thread'}
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    {/* Hot Threads */}
                    <TabsContent value="hot" className="mt-6 space-y-4">
                        {hotThreads.map(thread => (
                            <Card key={thread.id} className="bg-zinc-900 border-zinc-800">
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-white mb-2">{thread.title}</h3>
                                            <div className="flex gap-4 text-xs text-zinc-400">
                                                <span>💬 {thread.replies_count || 0} recent replies</span>
                                                <span>👁️ {thread.views || 0} views</span>
                                                <span>Last reply: {formatDistanceToNow(new Date(thread.last_reply_date))} ago</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => pinThreadMutation.mutate(thread.id)}
                                                disabled={pinThreadMutation.isPending}
                                            >
                                                {thread.is_pinned ? '📌 Unpin' : '📌 Pin'}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
