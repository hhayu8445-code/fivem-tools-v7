import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * ✅ FORUM REALTIME HOOK - Optimized for Performance
 * Handles all forum updates in realtime with automatic synchronization
 */

export function useForumRealtimeUpdates(categoryId, threadId) {
    const queryClient = useQueryClient();
    const updateIntervalRef = useRef(null);
    const lastUpdateRef = useRef({});

    // Auto-refresh threads every 8 seconds (optimized)
    useEffect(() => {
        if (!categoryId) return;

        const refetch = () => {
            queryClient.invalidateQueries(['forumThreads', categoryId]);
        };

        updateIntervalRef.current = setInterval(refetch, 8000);
        return () => clearInterval(updateIntervalRef.current);
    }, [categoryId, queryClient]);

    // Auto-refresh single thread every 5 seconds
    useEffect(() => {
        if (!threadId) return;

        const refetch = () => {
            queryClient.invalidateQueries(['forumThread', threadId]);
            queryClient.invalidateQueries(['forumReplies', threadId]);
        };

        updateIntervalRef.current = setInterval(refetch, 5000);
        return () => clearInterval(updateIntervalRef.current);
    }, [threadId, queryClient]);

    // Auto-increment view count optimized (every 30 seconds)
    const incrementViewsOptimized = useCallback(async () => {
        if (!threadId || lastUpdateRef.current.views === threadId) return;

        try {
            const thread = await base44.entities.ForumThread.get(threadId);
            if (thread) {
                await base44.entities.ForumThread.update(threadId, {
                    views: (thread.views || 0) + 1,
                    updated_date: new Date().toISOString()
                });
                lastUpdateRef.current.views = threadId;
            }
        } catch (err) {
            console.error('View increment failed:', err);
        }
    }, [threadId]);

    useEffect(() => {
        if (!threadId) return;

        incrementViewsOptimized();
        const interval = setInterval(incrementViewsOptimized, 30000);
        return () => clearInterval(interval);
    }, [threadId, incrementViewsOptimized]);

    return { queryClient };
}

/**
 * ✅ FETCH THREADS WITH REALTIME
 */
export function useForumThreadsRealtime(categoryId, options = {}) {
    const { limit = 20, skip = 0 } = options;

    return useQuery({
        queryKey: ['forumThreads', categoryId, skip],
        queryFn: async () => {
            const threads = await base44.entities.ForumThread.list({
                query: { category_id: categoryId },
                limit,
                skip,
                sort: { updated_date: -1 }
            });
            return threads || [];
        },
        staleTime: 5000,
        refetchInterval: 8000
    });
}

/**
 * ✅ FETCH SINGLE THREAD WITH REALTIME
 */
export function useForumThreadRealtime(threadId) {
    return useQuery({
        queryKey: ['forumThread', threadId],
        queryFn: async () => {
            if (!threadId) return null;
            return await base44.entities.ForumThread.get(threadId);
        },
        enabled: !!threadId,
        staleTime: 3000,
        refetchInterval: 5000
    });
}

/**
 * ✅ FETCH REPLIES WITH REALTIME
 */
export function useForumRepliesRealtime(threadId, options = {}) {
    const { limit = 50, skip = 0 } = options;

    return useQuery({
        queryKey: ['forumReplies', threadId, skip],
        queryFn: async () => {
            if (!threadId) return [];
            const replies = await base44.entities.ForumReply.list({
                query: { thread_id: threadId },
                limit,
                skip,
                sort: { created_date: 1 }
            });
            return replies || [];
        },
        enabled: !!threadId,
        staleTime: 3000,
        refetchInterval: 5000
    });
}

/**
 * ✅ CREATE THREAD MUTATION
 */
export function useCreateForumThread() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ threadData, user }) => {
            const newThread = await base44.entities.ForumThread.create({
                ...threadData,
                author_email: user.email,
                author_name: user.username,
                author_avatar: user.avatar,
                views: 0,
                replies_count: 0,
                likes_count: 0,
                score: 0,
                is_pinned: false,
                is_locked: false,
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

            return newThread;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['forumThreads']);
            queryClient.invalidateQueries(['trendingThreads']);
        }
    });
}

/**
 * ✅ CREATE REPLY MUTATION
 */
