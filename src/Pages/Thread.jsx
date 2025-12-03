import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';
import { Skeleton } from '@/Components/ui/skeleton';
import { toast } from 'sonner';
import LoadingSpinner from '@/Components/LoadingSpinner';
import LoadingOverlay from '@/Components/LoadingOverlay';
import LoginRequiredModal from '@/Components/LoginRequiredModal';
import MemberBadge from '@/Components/MemberBadge';
import { logToDiscord } from '@/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { formatDistanceToNow } from 'date-fns';
import {
  useThreadSync,
  useThreadRepliesSync,
  useForumSyncManager
} from '@/hooks/useForumSync';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import ReactMarkdown from 'react-markdown';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function Thread() {
    const { id: threadId } = useParams();
    const navigate = useNavigate();
    const [replyContent, setReplyContent] = useState('');
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [replyPage, setReplyPage] = useState(1);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [threadLoading, setThreadLoading] = useState(true);
    const [repliesLoading, setRepliesLoading] = useState(true);
    const REPLIES_PER_PAGE = 10;
    const queryClient = useQueryClient();

    // ✅ REALTIME SYNC: Event-driven thread updates
    const thread = useThreadSync(threadId);
    const replies = useThreadRepliesSync(threadId);
    const { pause: pauseSync, resume: resumeSync } = useForumSyncManager();

    // ✅ Auto-update loading states when data arrives
    useEffect(() => {
      if (thread) setThreadLoading(false);
    }, [thread]);

    useEffect(() => {
      if (replies && replies.length >= 0) setRepliesLoading(false);
    }, [replies]);

    // ✅ Fetch user profile
    useEffect(() => {
        base44.auth.me().then(async (u) => {
            setUser(u);
            if (u) {
                const profiles = await base44.entities.UserProfile.list({ query: { user_email: u.email } });
                if (profiles.length > 0) setUserProfile(profiles[0]);
            }
        }).catch(() => { });
    }, []);

    const isAdminOrMod = userProfile?.membership_tier === 'admin' || userProfile?.membership_tier === 'moderator';

    // Helper for badges
    const UserBadge = ({ email }) => {
        const { data: profile } = useQuery({
            queryKey: ['userProfile', email],
            queryFn: async () => {
                const p = await base44.entities.UserProfile.list({ query: { user_email: email } });
                return p[0];
            },
            enabled: !!email
        });

        if (!profile) return null;

        return (
            <div className="flex flex-col gap-2 mt-2">
                <div className="flex justify-center">
                    <MemberBadge tier={profile.membership_tier} size="md" showLabel={true} />
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-zinc-500 mt-1 bg-zinc-950/50 p-2 rounded border border-zinc-800">
                    <div className="flex items-center gap-1">
                        <img src="https://img.icons8.com/3d-fluency/94/chat-message.png" className="w-3 h-3" alt="" />
                        {profile.posts_count || 0}
                    </div>
                    <div className="flex items-center gap-1">
                        <img src="https://img.icons8.com/3d-fluency/94/like.png" className="w-3 h-3" alt="" />
                        {profile.likes_received_count || 0}
                    </div>
                </div>
            </div>
        );
    };

    // Helper for Signature
    const UserSignature = ({ email }) => {
        const { data: profile } = useQuery({
            queryKey: ['userProfile', email],
            queryFn: async () => {
                const p = await base44.entities.UserProfile.list({ query: { user_email: email } });
                return p[0];
            },
            enabled: !!email
        });

        if (!profile?.forum_signature) return null;
        return (
            <div className="mt-4 pt-4 border-t border-zinc-800 text-xs text-zinc-500 max-h-20 overflow-hidden opacity-70">
                <ReactMarkdown>{profile.forum_signature}</ReactMarkdown>
            </div>
        );
    };

    // Helper to safely render HTML content
    const RichTextDisplay = ({ content }) => {
        // Simple check if it looks like HTML (starts with <) otherwise treat as markdown
        // This is a basic heuristic for backward compatibility
        if (content && content.trim().startsWith('<')) {
            return <div className="prose prose-invert prose-fuchsia max-w-none" dangerouslySetInnerHTML={{ __html: content }} />;
        }
        return (
            <div className="prose prose-invert prose-fuchsia max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
        );
    };

    const replyMutation = useMutation({
        mutationFn: async () => {
            if (!user) throw new Error("Not logged in");
            await base44.entities.ForumReply.create({
                content: replyContent,
                thread_id: threadId,
                author_email: user.email,
                author_name: user.full_name || user.email.split('@')[0],
                author_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
            });

            // Update thread reply count and last reply date
            await base44.entities.ForumThread.update(threadId, {
                replies_count: (thread?.replies_count || 0) + 1,
                last_reply_date: new Date().toISOString()
            });

            // Send Notification
            if (thread?.author_email !== user.email) {
                await base44.entities.Notification.create({
                    user_email: thread.author_email,
                    type: 'reply',
                    message: `${user.full_name || 'Someone'} replied to your thread "${thread?.title}"`,
                    link: `/community/thread/${threadId}`,
                    is_read: false
                });
            }
        },
        onSuccess: () => {
            setReplyContent('');
            // ✅ Realtime sync will auto-update the replies list via event
            toast.success('Reply posted successfully!');
            logToDiscord('New Reply Posted', {
                type: 'reply',
                user: user.full_name || user.username,
                email: user.email,
                description: `💬 Reply posted on thread: ${thread?.title}`,
                extra: { 'Thread ID': threadId }
            });
        },
        onError: () => {
            setShowLoginModal(true);
        }
    });

    const VoteControl = ({ targetId, targetType, initialScore, authorEmail }) => {
        const [score, setScore] = useState(initialScore || 0);
        const [userVote, setUserVote] = useState(0); // 0, 1, or -1

        // Check user's vote
        useQuery({
            queryKey: ['vote', targetId, user?.email],
            queryFn: async () => {
                if (!user) return 0;
                const votes = await base44.entities.ForumLike.list({ query: { user_email: user.email, target_id: targetId } });
                if (votes.length > 0) {
                    const val = votes[0].value !== undefined ? votes[0].value : 1;
                    setUserVote(val);
                    return val;
                }
                return 0;
            },
            enabled: !!user && !!targetId
        });

        const handleVote = useMutation({
            mutationFn: async (direction) => {
                if (!user) { setShowLoginModal(true); return; }

                const entity = targetType === 'thread' ? base44.entities.ForumThread : base44.entities.ForumReply;
                const profiles = await base44.entities.UserProfile.list({ query: { user_email: authorEmail } });
                const authorProfile = profiles[0];

                // Get existing vote record
                const existingVotes = await base44.entities.ForumLike.list({ query: { user_email: user.email, target_id: targetId } });
                const currentVoteRecord = existingVotes[0];

                let scoreChange = 0;
                let repChange = 0;

                if (currentVoteRecord) {
                    if (userVote === direction) {
                        // Remove vote
                        await base44.entities.ForumLike.delete(currentVoteRecord.id);
                        scoreChange = -direction;
                        repChange = -direction; // Revert rep
                        setUserVote(0);
                    } else {
                        // Switch vote (e.g. -1 to 1, or 1 to -1)
                        await base44.entities.ForumLike.update(currentVoteRecord.id, { value: direction });
                        scoreChange = direction * 2; // e.g. -1 to 1 is +2
                        repChange = direction * 2;
                        setUserVote(direction);
                    }
                } else {
                    // New vote
                    await base44.entities.ForumLike.create({
                        user_email: user.email,
                        target_id: targetId,
                        target_type: targetType,
                        value: direction
                    });
                    scoreChange = direction;
                    repChange = direction;
                    setUserVote(direction);

                    // Notify author on upvote
                    if (direction === 1 && authorEmail !== user.email) {
                        await base44.entities.Notification.create({
                            user_email: authorEmail,
                            type: 'like',
                            message: `${user.full_name || 'Someone'} upvoted your ${targetType}`,
                            link: targetType === 'thread' ? `/community/thread/${threadId}` : `/community/thread/${threadId}#reply-${targetId}`,
                            is_read: false
                        });
                    }
                }

                // Update content score
                const newScore = score + scoreChange;
                setScore(newScore);
                await entity.update(targetId, { score: newScore });

                // Update author reputation
                if (authorProfile && authorEmail !== user.email) {
                    const newRep = (authorProfile.reputation || 0) + repChange;
                    await base44.entities.UserProfile.update(authorProfile.id, { reputation: newRep });
                }
            },
            onSuccess: () => {
                toast.success('Vote recorded!');
                logToDiscord('Vote Cast', {
                    type: 'vote',
                    user: user.full_name || user.username,
                    email: user.email,
                    description: `${direction === 1 ? 'Upvote' : 'Downvote'} on ${targetType}`,
                    extra: { 'Target Type': targetType, 'Target ID': targetId }
                });
            },
            onError: () => {
                toast.error('Failed to vote');
            }
        });

        return (
            <div className="flex items-center gap-1 bg-zinc-900/50 rounded-lg border border-zinc-800 p-0.5">
                <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 hover:bg-emerald-500/10 ${userVote === 1 ? 'text-emerald-500' : 'text-zinc-500 hover:text-emerald-400'}`}
                    onClick={() => handleVote.mutate(1)}
                    disabled={handleVote.isPending}
                >
                    <img src="https://img.icons8.com/3d-fluency/94/arrow-up.png" className={`w-5 h-5 ${userVote === 1 ? 'opacity-100' : 'opacity-50'}`} alt="Upvote" />
                </Button>
                <span className={`text-sm font-bold min-w-[1.5rem] text-center ${score > 0 ? 'text-emerald-400' : score < 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                    {score}
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 hover:bg-red-500/10 ${userVote === -1 ? 'text-red-500' : 'text-zinc-500 hover:text-red-400'}`}
                    onClick={() => handleVote.mutate(-1)}
                    disabled={handleVote.isPending}
                >
                    <img src="https://img.icons8.com/3d-fluency/94/arrow-down.png" className={`w-5 h-5 ${userVote === -1 ? 'opacity-100' : 'opacity-50'}`} alt="Downvote" />
                </Button>
            </div>
        );
    };

    const ReportButton = ({ targetId, targetType }) => {
        const [open, setOpen] = useState(false);
        const [reason, setReason] = useState('');

        const submitReport = useMutation({
            mutationFn: async () => {
                if (!user) { setShowLoginModal(true); return; }
                await base44.entities.ForumReport.create({
                    user_email: user.email,
                    target_id: targetId,
                    target_type: targetType,
                    reason: reason
                });
                // Increment report count
                const entity = targetType === 'thread' ? base44.entities.ForumThread : base44.entities.ForumReply;
                // Note: we'd need to fetch current count first to increment reliably, but for UI we just push it.
                // Simplified for this demo.
            },
            onSuccess: () => {
                setOpen(false);
                setReason('');
                toast.success('Report submitted. Thank you!');
            },
            onError: () => {
                toast.error('Failed to submit report');
            }
        });

        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-red-400">
                        <img src="https://static.vecteezy.com/system/resources/previews/046/680/406/non_2x/3d-report-icon-report-symbol-3d-free-png.png" className="w-4 h-4 mr-2" alt="Report" /> Report
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Report Content</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Reason for reporting</Label>
                            <Textarea
                                placeholder="Describe the issue..."
                                className="bg-zinc-950 border-zinc-800"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setOpen(false)} className="text-zinc-400">Cancel</Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => submitReport.mutate()}
                            disabled={!reason.trim()}
                        >
                            Submit Report
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    if (threadLoading) return <LoadingSpinner fullScreen />;
    if (!thread) return <div className="p-10 text-white">Thread not found</div>;

    return (
        <>
            <LoginRequiredModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                message="You must login first to interact with this thread"
            />
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Breadcrumbs */}
                <div className="text-sm text-zinc-500 flex gap-2 items-center">
                    <Link to="/community" className="hover:text-fuchsia-400 transition-colors">Forums</Link>
                    <span>/</span>
                    <span className="text-zinc-300 max-w-[200px] truncate">{thread.title}</span>
                </div>

                {/* Thread Header */}
                <div className="space-y-4">
                    <div className="flex gap-2">
                        {thread.is_pinned && <Badge className="bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30"><img src="https://img.icons8.com/3d-fluency/94/pin.png" className="w-3 h-3 mr-1" alt="Pinned" /> Pinned</Badge>}
                        {thread.is_locked && <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><img src="https://img.icons8.com/3d-fluency/94/lock.png" className="w-3 h-3 mr-1" alt="Locked" /> Locked</Badge>}
                    </div>
                    <h1 className="text-3xl font-bold text-white">{thread.title}</h1>
                </div>

                {/* Original Post */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="bg-zinc-950/50 border-b border-zinc-800 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="text-sm text-zinc-400">
                                <span className="text-zinc-500">Posted</span> {formatDistanceToNow(new Date(thread.created_date))} ago
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isAdminOrMod && (
                                <div className="flex gap-1 mr-2">
                                    <Button
                                        size="sm" variant="ghost"
                                        className={thread.is_pinned ? "text-fuchsia-400" : "text-zinc-500"}
                                        onClick={() => base44.entities.ForumThread.update(thread.id, { is_pinned: !thread.is_pinned }).then(() => queryClient.invalidateQueries(['thread']))}
                                    >
                                        <img src="https://img.icons8.com/3d-fluency/94/pin.png" className="w-4 h-4" alt="Pin" />
                                    </Button>
                                    <Button
                                        size="sm" variant="ghost"
                                        className={thread.is_locked ? "text-red-400" : "text-zinc-500"}
                                        onClick={() => base44.entities.ForumThread.update(thread.id, { is_locked: !thread.is_locked }).then(() => queryClient.invalidateQueries(['thread']))}
                                    >
                                        <img src="https://img.icons8.com/3d-fluency/94/lock.png" className="w-4 h-4" alt="Lock" />
                                    </Button>
                                </div>
                            )}
                            {(user?.email === thread.author_email || isAdminOrMod) && (
                                <Button
                                    size="sm" variant="ghost"
                                    className="text-zinc-400 hover:text-fuchsia-400"
                                    onClick={() => navigate(`/community/edit-thread/${thread.id}`)}
                                >
                                    <img src="https://img.icons8.com/3d-fluency/94/edit.png" className="w-4 h-4 mr-1" alt="Edit" /> Edit
                                </Button>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><img src="https://img.icons8.com/3d-fluency/94/menu.png" className="w-4 h-4" alt="More" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                                    <DropdownMenuItem className="text-red-400">Report</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Virus Scan Link Alert */}
                    {thread.virus_scan_link && (
                        <div className="bg-emerald-950/20 border-b border-emerald-900/30 p-3 flex items-center gap-3 text-sm text-emerald-400">
                            <img src="https://img.icons8.com/3d-fluency/94/shield.png" className="w-4 h-4 shrink-0" alt="Shield" />
                            <span>This resource includes a virus scan:</span>
                            <a href={thread.virus_scan_link} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-300 font-medium truncate max-w-[300px] md:max-w-none">
                                {thread.virus_scan_link}
                            </a>
                        </div>
                    )}

                    <div className="p-6 flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0 text-center space-y-2 md:w-48">
                            <div className="w-20 h-20 mx-auto rounded-xl overflow-hidden border-2 border-zinc-800 shadow-lg">
                                <img src={thread.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${thread.author_email}`} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="cursor-pointer" onClick={() => navigate(`/profile?email=${thread.author_email}`)}>
                                <div className="font-bold text-white truncate hover:text-fuchsia-400 transition-colors">{thread.author_name}</div>
                                <UserBadge email={thread.author_email} />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <RichTextDisplay content={thread.content} />
                            <UserSignature email={thread.author_email} />
                        </div>
                    </div>
                    <div className="bg-zinc-950/30 border-t border-zinc-800 p-3 flex justify-between items-center gap-2">
                        <div className="flex gap-2">
                            <VoteControl targetId={thread.id} targetType="thread" initialScore={thread.score || 0} authorEmail={thread.author_email} />
                        </div>
                        <div className="flex gap-2">
                            <ReportButton targetId={thread.id} targetType="thread" />
                            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white"><img src="https://cdn3d.iconscout.com/3d/premium/thumb/share-button-3d-icon-png-download-5656052.png" className="w-4 h-4 mr-2" alt="Share" /> Share</Button>
                        </div>
                    </div>
                </div>

                {/* Replies */}
                <div className="space-y-4">
                    {replies?.map((reply) => (
                        <div key={reply.id} className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden" id={`reply-${reply.id}`}>
                            <div className="bg-zinc-950/30 border-b border-zinc-800 p-3 flex items-center justify-between">
                                <div className="text-xs text-zinc-500 flex items-center gap-2">
                                    <img src="https://img.icons8.com/3d-fluency/94/clock.png" className="w-3 h-3" alt="Time" /> {formatDistanceToNow(new Date(reply.created_date))} ago
                                </div>
                                <span className="text-xs text-zinc-600">#{reply.id.slice(-4)}</span>
                            </div>
                            <div className="p-6 flex flex-col md:flex-row gap-6">
                                <div className="flex-shrink-0 text-center space-y-2 md:w-48">
                                    <div className="w-12 h-12 mx-auto rounded-lg overflow-hidden border border-zinc-800">
                                        <img src={reply.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.author_email}`} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-sm font-medium text-zinc-300 truncate hover:text-fuchsia-400 cursor-pointer transition-colors" onClick={() => navigate(`/profile?email=${reply.author_email}`)}>
                                        {reply.author_name}
                                    </div>
                                    <UserBadge email={reply.author_email} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="mb-4">
                                        <RichTextDisplay content={reply.content} />
                                    </div>
                                    <UserSignature email={reply.author_email} />
                                    <div className="flex items-center justify-between gap-2 border-t border-zinc-800/50 pt-2">
                                        <VoteControl targetId={reply.id} targetType="reply" initialScore={reply.score || 0} authorEmail={reply.author_email} />
                                        <div className="flex gap-2">
                                            {(user?.email === reply.author_email || isAdminOrMod) && (
                                                <Button
                                                    size="sm" variant="ghost"
                                                    className="text-zinc-400 hover:text-fuchsia-400"
                                                    onClick={() => navigate(`/community/edit-reply/${reply.id}`)}
                                                >
                                                    <img src="https://img.icons8.com/3d-fluency/94/edit.png" className="w-4 h-4 mr-1" alt="Edit" /> Edit
                                                </Button>
                                            )}
                                            <ReportButton targetId={reply.id} targetType="reply" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Replies Pagination */}
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        disabled={replyPage === 1}
                        onClick={() => setReplyPage(p => p - 1)}
                        className="bg-zinc-900 border-zinc-800 text-zinc-300"
                    >
                        <img src="https://img.icons8.com/3d-fluency/94/double-left.png" className="w-4 h-4 mr-2" alt="Previous" /> Previous
                    </Button>
                    <Button
                        variant="outline"
                        disabled={!replies || replies.length < REPLIES_PER_PAGE}
                        onClick={() => setReplyPage(p => p + 1)}
                        className="bg-zinc-900 border-zinc-800 text-zinc-300"
                    >
                        Next <img src="https://img.icons8.com/3d-fluency/94/double-right.png" className="w-4 h-4 ml-2" alt="Next" />
                    </Button>
                </div>

                {/* Reply Box */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg sticky bottom-6">
                    {!user ? (
                        <div className="text-center py-4">
                            <p className="text-zinc-400 mb-4">You must be logged in to reply.</p>
                            <Button onClick={() => base44.auth.login()} className="bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-full px-6 font-medium shadow-[0_0_15px_rgba(88,101,242,0.4)] transition-all hover:scale-105">Login with Discord</Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-700 flex-shrink-0 hidden md:block">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="bg-white text-black rounded-lg overflow-hidden">
                                        <ReactQuill
                                            theme="snow"
                                            value={replyContent}
                                            onChange={setReplyContent}
                                            className="h-[150px] mb-12"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <p className="text-xs text-zinc-500">Be respectful and follow community guidelines.</p>
                                        <Button
                                            onClick={() => replyMutation.mutate()}
                                            disabled={!replyContent.trim() || replyMutation.isPending}
                                            className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white min-w-[120px]"
                                        >
                                            {replyMutation.isPending ? "Posting..." : "Post Reply"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
