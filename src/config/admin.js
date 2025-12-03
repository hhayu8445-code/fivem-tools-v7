// Admin Configuration - Single Source of Truth
export const ADMIN_CONFIG = {
  ADMIN_IDS: ['1197320834889560127', '1047719075322810378'], // New admin ID added
  isAdmin: (userId) => ADMIN_CONFIG.ADMIN_IDS.includes(userId),
  isModerator: async (user) => {
    if (!user || !user.email) return false;
    if (ADMIN_CONFIG.isAdmin(user.id)) return true;
    
    const { base44 } = await import('@/api/base44Client');
    const profiles = await base44.entities.UserProfile.list({
      query: { user_email: user.email },
      limit: 1
    });
    
    if (profiles.length > 0) {
      return profiles[0].membership_tier === 'admin' || profiles[0].membership_tier === 'moderator';
    }
    
    return false;
  }
};