export function useCreateForumReply() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ replyData, user, threadId }) => {
            const newReply = await base44.entities.ForumReply.create({
                ...replyData,
                author_email: user.email,
                author_name: user.username,
                author_avatar: user.avatar,
                is_solution: false,
                is_edited: false,
                created_date: new Date().toISOString()
            });

            // Update thread reply count
            const thread = await base44.entities.ForumThread.get(threadId);
            await base44.entities.ForumThread.update(threadId, {
                replies_count: (thread.replies_count || 0) + 1,
                last_reply_date: new Date().toISOString(),
                updated_date: new Date().toISOString(),
                score: (thread.score || 0) + 1
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

            return newReply;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['forumReplies', variables.threadId]);
            queryClient.invalidateQueries(['forumThread', variables.threadId]);
            queryClient.invalidateQueries(['forumThreads']);
        }
    });
}

/**
 * ✅ LIKE THREAD MUTATION
 */
export function useLikeForumThread() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ threadId, userId }) => {
            // Check if already liked
            const likes = await base44.entities.ForumLike.list({
                query: { thread_id: threadId, user_id: userId }
            });

            if (likes.length > 0) {
                // Unlike
                await base44.entities.ForumLike.delete(likes[0].id);

                const thread = await base44.entities.ForumThread.get(threadId);
                await base44.entities.ForumThread.update(threadId, {
                    likes_count: Math.max(0, (thread.likes_count || 1) - 1),
                    score: Math.max(0, (thread.score || 1) - 1),
                    updated_date: new Date().toISOString()
                });

                return false;
            } else {
                // Like
                await base44.entities.ForumLike.create({
                    thread_id: threadId,
                    user_id: userId,
                    created_date: new Date().toISOString()
                });

                const thread = await base44.entities.ForumThread.get(threadId);
                await base44.entities.ForumThread.update(threadId, {
                    likes_count: (thread.likes_count || 0) + 1,
                    score: (thread.score || 0) + 2,
                    updated_date: new Date().toISOString()
                });

                return true;
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['forumThread', variables.threadId]);
            queryClient.invalidateQueries(['forumThreads']);
        }
    });
}

/**
 * ✅ LIKE REPLY MUTATION
 */
export function useLikeForumReply() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ replyId, threadId, userId }) => {
            const likes = await base44.entities.ForumLike.list({
                query: { reply_id: replyId, user_id: userId }
            });

            if (likes.length > 0) {
                await base44.entities.ForumLike.delete(likes[0].id);

                const reply = await base44.entities.ForumReply.get(replyId);
                await base44.entities.ForumReply.update(replyId, {
                    likes_count: Math.max(0, (reply.likes_count || 1) - 1)
                });

                return false;
            } else {
                await base44.entities.ForumLike.create({
                    reply_id: replyId,
                    user_id: userId,
                    created_date: new Date().toISOString()
                });

                const reply = await base44.entities.ForumReply.get(replyId);
                await base44.entities.ForumReply.update(replyId, {
                    likes_count: (reply.likes_count || 0) + 1
                });

                return true;
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['forumReplies', variables.threadId]);
        }
    });
}

/**
 * ✅ DELETE THREAD MUTATION
 */
export function useDeleteForumThread() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ threadId, reason, admin }) => {
            const thread = await base44.entities.ForumThread.get(threadId);

            // Soft delete
            await base44.entities.ForumThread.update(threadId, {
                status: 'deleted',
                deleted_at: new Date().toISOString(),
                deletion_reason: reason || 'No reason provided',
                deleted_by: admin
            });

            return thread;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['forumThreads']);
        }
    });
}

/**
 * ✅ EDIT REPLY MUTATION
 */
export function useEditForumReply() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ replyId, threadId, content }) => {
            await base44.entities.ForumReply.update(replyId, {
                content,
                is_edited: true,
                edited_at: new Date().toISOString()
            });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['forumReplies', variables.threadId]);
        }
    });
}

/**
 * ✅ GET TRENDING THREADS
 */
export function useTrendingThreadsRealtime(days = 7, limit = 5) {
    return useQuery({
        queryKey: ['trendingThreads', days],
        queryFn: async () => {
            const threads = await base44.entities.ForumThread.list({
                query: { status: 'active' },
                sort: { score: -1 },
                limit
            });
            return threads || [];
        },
        staleTime: 10000,
        refetchInterval: 15000
    });
}

/**
 * ✅ GET HOT THREADS (Recent activity)
 */
export function useHotThreadsRealtime(limit = 10) {
    return useQuery({
        queryKey: ['hotThreads'],
        queryFn: async () => {
            const threads = await base44.entities.ForumThread.list({
                query: { status: 'active' },
                sort: { updated_date: -1 },
                limit
            });
            return threads || [];
        },
        staleTime: 5000,
        refetchInterval: 8000
    });
}
