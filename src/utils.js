import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { preventXSS } from "@/utils/security"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function getAchievements(profile) {
  if (!profile) return [];
  // ✅ FIX: Sanitize profile data to prevent XSS attacks
  const sanitizedProfile = {
    ...profile,
    username: profile.username ? preventXSS(profile.username) : '',
    bio: profile.bio ? preventXSS(profile.bio) : '',
  };

  const list = [];

  if (sanitizedProfile.posts_count >= 1) list.push({ name: 'First Words', desc: 'Made your first post', icon: 'https://cdn3d.iconscout.com/3d/premium/thumb/message-3d-icon-png-download-5576258.png', color: 'text-blue-400 bg-blue-500/10' });
  if (sanitizedProfile.posts_count >= 50) list.push({ name: 'Contributor', desc: 'Posted 50 times', icon: 'https://img.icons8.com/3d-fluency/94/edit.png', color: 'text-fuchsia-400 bg-fuchsia-500/10' });
  if (sanitizedProfile.likes_received_count >= 10) list.push({ name: 'Appreciated', desc: 'Received 10 likes', icon: 'https://img.icons8.com/3d-fluency/94/like.png', color: 'text-red-400 bg-red-500/10' });
  if (sanitizedProfile.reputation >= 50) list.push({ name: 'Respected', desc: '50+ Reputation Score', icon: 'https://img.icons8.com/3d-fluency/94/star.png', color: 'text-purple-400 bg-purple-500/10' });
  if (sanitizedProfile.reputation >= 200) list.push({ name: 'Community Pillar', desc: '200+ Reputation Score', icon: 'https://img.icons8.com/3d-fluency/94/shield.png', color: 'text-indigo-400 bg-indigo-500/10' });
  if (sanitizedProfile.points >= 100) list.push({ name: 'Point Collector', desc: 'Earned 100 points', icon: 'https://img.icons8.com/3d-fluency/94/lightning-bolt.png', color: 'text-amber-400 bg-amber-500/10' });
  if (sanitizedProfile.membership_tier === 'vip') list.push({ name: 'VIP Member', desc: 'Supported the community', icon: 'https://img.icons8.com/3d-fluency/94/crown.png', color: 'text-yellow-400 bg-yellow-500/10' });

  list.push({ name: 'Newcomer', desc: 'Joined the community', icon: 'https://img.icons8.com/3d-fluency/94/user-male-circle.png', color: 'text-emerald-400 bg-emerald-500/10' });

  return list;
}

// 3D Icons Constants
export const ICONS = {
  script: 'https://img.icons8.com/3d-fluency/94/source-code.png',
  mlo: 'https://img.icons8.com/3d-fluency/94/map-marker.png',
  vehicle: 'https://images.icon-icons.com/577/PNG/256/Car_Grey_icon-icons.com_54905.png',
  clothing: 'https://cdn3d.iconscout.com/3d/premium/thumb/vacation-wear-3d-icon-png-download-4551865.png',
  search: 'https://img.icons8.com/3d-fluency/94/search.png',
  download: 'https://img.icons8.com/3d-fluency/94/download-from-cloud.png',
  users: 'https://img.icons8.com/3d-fluency/94/conference-call.png',
  clock: 'https://img.icons8.com/3d-fluency/94/clock.png',
  star: 'https://img.icons8.com/3d-fluency/94/star.png',
  crown: 'https://img.icons8.com/3d-fluency/94/crown.png',
  shield: 'https://img.icons8.com/3d-fluency/94/shield.png',
  box: 'https://cdn3d.iconscout.com/3d/premium/thumb/add-folder-3d-icon-png-download-5727515.png',
  forward: 'https://img.icons8.com/3d-fluency/94/forward.png',
  plus: 'https://img.icons8.com/3d-fluency/94/plus.png',
};

export const CONFIG = {
  REFETCH_INTERVAL: { FAST: 30000, NORMAL: 60000, SLOW: 300000 },
  SITE_NAME: 'FiveM Tools V7',
  SITE_DESCRIPTION: 'Premium FiveM Scripts, MLOs, Vehicles & EUP - Ultimate Resource Hub for ESX & QBCore Servers',
  SITE_URL: 'https://fivemtools.net',
  DISCORD_URL: 'https://discord.gg/fivemtools',
  DISCORD_URL_ALT: 'https://discord.gg/tZXg4GVRM5',
};

export function getIconUrl(iconName) {
  const icons = {
    'Megaphone': 'https://img.icons8.com/3d-fluency/94/megaphone.png',
    'MessageSquare': 'https://cdn3d.iconscout.com/3d/premium/thumb/message-3d-icon-png-download-5576258.png',
    'HelpCircle': 'https://img.icons8.com/3d-fluency/94/help.png',
    'Code': 'https://img.icons8.com/3d-fluency/94/source-code.png',
    'Briefcase': 'https://img.icons8.com/3d-fluency/94/briefcase.png'
  };
  return icons[iconName] || 'https://cdn3d.iconscout.com/3d/premium/thumb/message-3d-icon-png-download-5576258.png';
}

const WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL;

const getEmbedColor = (type) => {
  const colors = {
    login: 0x00ff00, logout: 0xff0000, download: 0x0099ff, upload: 0xff9900,
    thread: 0x9900ff, reply: 0xff00ff, vote: 0xffff00, report: 0xff0000,
    message: 0x00ffff, admin: 0xff0000, mod: 0xffa500, error: 0xff0000,
    success: 0x00ff00, info: 0x0099ff
  };
  return colors[type] || 0x808080;
};

export const logToDiscord = async (action, details = {}) => {
  try {
    const embed = {
      title: `🔔 ${action}`,
      color: getEmbedColor(details.type || 'info'),
      fields: [
        { name: '👤 User', value: details.user || 'Anonymous', inline: true },
        { name: '📧 Email', value: details.email || 'N/A', inline: true },
        { name: '⏰ Time', value: new Date().toLocaleString(), inline: true },
      ],
      timestamp: new Date().toISOString(),
      footer: { text: 'FiveM Tools V7 Activity Log' }
    };

    if (details.description) embed.description = details.description;
    if (details.extra) {
      Object.entries(details.extra).forEach(([key, value]) => {
        embed.fields.push({ name: key, value: String(value), inline: true });
      });
    }

    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    });
  } catch (error) {
    console.error('Discord log failed:', error);
  }
};
