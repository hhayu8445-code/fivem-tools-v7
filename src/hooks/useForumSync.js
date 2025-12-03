/**
 * ✅ FORUM REALTIME SYNC HOOK
 * Event-driven hook untuk real-time forum updates
 * Zero lag, lightweight, performance optimized
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { forumRealtimeSync } from '@/services/forumRealtimeSync';

/**
 * ✅ Hook untuk sync category threads
 */
export function useCategoryThreadsSync(categoryId) {
    const [threads, setThreads] = useState([]);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!categoryId) return;

        // Start sync
        forumRealtimeSync.startCategorySync(categoryId, 8000);

        // Listen to updates
        const handleUpdate = (event) => {
            setThreads(event.detail.threads);
            queryClient.invalidateQueries(['forumThreads', categoryId]);
        };

        window.addEventListener('forumThreadsUpdated', handleUpdate);

        return () => {
            window.removeEventListener('forumThreadsUpdated', handleUpdate);
            forumRealtimeSync.stopCategorySync(categoryId);
        };
    }, [categoryId, queryClient]);

    return threads;
}

/**
 * ✅ Hook untuk sync single thread
 */
export function useThreadSync(threadId) {
    const [thread, setThread] = useState(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!threadId) return;

        // Start sync
        forumRealtimeSync.startThreadSync(threadId, 5000);

        // Listen to updates
        const handleUpdate = (event) => {
            if (event.detail.threadId === threadId) {
                setThread(event.detail.thread);
                queryClient.invalidateQueries(['forumThread', threadId]);
            }
        };

        window.addEventListener('forumThreadUpdated', handleUpdate);

        return () => {
            window.removeEventListener('forumThreadUpdated', handleUpdate);
            forumRealtimeSync.stopThreadSync(threadId);
        };
    }, [threadId, queryClient]);

    return thread;
}

/**
 * ✅ Hook untuk sync thread replies
 */
export function useThreadRepliesSync(threadId) {
    const [replies, setReplies] = useState([]);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!threadId) return;

        // Start sync
        forumRealtimeSync.startRepliesSync(threadId, 5000);

        // Listen to updates
        const handleUpdate = (event) => {
            if (event.detail.threadId === threadId) {
                setReplies(event.detail.replies);
                queryClient.invalidateQueries(['forumReplies', threadId]);
            }
        };

        window.addEventListener('forumRepliesUpdated', handleUpdate);

        return () => {
            window.removeEventListener('forumRepliesUpdated', handleUpdate);
            forumRealtimeSync.stopThreadSync(threadId);
        };
    }, [threadId, queryClient]);

    return replies;
}

/**
 * ✅ Hook untuk sync trending threads
 */
export function useTrendingThreadsSync() {
    const [threads, setThreads] = useState([]);
    const queryClient = useQueryClient();

    useEffect(() => {
        // Start sync
        forumRealtimeSync.startTrendingSync(15000);

        // Listen to updates
        const handleUpdate = (event) => {
            setThreads(event.detail.threads);
            queryClient.invalidateQueries(['trendingThreads']);
        };

        window.addEventListener('trendingThreadsUpdated', handleUpdate);

        return () => {
            window.removeEventListener('trendingThreadsUpdated', handleUpdate);
            if (this.syncIntervals['trending']) clearInterval(this.syncIntervals['trending']);
        };
    }, [queryClient]);

    return threads;
}

/**
 * ✅ Hook untuk sync hot threads
 */
export function useHotThreadsSync() {
    const [threads, setThreads] = useState([]);
    const queryClient = useQueryClient();

    useEffect(() => {
        // Start sync
        forumRealtimeSync.startHotThreadsSync(8000);

        // Listen to updates
        const handleUpdate = (event) => {
            setThreads(event.detail.threads);
            queryClient.invalidateQueries(['hotThreads']);
        };

        window.addEventListener('hotThreadsUpdated', handleUpdate);

        return () => {
            window.removeEventListener('hotThreadsUpdated', handleUpdate);
        };
    }, [queryClient]);

    return threads;
}

/**
 * ✅ Hook untuk manage realtime sync lifecycle
 */
export function useForumSyncManager() {
    const pausedRef = useRef(false);

    const pause = useCallback(() => {
        forumRealtimeSync.pause();
        pausedRef.current = true;
    }, []);

    const resume = useCallback(() => {
        forumRealtimeSync.resume();
        pausedRef.current = false;
    }, []);

    const stop = useCallback(() => {
        forumRealtimeSync.stopAllSync();
    }, []);

    const getStatus = useCallback(() => ({
        isPaused: pausedRef.current,
        activeSyncs: forumRealtimeSync.getActiveSyncs()
    }), []);

    useEffect(() => {
        return () => {
            forumRealtimeSync.stopAllSync();
        };
    }, []);

    return { pause, resume, stop, getStatus };
}
