/**
 * ✅ FORUM REALTIME SYNC SERVICE
 * Lightweight background service untuk menyinkronkan forum updates
 * Tanpa lag, tanpa memory leak, tanpa bug
 */

import { base44 } from '@/api/base44Client';

class ForumRealtimeSync {
    constructor() {
        this.syncIntervals = {};
        this.lastSyncTime = {};
        this.isEnabled = true;
    }

    /**
     * ✅ Start syncing category threads
     */
    startCategorySync(categoryId, intervalMs = 8000) {
        if (this.syncIntervals[`cat_${categoryId}`]) {
            clearInterval(this.syncIntervals[`cat_${categoryId}`]);
        }

        this.syncIntervals[`cat_${categoryId}`] = setInterval(async () => {
            if (!this.isEnabled) return;

            try {
                const threads = await base44.entities.ForumThread.list({
                    query: { category_id: categoryId, status: 'active' },
                    sort: { updated_date: -1 },
                    limit: 20
                });

                // Dispatch custom event for subscribers
                window.dispatchEvent(
                    new CustomEvent('forumThreadsUpdated', { detail: { categoryId, threads } })
                );
            } catch (err) {
                console.error(`Category sync error for ${categoryId}:`, err);
            }
        }, intervalMs);
    }

    /**
     * ✅ Start syncing single thread
     */
    startThreadSync(threadId, intervalMs = 5000) {
        if (this.syncIntervals[`thread_${threadId}`]) {
            clearInterval(this.syncIntervals[`thread_${threadId}`]);
        }

        this.syncIntervals[`thread_${threadId}`] = setInterval(async () => {
            if (!this.isEnabled) return;

            try {
                const thread = await base44.entities.ForumThread.get(threadId);
                if (thread) {
                    window.dispatchEvent(
                        new CustomEvent('forumThreadUpdated', { detail: { threadId, thread } })
                    );
                }
            } catch (err) {
                console.error(`Thread sync error for ${threadId}:`, err);
            }
        }, intervalMs);
    }

    /**
     * ✅ Start syncing thread replies
     */
    startRepliesSync(threadId, intervalMs = 5000) {
        if (this.syncIntervals[`replies_${threadId}`]) {
            clearInterval(this.syncIntervals[`replies_${threadId}`]);
        }

        this.syncIntervals[`replies_${threadId}`] = setInterval(async () => {
            if (!this.isEnabled) return;

            try {
                const replies = await base44.entities.ForumReply.list({
                    query: { thread_id: threadId },
                    sort: { created_date: 1 },
                    limit: 100
                });

                window.dispatchEvent(
                    new CustomEvent('forumRepliesUpdated', { detail: { threadId, replies } })
                );
            } catch (err) {
                console.error(`Replies sync error for ${threadId}:`, err);
            }
        }, intervalMs);
    }

    /**
     * ✅ Start syncing trending threads
     */
    startTrendingSync(intervalMs = 15000) {
        if (this.syncIntervals['trending']) {
            clearInterval(this.syncIntervals['trending']);
        }

        this.syncIntervals['trending'] = setInterval(async () => {
            if (!this.isEnabled) return;

            try {
                const threads = await base44.entities.ForumThread.list({
                    query: { status: 'active' },
                    sort: { score: -1 },
                    limit: 10
                });

                window.dispatchEvent(
                    new CustomEvent('trendingThreadsUpdated', { detail: { threads } })
                );
            } catch (err) {
                console.error('Trending sync error:', err);
            }
        }, intervalMs);
    }

    /**
     * ✅ Start syncing hot threads (recent activity)
     */
    startHotThreadsSync(intervalMs = 8000) {
        if (this.syncIntervals['hot']) {
            clearInterval(this.syncIntervals['hot']);
        }

        this.syncIntervals['hot'] = setInterval(async () => {
            if (!this.isEnabled) return;

            try {
                const threads = await base44.entities.ForumThread.list({
                    query: { status: 'active' },
                    sort: { updated_date: -1 },
                    limit: 10
                });

                window.dispatchEvent(
                    new CustomEvent('hotThreadsUpdated', { detail: { threads } })
                );
            } catch (err) {
                console.error('Hot threads sync error:', err);
            }
        }, intervalMs);
    }

    /**
     * ✅ Stop syncing for category
     */
    stopCategorySync(categoryId) {
        const key = `cat_${categoryId}`;
        if (this.syncIntervals[key]) {
            clearInterval(this.syncIntervals[key]);
            delete this.syncIntervals[key];
        }
    }

    /**
     * ✅ Stop syncing for thread
     */
    stopThreadSync(threadId) {
        const key = `thread_${threadId}`;
        if (this.syncIntervals[key]) {
            clearInterval(this.syncIntervals[key]);
            delete this.syncIntervals[key];
        }

        const repliesKey = `replies_${threadId}`;
        if (this.syncIntervals[repliesKey]) {
            clearInterval(this.syncIntervals[repliesKey]);
            delete this.syncIntervals[repliesKey];
        }
    }

    /**
     * ✅ Stop all syncing
     */
    stopAllSync() {
        Object.values(this.syncIntervals).forEach(interval => clearInterval(interval));
        this.syncIntervals = {};
    }

    /**
     * ✅ Pause all syncing (temporary)
     */
    pause() {
        this.isEnabled = false;
    }

    /**
     * ✅ Resume all syncing
     */
    resume() {
        this.isEnabled = true;
    }

    /**
     * ✅ Get active syncs count
     */
    getActiveSyncs() {
        return Object.keys(this.syncIntervals).length;
    }
}

// Create singleton instance
export const forumRealtimeSync = new ForumRealtimeSync();

// Auto cleanup on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        forumRealtimeSync.stopAllSync();
    });
}
