import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useOnlineCount() {
  return useQuery({
    queryKey: ['onlineCount'],
    queryFn: async () => {
      const users = await base44.entities.UserProfile.list({ sort: { last_seen: -1 }, limit: 100 });
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return users.filter(u => new Date(u.last_seen) > fiveMinutesAgo).length;
    },
    refetchInterval: 5000
  });
}

export function useTotalMembers() {
  return useQuery({
    queryKey: ['totalMembers'],
    queryFn: async () => {
      const users = await base44.entities.UserProfile.list({ limit: 1000 });
      return users.length;
    },
    refetchInterval: 30000
  });
}

export function useTotalAssets() {
  return useQuery({
    queryKey: ['totalAssets'],
    queryFn: async () => {
      const assets = await base44.entities.Asset.list({ limit: 1000 });
      return assets.length;
    },
    refetchInterval: 60000
  });
}

export function useTodayDownloads() {
  return useQuery({
    queryKey: ['todayDownloads'],
    queryFn: async () => {
      const logs = await base44.entities.DownloadLog.list({ limit: 1000 });
      const today = new Date().toDateString();
      return logs.filter(l => new Date(l.download_date).toDateString() === today).length;
    },
    refetchInterval: 10000
  });
}

export function useAllStats() {
  const onlineCount = useOnlineCount();
  const totalMembers = useTotalMembers();
  const totalAssets = useTotalAssets();
  const todayDownloads = useTodayDownloads();

  return {
    onlineCount: onlineCount.data || 0,
    totalMembers: totalMembers.data || 0,
    totalAssets: totalAssets.data || 0,
    todayDownloads: todayDownloads.data || 0,
    isLoading: onlineCount.isLoading || totalMembers.isLoading || totalAssets.isLoading || todayDownloads.isLoading
  };
}
