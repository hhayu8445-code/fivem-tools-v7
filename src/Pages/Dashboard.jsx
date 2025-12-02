import React from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/Components/ui/tabs';
import { Skeleton } from '@/Components/ui/skeleton';
import { Trophy, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { getAchievements } from '@/utils';
import { getUserAchievements, ACHIEVEMENTS } from '@/utils/gamification';
import { toast } from 'sonner';
import LoadingSpinner from '@/Components/LoadingSpinner';
import LoadingOverlay from '@/Components/LoadingOverlay';
import LoginRequiredModal from '@/Components/LoginRequiredModal';

function SettingsForm({ profile, queryClient }) {
  const [signature, setSignature] = React.useState(profile?.forum_signature || '');
  const [discordId, setDiscordId] = React.useState(profile?.discord_id || '');

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.update(profile.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
      toast.success('Settings updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update settings');
    }
  });

  return (
    <div className="relative">
      {updateMutation.isPending && <LoadingOverlay message="Saving..." />}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Forum Signature</label>
        <div className="flex gap-3">
          <Input
            placeholder="Your forum signature (Markdown supported)"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            className="bg-zinc-950 border-zinc-800 text-white"
          />
          <Button
            onClick={() => updateMutation.mutate({ forum_signature: signature })}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Save
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Discord ID</label>
        <div className="flex gap-3">
          <Input
            placeholder="Ex: 123456789012345678"
            value={discordId}
            onChange={(e) => setDiscordId(e.target.value)}
            className="bg-zinc-950 border-zinc-800 text-white"
          />
          <Button
            onClick={() => updateMutation.mutate({ discord_id: discordId })}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Save
          </Button>
        </div>
        <p className="text-xs text-zinc-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Required for Role Sync in our Discord server.
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  // ✅ FIX: Use useAuth hook instead of duplicate useState/useEffect
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [showLoginModal, setShowLoginModal] = React.useState(!user && !loading);

  React.useEffect(() => {
    if (loading) return;
    setShowLoginModal(!user);
      setUser(u);
    };
    load();
  }, []);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list({ query: { user_email: user.email } });
      return profiles[0];
    },
    enabled: !!user,
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['downloadHistory', user?.email],
    queryFn: () => base44.entities.DownloadLog.list({
      query: { user_email: user.email },
      sort: { download_date: -1 },
      limit: 20
    }),
    enabled: !!user,
  });

  // Get asset details for history
  const { data: historyWithAssets } = useQuery({
    queryKey: ['historyAssets', history],
    queryFn: async () => {
      if (!history?.length) return [];
      const assetIds = [...new Set(history.map(h => h.asset_id))];
      const assets = await Promise.all(assetIds.map(id =>
        base44.entities.Asset.list({ query: { id } }).then(res => res[0])
      ));
      return history.map(h => ({
        ...h,
        asset: assets.find(a => a?.id === h.asset_id)
      })).filter(h => h.asset);
    },
    enabled: !!history?.length
  });

  const { data: userAchievements } = useQuery({
    queryKey: ['userAchievements', user?.email],
    queryFn: () => getUserAchievements(user.email),
    enabled: !!user
  });

  const achievements = React.useMemo(() => {
    if (!userAchievements) return [];
    return userAchievements.map(ach => ({
      ...ACHIEVEMENTS[ach.achievement_type],
      earned_date: ach.earned_date,
      points: ach.points_awarded
    }));
  }, [userAchievements]);

  if (!user || profileLoading) return <LoadingSpinner fullScreen />;

  const isVip = profile?.membership_tier === 'vip' || profile?.membership_tier === 'admin';
  const dailyLimit = isVip ? 999 : 3;
  const downloadsToday = profile?.daily_downloads_count || 0; // In a real app we'd reset this daily on backend

  return (
    <>
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="You must login first to access your dashboard"
      />
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white">User Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Membership Card */}
          <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 md:col-span-1 relative overflow-hidden">
            {isVip && (
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-violet-600/20 blur-3xl rounded-full" />
            )}
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <img src="https://img.icons8.com/3d-fluency/94/shield.png" className={isVip ? "w-6 h-6" : "w-6 h-6 grayscale opacity-50"} alt="Shield" /> Membership
              </CardTitle>
              <CardDescription className="text-zinc-500">Your current plan status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-2xl font-bold capitalize text-white">{profile?.membership_tier} Tier</div>
                  <div className="text-sm text-zinc-500">
                    {isVip ? "Unlimited Access" : "Standard Access"}
                  </div>
                </div>
                {isVip ? <img src="https://img.icons8.com/3d-fluency/94/crown.png" className="w-10 h-10" alt="VIP" /> : <img src="https://img.icons8.com/3d-fluency/94/user-male-circle.png" className="w-10 h-10 grayscale" alt="User" />}
              </div>

              {!isVip && (
                <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0">
                  <img src="https://img.icons8.com/3d-fluency/94/lightning-bolt.png" className="w-4 h-4 mr-2" alt="Upgrade" /> Upgrade to VIP
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Download Stats */}
          <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <img src="https://img.icons8.com/3d-fluency/94/download-from-cloud.png" className="w-6 h-6" alt="Download" /> Usage Stats
              </CardTitle>
              <CardDescription className="text-zinc-500">Your download quota resets at 00:00</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <div className="text-sm text-zinc-400">Daily Downloads</div>
                  <div className="text-3xl font-bold text-white">{downloadsToday} / {isVip ? '∞' : dailyLimit}</div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isVip ? 'bg-emerald-500' : 'bg-blue-500'}`}
                      style={{ width: isVip ? '100%' : `${(downloadsToday / dailyLimit) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-zinc-400">Total Points</div>
                  <div className="text-3xl font-bold text-white">{profile?.points || 0}</div>
                  <div className="text-xs text-zinc-500">Earn points by reporting bugs</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-zinc-400">Community Stats</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-white">{profile?.posts_count || 0}</div>
                      <div className="text-xs text-zinc-500">Posts</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{profile?.likes_received_count || 0}</div>
                      <div className="text-xs text-zinc-500">Likes Received</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="achievements" className="w-full">
          <TabsList className="bg-zinc-900 border border-zinc-800 text-zinc-400">
            <TabsTrigger value="achievements" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
              <img src="https://img.icons8.com/3d-fluency/94/trophy.png" className="w-4 h-4 mr-2" alt="Achievements" /> Achievements
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
              <img src="https://cdn3d.iconscout.com/3d/premium/thumb/history-3d-icon-png-download-10740148.png" className="w-4 h-4 mr-2" alt="History" /> Download History
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
              <img src="https://cdn.iconscout.com/icon/free/png-256/free-apple-settings-icon-svg-download-png-493162.png?f=webp" className="w-4 h-4 mr-2" alt="Settings" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.length > 0 ? achievements.map((ach, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center gap-4 hover:border-fuchsia-500/30 transition-all">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-3xl">
                    {ach.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white">{ach.name}</div>
                    <div className="text-xs text-zinc-500">{ach.desc}</div>
                    <div className="text-xs text-emerald-400 mt-1">+{ach.points} points</div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-8 text-zinc-500">
                  <p>No achievements yet. Start exploring to earn badges!</p>
                </div>
              )}
            </div>
            <div className="mt-8 p-6 bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl text-center">
              <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Want more badges?</h3>
              <p className="text-zinc-400 mb-6">Engage with the community, post threads, and help others to unlock exclusive rewards.</p>
              <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold">View All Available Badges</Button>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-zinc-500 uppercase bg-zinc-950/50 border-b border-zinc-800">
                      <tr>
                        <th className="px-6 py-4">Asset Name</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {historyWithAssets?.map((log) => (
                        <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="px-6 py-4 font-medium text-white">
                            {log.asset?.title || 'Unknown Asset'}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="border-zinc-700 text-zinc-400 capitalize">
                              {log.asset?.category}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-zinc-400">
                            {format(new Date(log.download_date), 'MMM d, yyyy HH:mm')}
                          </td>
                          <td className="px-6 py-4 text-emerald-400 flex items-center gap-1">
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                              Completed
                            </Badge>
                          </td>
                        </tr>
                      ))}
                      {(!historyWithAssets || historyWithAssets.length === 0) && (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                            No downloads yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-2xl">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription className="text-zinc-500">Manage your connected accounts and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Email Address</label>
                  <Input disabled value={user.email} className="bg-zinc-950 border-zinc-800 text-zinc-500" />
                  <p className="text-xs text-zinc-500">Managed by Base44 Auth</p>
                </div>

                <SettingsForm profile={profile} queryClient={queryClient} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
