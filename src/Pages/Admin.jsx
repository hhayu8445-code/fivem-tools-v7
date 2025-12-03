import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { toast } from 'sonner';
import LoadingOverlay from '@/Components/LoadingOverlay';
import LoginRequiredModal from '@/Components/LoginRequiredModal';
import { logToDiscord } from '@/utils';
import { DownloadChart, CategoryChart, StatsCard } from '@/Components/AnalyticsChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { adminManagement } from '@/utils/adminManagement';

export default function Admin() {
  // ✅ FIX: Use useAuth hook instead of duplicate useState/useEffect
  const { user, loading: authLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = React.useState(!user && !authLoading);

  React.useEffect(() => {
    if (authLoading) return;
    setShowLoginModal(!user);
  }, [user, authLoading]);

  // Asset form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'script',
    framework: 'standalone',
    type: 'free',
    thumbnail: '',
    download_url: '',
    version: '1.0.0',
    file_size: '10 MB',
    tags: '',
    is_premium: false
  });

  // User management state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userManagementData, setUserManagementData] = useState({
    newRole: 'free',
    banReason: ''
  });

  const createAssetMutation = useMutation({
    mutationFn: async (data) => {
      try {
        return await base44.entities.Asset.create({
          ...data,
          tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          images: data.thumbnail ? [data.thumbnail] : [],
          uploaded_by: user?.email || 'admin',
          uploader_name: user?.username || user?.full_name || 'Admin'
        });
      } catch (error) {
        console.error('Asset creation error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Asset created successfully!');
      logToDiscord('Asset Created (Admin)', {
        type: 'admin',
        user: user.full_name || user.username,
        email: user.email,
        description: `➕ New asset created: ${formData.title}`,
        extra: { 'Category': formData.category, 'Type': formData.type }
      });
      setFormData({
        title: '', description: '', category: 'script', framework: 'standalone',
        type: 'free', thumbnail: '', download_url: '', version: '1.0.0',
        file_size: '10 MB', tags: '', is_premium: false
      });
    },
    onError: () => {
      toast.error('Failed to create asset');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createAssetMutation.mutate(formData);
  };

  // User management mutations
  const changeRoleMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser?.user_email) throw new Error('No user selected');
      return adminManagement.changeUserRole(selectedUser.user_email, userManagementData.newRole, user);
    },
    onSuccess: (result) => {
      toast.success(result.message);
      setSelectedUser(null);
      refetchUsers();
    },
    onError: (err) => {
      toast.error('Failed to change role: ' + err.message);
    }
  });

  const banUserMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser?.user_email) throw new Error('No user selected');
      return adminManagement.banUser(selectedUser.user_email, userManagementData.banReason, user);
    },
    onSuccess: (result) => {
      toast.success(result.message);
      setSelectedUser(null);
      refetchUsers();
    },
    onError: (err) => {
      toast.error('Failed to ban user: ' + err.message);
    }
  });

  const unbanUserMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser?.user_email) throw new Error('No user selected');
      return adminManagement.unbanUser(selectedUser.user_email, user);
    },
    onSuccess: (result) => {
      toast.success(result.message);
      setSelectedUser(null);
      refetchUsers();
    },
    onError: (err) => {
      toast.error('Failed to unban user: ' + err.message);
    }
  });

  const resetStatsMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser?.user_email) throw new Error('No user selected');
      return adminManagement.resetUserStats(selectedUser.user_email, user);
    },
    onSuccess: (result) => {
      toast.success(result.message);
      setSelectedUser(null);
      refetchUsers();
    },
    onError: (err) => {
      toast.error('Failed to reset stats: ' + err.message);
    }
  });

  const wipeDataMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser?.user_email) throw new Error('No user selected');
      if (!confirm('Are you sure? This will wipe all user data!')) throw new Error('Cancelled');
      return adminManagement.wipeUserData(selectedUser.user_email, user);
    },
    onSuccess: (result) => {
      toast.success(result.message);
      setSelectedUser(null);
      refetchUsers();
    },
    onError: (err) => {
      if (err.message !== 'Cancelled') {
        toast.error('Failed to wipe data: ' + err.message);
      }
    }
  });

  // User search query
  const { data: searchResults = [], refetch: refetchUsers } = useQuery({
    queryKey: ['userSearch', userSearchQuery],
    queryFn: async () => {
      if (!userSearchQuery.trim()) return [];
      return adminManagement.searchUsers(userSearchQuery);
    },
    enabled: !!userSearchQuery.trim(),
    refetchInterval: false
  });

  // Get moderation statistics
  const { data: modStats } = useQuery({
    queryKey: ['modStats'],
    queryFn: adminManagement.getModerationStats,
    refetchInterval: 30000
  });

  // Analytics queries
  // ✅ OPTIMIZED: Added pagination and date filtering instead of loading 1000+ records
  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [assets, downloads, users] = await Promise.all([
        base44.entities.Asset.list({ limit: 100, sort: '-created_at' }), // Paginate: 100 instead of 1000
        base44.entities.DownloadLog.list({ limit: 500, date_filter: { start: thirtyDaysAgo, end: today } }), // Filter by date range
        base44.entities.UserProfile.list({ limit: 100, sort: '-created_at' }) // Paginate: 100 instead of 1000
      ]);

      const categoryData = assets.reduce((acc, asset) => {
        acc[asset.category] = (acc[asset.category] || 0) + 1;
        return acc;
      }, {});

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const downloadsByDay = last7Days.map(date => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        downloads: downloads.filter(d => d.download_date?.startsWith(date)).length
      }));

      return {
        totalAssets: assets.length,
        totalDownloads: downloads.length,
        totalUsers: users.length,
        vipUsers: users.filter(u => u.membership_tier === 'vip').length,
        categoryData: Object.entries(categoryData).map(([category, count]) => ({ category, count })),
        downloadsByDay
      };
    },
    enabled: !!user,
    refetchInterval: 30000
  });

  if (!user) return <div className="p-10 text-white">Access Denied</div>;

  return (
    <>
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="You must login first to access admin panel"
      />
      <div className="max-w-7xl mx-auto py-10 relative space-y-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <img src="https://img.icons8.com/3d-fluency/94/crown.png" className="w-10 h-10" alt="Admin" />
          Admin Dashboard
        </h1>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Assets" value={analytics?.totalAssets || 0} icon="https://img.icons8.com/3d-fluency/94/box.png" trend={5} />
          <StatsCard title="Total Downloads" value={analytics?.totalDownloads || 0} icon="https://img.icons8.com/3d-fluency/94/download-from-cloud.png" trend={12} />
          <StatsCard title="Total Users" value={analytics?.totalUsers || 0} icon="https://img.icons8.com/3d-fluency/94/conference-call.png" trend={8} />
          <StatsCard title="VIP Members" value={analytics?.vipUsers || 0} icon="https://img.icons8.com/3d-fluency/94/crown.png" trend={3} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DownloadChart data={analytics?.downloadsByDay || []} />
          <CategoryChart data={analytics?.categoryData || []} />
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="create">Create Asset</TabsTrigger>
            <TabsTrigger value="manage">Manage Assets</TabsTrigger>
            <TabsTrigger value="users">Manage Users</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-6">
            <div className="max-w-2xl mx-auto">
              {createAssetMutation.isPending && <LoadingOverlay message="Creating asset..." />}
              <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <img src="https://img.icons8.com/3d-fluency/94/add-file.png" className="w-8 h-8" alt="Add" />
                    Add New Asset
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      placeholder="Title"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="bg-zinc-950 border-zinc-800"
                      required
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                        <SelectTrigger className="bg-zinc-950 border-zinc-800">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="script">Script</SelectItem>
                          <SelectItem value="mlo">MLO</SelectItem>
                          <SelectItem value="vehicle">Vehicle</SelectItem>
                          <SelectItem value="clothing">Clothing</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={formData.framework} onValueChange={v => setFormData({ ...formData, framework: v })}>
                        <SelectTrigger className="bg-zinc-950 border-zinc-800">
                          <SelectValue placeholder="Framework" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standalone">Standalone</SelectItem>
                          <SelectItem value="esx">ESX</SelectItem>
                          <SelectItem value="qbcore">QBCore</SelectItem>
                          <SelectItem value="qbox">QBox</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v, is_premium: v === 'paid' })}>
                        <SelectTrigger className="bg-zinc-950 border-zinc-800">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="leaked">Leaked</SelectItem>
                          <SelectItem value="open_source">Open Source</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Version"
                        value={formData.version}
                        onChange={e => setFormData({ ...formData, version: e.target.value })}
                        className="bg-zinc-950 border-zinc-800"
                      />
                    </div>

                    <Input
                      placeholder="Thumbnail URL"
                      value={formData.thumbnail}
                      onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
                      className="bg-zinc-950 border-zinc-800"
                      required
                    />

                    <Input
                      placeholder="Download URL (Mega/Google Drive)"
                      value={formData.download_url}
                      onChange={e => setFormData({ ...formData, download_url: e.target.value })}
                      className="bg-zinc-950 border-zinc-800"
                      required
                    />

                    <Textarea
                      placeholder="Description"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="bg-zinc-950 border-zinc-800 min-h-[100px]"
                      required
                    />

                    <Input
                      placeholder="Tags (comma separated)"
                      value={formData.tags}
                      onChange={e => setFormData({ ...formData, tags: e.target.value })}
                      className="bg-zinc-950 border-zinc-800"
                    />

                    <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white h-12 text-lg">
                      <img src="https://img.icons8.com/3d-fluency/94/plus.png" className="mr-2 w-6 h-6" alt="Create" /> Create Asset
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="manage" className="mt-6">
            <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
              <CardHeader>
                <CardTitle>Asset Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-400">Asset management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6 space-y-6">
            {/* User Search */}
            <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <img src="https://img.icons8.com/3d-fluency/94/search.png" className="w-6 h-6" alt="Search" />
                  Search & Manage Users
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search by email or Discord ID..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="bg-zinc-950 border-zinc-800"
                />

                {/* Search Results */}
                {userSearchQuery && searchResults.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
                    {searchResults.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
                        className={`p-3 rounded cursor-pointer border transition ${selectedUser?.id === u.id
                            ? 'bg-violet-900 border-violet-500'
                            : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700'
                          }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-white">{u.user_email}</p>
                            <p className="text-sm text-zinc-400">Role: {u.membership_tier} {u.is_banned && '(🚫 BANNED)'}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded ${u.is_banned ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'
                            }`}>
                            {u.is_banned ? 'Banned' : 'Active'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {userSearchQuery && searchResults.length === 0 && (
                  <p className="text-zinc-400 text-center py-4">No users found</p>
                )}
              </CardContent>
            </Card>

            {/* User Management Panel */}
            {selectedUser && (
              <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <img src="https://img.icons8.com/3d-fluency/94/user.png" className="w-6 h-6" alt="User" />
                    Manage: {selectedUser.user_email}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* User Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div className="p-3 bg-zinc-800 rounded">
                      <p className="text-xs text-zinc-400">Role</p>
                      <p className="font-bold">{selectedUser.membership_tier}</p>
                    </div>
                    <div className="p-3 bg-zinc-800 rounded">
                      <p className="text-xs text-zinc-400">Downloads</p>
                      <p className="font-bold">{selectedUser.total_downloads || 0}</p>
                    </div>
                    <div className="p-3 bg-zinc-800 rounded">
                      <p className="text-xs text-zinc-400">Posts</p>
                      <p className="font-bold">{selectedUser.posts_count || 0}</p>
                    </div>
                    <div className="p-3 bg-zinc-800 rounded">
                      <p className="text-xs text-zinc-400">Points</p>
                      <p className="font-bold">{selectedUser.points || 0}</p>
                    </div>
                    <div className="p-3 bg-zinc-800 rounded">
                      <p className="text-xs text-zinc-400">Reputation</p>
                      <p className="font-bold">{selectedUser.reputation || 0}</p>
                    </div>
                    <div className="p-3 bg-zinc-800 rounded">
                      <p className="text-xs text-zinc-400">Status</p>
                      <p className={`font-bold ${selectedUser.is_banned ? 'text-red-400' : 'text-green-400'}`}>
                        {selectedUser.is_banned ? '🚫 Banned' : '✅ Active'}
                      </p>
                    </div>
                  </div>

                  {/* Role Change */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Change Role</label>
                    <div className="flex gap-2">
                      <Select value={userManagementData.newRole} onValueChange={(v) => setUserManagementData({ ...userManagementData, newRole: v })}>
                        <SelectTrigger className="bg-zinc-950 border-zinc-800 flex-1">
                          <SelectValue placeholder="Select new role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free User</SelectItem>
                          <SelectItem value="vip">VIP Member</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => changeRoleMutation.mutate()}
                        disabled={changeRoleMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {changeRoleMutation.isPending ? 'Changing...' : 'Change'}
                      </Button>
                    </div>
                  </div>

                  {/* Ban/Unban */}
                  {selectedUser.is_banned ? (
                    <Button
                      onClick={() => unbanUserMutation.mutate()}
                      disabled={unbanUserMutation.isPending}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {unbanUserMutation.isPending ? 'Unbanning...' : '✅ Unban User'}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Ban User</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Reason for ban..."
                          value={userManagementData.banReason}
                          onChange={(e) => setUserManagementData({ ...userManagementData, banReason: e.target.value })}
                          className="bg-zinc-950 border-zinc-800 flex-1"
                        />
                        <Button
                          onClick={() => banUserMutation.mutate()}
                          disabled={banUserMutation.isPending}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {banUserMutation.isPending ? 'Banning...' : '🚫 Ban'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Other Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => resetStatsMutation.mutate()}
                      disabled={resetStatsMutation.isPending}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      {resetStatsMutation.isPending ? 'Resetting...' : '🔄 Reset Stats'}
                    </Button>
                    <Button
                      onClick={() => wipeDataMutation.mutate()}
                      disabled={wipeDataMutation.isPending}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {wipeDataMutation.isPending ? 'Wiping...' : '🗑️ Wipe Data'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="moderation" className="mt-6 space-y-6">
            {/* Moderation Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Users"
                value={modStats?.total_users || 0}
                icon="https://img.icons8.com/3d-fluency/94/conference-call.png"
                trend={0}
              />
              <StatsCard
                title="Banned Users"
                value={modStats?.banned_users || 0}
                icon="https://img.icons8.com/3d-fluency/94/cancel.png"
                trend={0}
              />
              <StatsCard
                title="VIP Users"
                value={modStats?.vip_users || 0}
                icon="https://img.icons8.com/3d-fluency/94/star.png"
                trend={0}
              />
              <StatsCard
                title="Moderators"
                value={modStats?.moderators || 0}
                icon="https://img.icons8.com/3d-fluency/94/shield.png"
                trend={0}
              />
            </div>

            {/* Users by Role Distribution */}
            <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
              <CardHeader>
                <CardTitle>Users by Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {modStats?.by_tier && Object.entries(modStats.by_tier).map(([tier, count]) => (
                    <div key={tier} className="p-3 bg-zinc-800 rounded text-center">
                      <p className="text-xs text-zinc-400 uppercase">{tier}</p>
                      <p className="text-2xl font-bold text-violet-400">{count}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
              <CardHeader>
                <CardTitle>Moderation Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><span className="text-zinc-400">Total System Users:</span> <span className="font-bold">{modStats?.total_users || 0}</span></p>
                <p><span className="text-zinc-400">Active Bans:</span> <span className="font-bold text-red-400">{modStats?.banned_users || 0}</span></p>
                <p><span className="text-zinc-400">VIP Members:</span> <span className="font-bold text-yellow-400">{modStats?.vip_users || 0}</span></p>
                <p><span className="text-zinc-400">Moderator Team:</span> <span className="font-bold text-blue-400">{modStats?.moderators || 0}</span></p>
                <p><span className="text-zinc-400">Admins:</span> <span className="font-bold text-violet-400">{modStats?.admins || 0}</span></p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
