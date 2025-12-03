// ✅ Admin Management Utilities - User Role, Ban, Moderation System
import { base44 } from '@/api/base44Client';
import { logToDiscord } from '@/utils';

export const adminManagement = {
    // Get all users with pagination
    getAllUsers: async (limit = 100, offset = 0) => {
        try {
            const users = await base44.entities.UserProfile.list({
                limit,
                offset,
                sort: '-created_at'
            });
            return users || [];
        } catch (err) {
            console.error('Error fetching users:', err);
            return [];
        }
    },

    // Search users by email or username
    searchUsers: async (query) => {
        try {
            const users = await base44.entities.UserProfile.list({
                query: { user_email: query },
                limit: 50
            });

            if (users.length === 0) {
                // Try searching by username or discord_id
                const allUsers = await base44.entities.UserProfile.list({ limit: 500 });
                return allUsers.filter(u =>
                    u.user_email?.toLowerCase().includes(query.toLowerCase()) ||
                    u.discord_id?.includes(query)
                ).slice(0, 50);
            }

            return users;
        } catch (err) {
            console.error('Error searching users:', err);
            return [];
        }
    },

    // Change user role/membership tier
    changeUserRole: async (userEmail, newTier, adminUser) => {
        try {
            const users = await base44.entities.UserProfile.list({
                query: { user_email: userEmail },
                limit: 1
            });

            if (users.length === 0) {
                throw new Error('User not found');
            }

            const user = users[0];
            const oldTier = user.membership_tier;

            await base44.entities.UserProfile.update(user.id, {
                membership_tier: newTier
            });

            // Log to Discord
            await logToDiscord('User Role Changed', {
                type: 'admin',
                user: adminUser?.full_name || adminUser?.username,
                email: adminUser?.email,
                description: `👤 Role changed for ${userEmail}`,
                extra: {
                    'Old Role': oldTier,
                    'New Role': newTier,
                    'User Email': userEmail,
                    'Timestamp': new Date().toISOString()
                }
            });

            return { success: true, message: `Role changed from ${oldTier} to ${newTier}` };
        } catch (err) {
            console.error('Error changing user role:', err);
            throw err;
        }
    },

    // Ban user
    banUser: async (userEmail, reason, adminUser) => {
        try {
            const users = await base44.entities.UserProfile.list({
                query: { user_email: userEmail },
                limit: 1
            });

            if (users.length === 0) {
                throw new Error('User not found');
            }

            const user = users[0];

            await base44.entities.UserProfile.update(user.id, {
                is_banned: true,
                ban_reason: reason,
                banned_at: new Date().toISOString(),
                banned_by: adminUser?.email
            });

            // Log to Discord
            await logToDiscord('User Banned', {
                type: 'admin',
                user: adminUser?.full_name || adminUser?.username,
                email: adminUser?.email,
                description: `🚫 User banned: ${userEmail}`,
                extra: {
                    'Banned User': userEmail,
                    'Reason': reason || 'No reason provided',
                    'Banned At': new Date().toISOString(),
                    'Banned By': adminUser?.email
                }
            });

            return { success: true, message: `User ${userEmail} has been banned` };
        } catch (err) {
            console.error('Error banning user:', err);
            throw err;
        }
    },

    // Unban user
    unbanUser: async (userEmail, adminUser) => {
        try {
            const users = await base44.entities.UserProfile.list({
                query: { user_email: userEmail },
                limit: 1
            });

            if (users.length === 0) {
                throw new Error('User not found');
            }

            const user = users[0];

            await base44.entities.UserProfile.update(user.id, {
                is_banned: false,
                ban_reason: null,
                banned_at: null,
                banned_by: null
            });

            // Log to Discord
            await logToDiscord('User Unbanned', {
                type: 'admin',
                user: adminUser?.full_name || adminUser?.username,
                email: adminUser?.email,
                description: `✅ User unbanned: ${userEmail}`,
                extra: {
                    'Unbanned User': userEmail,
                    'Unbanned At': new Date().toISOString(),
                    'Unbanned By': adminUser?.email
                }
            });

            return { success: true, message: `User ${userEmail} has been unbanned` };
        } catch (err) {
            console.error('Error unbanning user:', err);
            throw err;
        }
    },

    // Reset user statistics
    resetUserStats: async (userEmail, adminUser) => {
        try {
            const users = await base44.entities.UserProfile.list({
                query: { user_email: userEmail },
                limit: 1
            });

            if (users.length === 0) {
                throw new Error('User not found');
            }

            const user = users[0];

            await base44.entities.UserProfile.update(user.id, {
                daily_downloads_count: 0,
                total_downloads: 0,
                points: 0,
                reputation: 0,
                posts_count: 0,
                likes_received_count: 0
            });

            // Log to Discord
            await logToDiscord('User Stats Reset', {
                type: 'admin',
                user: adminUser?.full_name || adminUser?.username,
                email: adminUser?.email,
                description: `🔄 Stats reset for ${userEmail}`,
                extra: {
                    'User Email': userEmail,
                    'Reset At': new Date().toISOString(),
                    'Reset By': adminUser?.email
                }
            });

            return { success: true, message: `Stats for ${userEmail} have been reset` };
        } catch (err) {
            console.error('Error resetting user stats:', err);
            throw err;
        }
    },

    // Get banned users list
    getBannedUsers: async (limit = 100) => {
        try {
            const allUsers = await base44.entities.UserProfile.list({
                limit: 1000
            });

            return allUsers.filter(u => u.is_banned === true).slice(0, limit);
        } catch (err) {
            console.error('Error fetching banned users:', err);
            return [];
        }
    },

    // Get user statistics
    getUserStats: async (userEmail) => {
        try {
            const users = await base44.entities.UserProfile.list({
                query: { user_email: userEmail },
                limit: 1
            });

            if (users.length === 0) {
                throw new Error('User not found');
            }

            const user = users[0];
            const downloads = await base44.entities.DownloadLog.list({
                query: { user_email: userEmail },
                limit: 1000
            });

            return {
                email: user.user_email,
                username: user.username || 'Unknown',
                role: user.membership_tier,
                is_banned: user.is_banned,
                ban_reason: user.ban_reason,
                total_downloads: user.total_downloads || 0,
                daily_downloads: user.daily_downloads_count || 0,
                points: user.points || 0,
                reputation: user.reputation || 0,
                posts: user.posts_count || 0,
                likes_received: user.likes_received_count || 0,
                last_seen: user.last_seen,
                created_at: user.created_at,
                download_logs: downloads
            };
        } catch (err) {
            console.error('Error fetching user stats:', err);
            throw err;
        }
    },

    // Promote user to VIP
    promoteToVIP: async (userEmail, adminUser) => {
        return adminManagement.changeUserRole(userEmail, 'vip', adminUser);
    },

    // Promote user to Moderator
    promoteToModerator: async (userEmail, adminUser) => {
        return adminManagement.changeUserRole(userEmail, 'moderator', adminUser);
    },

    // Demote user to Free
    demoteToFree: async (userEmail, adminUser) => {
        return adminManagement.changeUserRole(userEmail, 'free', adminUser);
    },

    // Wipe user data (except email for records)
    wipeUserData: async (userEmail, adminUser) => {
        try {
            const users = await base44.entities.UserProfile.list({
                query: { user_email: userEmail },
                limit: 1
            });

            if (users.length === 0) {
                throw new Error('User not found');
            }

            const user = users[0];

            await base44.entities.UserProfile.update(user.id, {
                username: null,
                discord_id: null,
                daily_downloads_count: 0,
                total_downloads: 0,
                points: 0,
                reputation: 0,
                forum_signature: null,
                posts_count: 0,
                likes_received_count: 0
            });

            // Log to Discord
            await logToDiscord('User Data Wiped', {
                type: 'admin',
                user: adminUser?.full_name || adminUser?.username,
                email: adminUser?.email,
                description: `🗑️ User data wiped: ${userEmail}`,
                extra: {
                    'User Email': userEmail,
                    'Wiped At': new Date().toISOString(),
                    'Wiped By': adminUser?.email
                }
            });

            return { success: true, message: `User data for ${userEmail} has been wiped` };
        } catch (err) {
            console.error('Error wiping user data:', err);
            throw err;
        }
    },

    // Get moderation statistics
    getModerationStats: async () => {
        try {
            const allUsers = await base44.entities.UserProfile.list({ limit: 1000 });

            const stats = {
                total_users: allUsers.length,
                banned_users: allUsers.filter(u => u.is_banned).length,
                vip_users: allUsers.filter(u => u.membership_tier === 'vip').length,
                moderators: allUsers.filter(u => u.membership_tier === 'moderator').length,
                admins: allUsers.filter(u => u.membership_tier === 'admin').length,
                by_tier: {
                    free: allUsers.filter(u => u.membership_tier === 'free').length,
                    vip: allUsers.filter(u => u.membership_tier === 'vip').length,
                    moderator: allUsers.filter(u => u.membership_tier === 'moderator').length,
                    admin: allUsers.filter(u => u.membership_tier === 'admin').length,
                    guest: allUsers.filter(u => u.membership_tier === 'guest').length
                }
            };

            return stats;
        } catch (err) {
            console.error('Error fetching moderation stats:', err);
            return null;
        }
    }
};
