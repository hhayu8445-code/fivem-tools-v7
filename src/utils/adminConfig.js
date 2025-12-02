// Admin Configuration
export const ADMIN_DISCORD_IDS = [
  '1197320834889560127' // Main Admin
];

export const isAdmin = (user) => {
  if (!user || !user.id) return false;
  return ADMIN_DISCORD_IDS.includes(user.id);
};

export const isModerator = async (user) => {
  if (!user || !user.email) return false;
  if (isAdmin(user)) return true;
  
  // Check if user has moderator role in database
  const { base44 } = await import('@/api/base44Client');
  const profiles = await base44.entities.UserProfile.list({
    query: { user_email: user.email },
    limit: 1
  });
  
  if (profiles.length > 0) {
    return profiles[0].membership_tier === 'admin' || profiles[0].membership_tier === 'moderator';
  }
  
  return false;
};
