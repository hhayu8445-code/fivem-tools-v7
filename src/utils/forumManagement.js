// ✅ Professional Forum Management System - Modern Features
import { base44 } from '@/api/base44Client';
import { logToDiscord } from '@/utils';

export const forumManagement = {
    // Create advanced thread with full metadata
    createAdvancedThread: async (threadData, user) => {
        try {
            const thread = await base44.entities.ForumThread.create({
                ...threadData,
                author_email: user.email,
                author_name: user.full_name || user.username,
                author_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
                views: 0,
                replies_count: 0,
                likes_count: 0,
                score: 0,
                is_pinned: false,
                is_locked: false,
                last_reply_date: new Date().toISOString(),
                created_date: new Date().toISOString(),
                updated_date: new Date().toISOString()
            });

            // Update user stats
            const profiles = await base44.entities.UserProfile.list({
                query: { user_email: user.email },
                limit: 1
            });

            if (profiles.length > 0) {
                await base44.entities.UserProfile.update(profiles[0].id, {
                    posts_count: (profiles[0].posts_count || 0) + 1
                });
            }

            return thread;
        } catch (err) {
            console.error('Error creating advanced thread:', err);
            throw err;
        }
    },

    // Create reply with notifications
    createReply: async (replyData, user) => {
        try {
            const reply = await base44.entities.ForumReply.create({
                ...replyData,
                author_email: user.email,
                author_name: user.full_name || user.username,
                author_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
                likes_count: 0,
                score: 0,
                reports_count: 0,
                created_date: new Date().toISOString(),
                updated_date: new Date().toISOString()
            });

            // Update thread reply count
            if (replyData.thread_id) {
                const threads = await base44.entities.ForumThread.list({
                    query: { id: replyData.thread_id },
                    limit: 1
                });

                if (threads.length > 0) {
                    await base44.entities.ForumThread.update(threads[0].id, {
                        replies_count: (threads[0].replies_count || 0) + 1,
                        last_reply_date: new Date().toISOString()
                    });
                }
            }

            // Update user stats
            const profiles = await base44.entities.UserProfile.list({
                query: { user_email: user.email },
                limit: 1
            });

            if (profiles.length > 0) {
                await base44.entities.UserProfile.update(profiles[0].id, {
                    posts_count: (profiles[0].posts_count || 0) + 1
                });
            }

            return reply;
        } catch (err) {
            console.error('Error creating reply:', err);
            throw err;
        }
    },

    // Like thread/reply
    likeContent: async (contentType, contentId, userEmail) => {
        try {
            const entity = contentType === 'thread' ? base44.entities.ForumThread : base44.entities.ForumReply;
            const items = await entity.list({ query: { id: contentId }, limit: 1 });

            if (items.length > 0) {
                const item = items[0];
                await entity.update(item.id, {
                    likes_count: (item.likes_count || 0) + 1,
                    score: (item.score || 0) + 1
                });
            }

            return { success: true };
        } catch (err) {
            console.error('Error liking content:', err);
            throw err;
        }
    },

    // Report content (spam, inappropriate)
    reportContent: async (contentType, contentId, reason, userEmail) => {
        try {
            const entity = contentType === 'thread' ? base44.entities.ForumThread : base44.entities.ForumReply;
            const items = await entity.list({ query: { id: contentId }, limit: 1 });

            if (items.length > 0) {
                const item = items[0];
                await entity.update(item.id, {
                    reports_count: (item.reports_count || 0) + 1
                });
            }

            // Create report record
            await base44.entities.ForumReport.create({
                content_type: contentType,
                content_id: contentId,
                reason: reason,
                reporter_email: userEmail,
                status: 'pending',
                created_date: new Date().toISOString()
            });

            return { success: true, message: 'Report submitted' };
        } catch (err) {
            console.error('Error reporting content:', err);
            throw err;
        }
    },

    // Pin/unpin thread
    pinThread: async (threadId, isPinned, admin) => {
        try {
            await base44.entities.ForumThread.update(threadId, {
                is_pinned: isPinned
            });

            await logToDiscord('Thread Pinned', {
                type: 'forum',
                user: admin.full_name || admin.username,
                email: admin.email,
                description: `📌 Thread ${isPinned ? 'pinned' : 'unpinned'}`,
                extra: { 'Thread ID': threadId }
            });

            return { success: true };
        } catch (err) {
            console.error('Error pinning thread:', err);
            throw err;
        }
    },

    // Lock/unlock thread
    lockThread: async (threadId, isLocked, admin, reason = '') => {
        try {
            await base44.entities.ForumThread.update(threadId, {
                is_locked: isLocked
            });

            await logToDiscord(isLocked ? 'Thread Locked' : 'Thread Unlocked', {
                type: 'forum',
                user: admin.full_name || admin.username,
                email: admin.email,
                description: `🔒 Thread ${isLocked ? 'locked' : 'unlocked'}: ${reason}`,
                extra: { 'Thread ID': threadId, 'Reason': reason }
            });

            return { success: true };
        } catch (err) {
            console.error('Error locking thread:', err);
            throw err;
        }
    },

    // Delete thread (soft delete or hard)
    deleteThread: async (threadId, softDelete = true, admin, reason = '') => {
        try {
            if (softDelete) {
                await base44.entities.ForumThread.update(threadId, {
                    is_deleted: true,
                    deleted_reason: reason,
                    deleted_by: admin?.email,
                    deleted_date: new Date().toISOString()
                });
            } else {
                // Hard delete - requires additional permission
                // Implementation depends on backend capability
            }

            await logToDiscord('Thread Deleted', {
                type: 'forum',
                user: admin?.full_name || admin?.username,
                email: admin?.email,
                description: `🗑️ Thread deleted`,
                extra: { 'Thread ID': threadId, 'Reason': reason, 'Soft Delete': softDelete }
            });

            return { success: true };
        } catch (err) {
            console.error('Error deleting thread:', err);
            throw err;
        }
    },

    // Edit thread
    editThread: async (threadId, editedData, user) => {
        try {
            await base44.entities.ForumThread.update(threadId, {
                ...editedData,
                updated_date: new Date().toISOString(),
                updated_by: user.email
            });

            return { success: true, message: 'Thread updated' };
        } catch (err) {
            console.error('Error editing thread:', err);
            throw err;
        }
    },

    // Edit reply
    editReply: async (replyId, editedContent, user) => {
        try {
            await base44.entities.ForumReply.update(replyId, {
                content: editedContent,
                updated_date: new Date().toISOString(),
                updated_by: user.email
            });

            return { success: true, message: 'Reply updated' };
        } catch (err) {
            console.error('Error editing reply:', err);
            throw err;
        }
    },

    // Get trending threads
    getTrendingThreads: async (days = 7, limit = 10) => {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            const threads = await base44.entities.ForumThread.list({
                limit: 100,
                sort: { score: -1 }
            });

            // Filter recent threads and sort by score
            return threads
                .filter(t => new Date(t.created_date) >= cutoffDate && !t.is_deleted)
                .sort((a, b) => (b.score || 0) - (a.score || 0))
                .slice(0, limit);
        } catch (err) {
            console.error('Error fetching trending threads:', err);
            return [];
        }
    },

    // Get hot threads (many replies recently)
    getHotThreads: async (hours = 24, limit = 10) => {
        try {
            const cutoffDate = new Date();
            cutoffDate.setHours(cutoffDate.getHours() - hours);

            const threads = await base44.entities.ForumThread.list({
                limit: 100,
                sort: { last_reply_date: -1 }
            });

            return threads
                .filter(t => new Date(t.last_reply_date) >= cutoffDate && !t.is_deleted)
                .sort((a, b) => (b.replies_count || 0) - (a.replies_count || 0))
                .slice(0, limit);
        } catch (err) {
            console.error('Error fetching hot threads:', err);
            return [];
        }
    },

    // Search threads with advanced filters
    searchThreads: async (query, filters = {}) => {
        try {
            const allThreads = await base44.entities.ForumThread.list({ limit: 1000 });

            let results = allThreads.filter(t =>
                !t.is_deleted &&
                (t.title?.toLowerCase().includes(query.toLowerCase()) ||
                    t.content?.toLowerCase().includes(query.toLowerCase()))
            );

            // Apply filters
            if (filters.category_id) {
                results = results.filter(t => t.category_id === filters.category_id);
            }

            if (filters.author_email) {
                results = results.filter(t => t.author_email === filters.author_email);
            }

            if (filters.min_replies) {
                results = results.filter(t => (t.replies_count || 0) >= filters.min_replies);
            }

            if (filters.min_views) {
                results = results.filter(t => (t.views || 0) >= filters.min_views);
            }

            if (filters.only_pinned) {
                results = results.filter(t => t.is_pinned === true);
            }

            // Sort by relevance/date
            const sortBy = filters.sort_by || 'relevance';
            if (sortBy === 'date') {
                results.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
            } else if (sortBy === 'replies') {
                results.sort((a, b) => (b.replies_count || 0) - (a.replies_count || 0));
            } else if (sortBy === 'score') {
                results.sort((a, b) => (b.score || 0) - (a.score || 0));
            }

            return results.slice(0, filters.limit || 50);
        } catch (err) {
            console.error('Error searching threads:', err);
            return [];
        }
    },

    // Get forum statistics
    getForumStats: async () => {
        try {
            const [threads, replies, categories, users] = await Promise.all([
                base44.entities.ForumThread.list({ limit: 10000 }),
                base44.entities.ForumReply.list({ limit: 10000 }),
                base44.entities.ForumCategory.list({ limit: 1000 }),
                base44.entities.UserProfile.list({ limit: 10000 })
            ]);

            const activeThreads = threads.filter(t => !t.is_deleted).length;
            const pinnedThreads = threads.filter(t => t.is_pinned).length;
            const lockedThreads = threads.filter(t => t.is_locked).length;
            const totalReplies = replies.filter(r => !r.is_deleted).length;

            return {
                total_threads: activeThreads,
                total_replies: totalReplies,
                total_categories: categories.length,
                pinned_threads: pinnedThreads,
                locked_threads: lockedThreads,
                active_users: users.filter(u => u.posts_count > 0).length,
                avg_replies_per_thread: Math.round(totalReplies / (activeThreads || 1)),
                most_active_category: categories[0]?.name || 'N/A'
            };
        } catch (err) {
            console.error('Error fetching forum stats:', err);
            return null;
        }
    },

    // Get user forum activity
    getUserForumActivity: async (userEmail) => {
        try {
            const [threads, replies, profiles] = await Promise.all([
                base44.entities.ForumThread.list({ query: { author_email: userEmail }, limit: 1000 }),
                base44.entities.ForumReply.list({ query: { author_email: userEmail }, limit: 1000 }),
                base44.entities.UserProfile.list({ query: { user_email: userEmail }, limit: 1 })
            ]);

            const profile = profiles[0];

            return {
                email: userEmail,
                total_threads: threads.filter(t => !t.is_deleted).length,
                total_replies: replies.filter(r => !r.is_deleted).length,
                total_posts: (profile?.posts_count || 0),
                total_likes_received: (profile?.likes_received_count || 0),
                reputation: (profile?.reputation || 0),
                threads: threads.slice(0, 20),
                latest_activity: profile?.last_seen
            };
        } catch (err) {
            console.error('Error fetching user forum activity:', err);
            return null;
        }
    },

    // Get unapproved/flagged content
    getPendingReports: async (limit = 50) => {
        try {
            const reports = await base44.entities.ForumReport.list({
                query: { status: 'pending' },
                limit,
                sort: { created_date: -1 }
            });

            return reports;
        } catch (err) {
            console.error('Error fetching pending reports:', err);
            return [];
        }
    },

    // Handle report action
    handleReport: async (reportId, action, admin, notes = '') => {
        try {
            const actions = ['approve', 'reject', 'delete'];
            if (!actions.includes(action)) {
                throw new Error('Invalid action');
            }

            await base44.entities.ForumReport.update(reportId, {
                status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'deleted',
                resolved_by: admin.email,
                resolved_date: new Date().toISOString(),
                notes: notes
            });

            await logToDiscord('Report Handled', {
                type: 'forum',
                user: admin.full_name || admin.username,
                email: admin.email,
                description: `🛡️ Report ${action}ed`,
                extra: { 'Report ID': reportId, 'Notes': notes }
            });

            return { success: true };
        } catch (err) {
            console.error('Error handling report:', err);
            throw err;
        }
    },

    // View thread (increment view count)
    viewThread: async (threadId) => {
        try {
            const threads = await base44.entities.ForumThread.list({
                query: { id: threadId },
                limit: 1
            });

            if (threads.length > 0) {
                await base44.entities.ForumThread.update(threads[0].id, {
                    views: (threads[0].views || 0) + 1
                });
            }
        } catch (err) {
            console.error('Error incrementing view count:', err);
        }
    }
};
