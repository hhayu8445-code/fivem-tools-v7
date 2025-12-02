import { base44 } from '@/api/base44Client';

export const ACHIEVEMENTS = {
  first_download: { name: 'First Download', desc: 'Downloaded your first asset', points: 10, icon: '🎯' },
  first_post: { name: 'First Post', desc: 'Created your first forum post', points: 15, icon: '✍️' },
  helpful_member: { name: 'Helpful Member', desc: 'Received 10+ likes', points: 25, icon: '🤝' },
  vip_member: { name: 'VIP Member', desc: 'Upgraded to VIP tier', points: 50, icon: '👑' },
  veteran: { name: 'Veteran', desc: 'Member for 30+ days', points: 100, icon: '🏆' },
  bug_hunter: { name: 'Bug Hunter', desc: 'Reported 5+ bugs', points: 75, icon: '🐛' },
  top_contributor: { name: 'Top Contributor', desc: 'Created 50+ posts', points: 200, icon: '⭐' }
};

export async function checkAndAwardAchievement(userEmail, achievementType) {
  try {
    const existing = await base44.entities.Achievement.list({
      query: { user_email: userEmail, achievement_type: achievementType }
    });
    
    if (existing.length > 0) return null;

    const achievement = await base44.entities.Achievement.create({
      user_email: userEmail,
      achievement_type: achievementType,
      earned_date: new Date().toISOString(),
      points_awarded: ACHIEVEMENTS[achievementType].points
    });

    const profile = await base44.entities.UserProfile.list({ query: { user_email: userEmail } });
    if (profile[0]) {
      await base44.entities.UserProfile.update(profile[0].id, {
        points: (profile[0].points || 0) + ACHIEVEMENTS[achievementType].points
      });
    }

    return achievement;
  } catch (error) {
    console.error('Achievement error:', error);
    return null;
  }
}

export async function getUserAchievements(userEmail) {
  try {
    return await base44.entities.Achievement.list({ query: { user_email: userEmail } });
  } catch {
    return [];
  }
}
