// Admin Configuration
export const ADMIN_CONFIG = {
  ADMIN_IDS: ['1197320834889560127'],
  isAdmin: (userId) => ADMIN_CONFIG.ADMIN_IDS.includes(userId)
};
