// ✅ Download Tracking Utilities - Detailed Analytics
import { base44 } from '@/api/base44Client';

export const downloadTracking = {
  // Get all downloads for an asset with user details
  getAssetDownloads: async (assetId) => {
    try {
      const downloads = await base44.entities.DownloadLog.list({
        query: { asset_id: assetId },
        limit: 1000,
        sort: '-download_date'
      });
      return downloads;
    } catch (err) {
      console.error('Error fetching asset downloads:', err);
      return [];
    }
  },

  // Get downloads by user
  getUserDownloads: async (userEmail) => {
    try {
      const downloads = await base44.entities.DownloadLog.list({
        query: { user_email: userEmail },
        limit: 1000,
        sort: '-download_date'
      });
      return downloads;
    } catch (err) {
      console.error('Error fetching user downloads:', err);
      return [];
    }
  },

  // Get download stats for dashboard
  getDownloadStats: async (days = 30) => {
    try {
      const allDownloads = await base44.entities.DownloadLog.list({
        limit: 10000,
        sort: '-download_date'
      });

      // Filter by date range
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const recentDownloads = allDownloads.filter(d => 
        new Date(d.download_date) >= cutoffDate
      );

      // Calculate stats
      const stats = {
        total: recentDownloads.length,
        byCategory: {},
        byTier: {},
        byUser: {},
        topAssets: {},
        topUsers: {}
      };

      recentDownloads.forEach(download => {
        // By category
        stats.byCategory[download.asset_category] = (stats.byCategory[download.asset_category] || 0) + 1;
        
        // By membership tier
        stats.byTier[download.user_profile_tier || 'free'] = (stats.byTier[download.user_profile_tier || 'free'] || 0) + 1;
        
        // By user
        const userKey = `${download.username} (${download.user_email})`;
        stats.byUser[userKey] = (stats.byUser[userKey] || 0) + 1;

        // Top assets
        const assetKey = `${download.asset_title} (${download.asset_id})`;
        stats.topAssets[assetKey] = (stats.topAssets[assetKey] || 0) + 1;

        // Top users
        stats.topUsers[userKey] = (stats.topUsers[userKey] || 0) + 1;
      });

      return {
        ...stats,
        period: `Last ${days} days`,
        generatedAt: new Date().toISOString()
      };
    } catch (err) {
      console.error('Error calculating download stats:', err);
      return null;
    }
  },

  // Get who downloaded what - detailed report
  getDetailedDownloadReport: async (assetId) => {
    try {
      const downloads = await downloadTracking.getAssetDownloads(assetId);
      
      return {
        total_downloads: downloads.length,
        downloaders: downloads.map(d => ({
          username: d.username,
          email: d.user_email,
          user_id: d.user_id,
          membership_tier: d.user_profile_tier,
          downloaded_at: d.download_date,
          ip_info: d.ip_info
        })),
        by_tier: downloads.reduce((acc, d) => {
          const tier = d.user_profile_tier || 'free';
          acc[tier] = (acc[tier] || 0) + 1;
          return acc;
        }, {}),
        unique_users: new Set(downloads.map(d => d.user_email)).size
      };
    } catch (err) {
      console.error('Error generating report:', err);
      return null;
    }
  }
};

export default downloadTracking;
