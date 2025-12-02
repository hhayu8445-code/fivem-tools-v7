// Local Vouch Storage System - No Base44 Required
const VOUCH_STORAGE_KEY = 'fivem_vouches';
import { ADMIN_CONFIG } from '@/config/admin';

// Get all vouches
export const getAllVouches = () => {
  try {
    const data = localStorage.getItem(VOUCH_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Save vouches
const saveVouches = (vouches) => {
  localStorage.setItem(VOUCH_STORAGE_KEY, JSON.stringify(vouches));
};

// Add new vouch
export const addVouch = (vouchData) => {
  const vouches = getAllVouches();
  const newVouch = {
    id: Date.now().toString(),
    ...vouchData,
    verified: true,
    created_date: new Date().toISOString()
  };
  vouches.push(newVouch);
  saveVouches(vouches);
  return newVouch;
};

// Get vouch by user ID
export const getVouchByUserId = (userId) => {
  const vouches = getAllVouches();
  return vouches.find(v => v.discord_user_id === userId && v.verified);
};

// Get vouch by message ID
export const getVouchByMessageId = (messageId) => {
  const vouches = getAllVouches();
  return vouches.find(v => v.message_id === messageId);
};

// Update vouch
export const updateVouch = (id, updates) => {
  const vouches = getAllVouches();
  const index = vouches.findIndex(v => v.id === id);
  if (index !== -1) {
    vouches[index] = { ...vouches[index], ...updates };
    saveVouches(vouches);
    return vouches[index];
  }
  return null;
};

// Delete vouch
export const deleteVouch = (id) => {
  const vouches = getAllVouches();
  const filtered = vouches.filter(v => v.id !== id);
  saveVouches(filtered);
  return true;
};

// Check if user is admin
export const isAdmin = (userId) => {
  return ADMIN_CONFIG.isAdmin(userId);
};

// Get stats
export const getVouchStats = () => {
  const vouches = getAllVouches();
  return {
    total: vouches.length,
    verified: vouches.filter(v => v.verified).length,
    pending: vouches.filter(v => !v.verified).length
  };
};
