import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { toast } from 'sonner';
import LoadingOverlay from '@/Components/LoadingOverlay';
import LoginRequiredModal from '@/Components/LoginRequiredModal';
import { logToDiscord } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { DownloadChart, CategoryChart, StatsCard } from '@/Components/AnalyticsChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';

export default function Admin() {
  const [user, setUser] = React.useState(null);
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  
  React.useEffect(() => {
      base44.auth.me().then(u => {
          if (!u) {
              setShowLoginModal(true);
              return;
          }
          setUser(u);
      });
  }, []);

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

  const createAssetMutation = useMutation({
    mutationFn: (data) => base44.entities.Asset.create({
        ...data,
        tags: data.tags.split(',').map(t => t.trim()),
        images: [data.thumbnail] // Just using thumb as main image for simplicity
    }),
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

  // Analytics queries
  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const [assets, downloads, users] = await Promise.all([
        base44.entities.Asset.list({ limit: 1000 }),
        base44.entities.DownloadLog.list({ limit: 1000 }),
        base44.entities.UserProfile.list({ limit: 1000 })
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
                onChange={e => setFormData({...formData, title: e.target.value})} 
                className="bg-zinc-950 border-zinc-800"
                required
            />
            
            <div className="grid grid-cols-2 gap-4">
                <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
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

                <Select value={formData.framework} onValueChange={v => setFormData({...formData, framework: v})}>
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
                <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v, is_premium: v === 'paid'})}>
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
                    onChange={e => setFormData({...formData, version: e.target.value})} 
                    className="bg-zinc-950 border-zinc-800"
                />
            </div>

            <Input 
                placeholder="Thumbnail URL" 
                value={formData.thumbnail} 
                onChange={e => setFormData({...formData, thumbnail: e.target.value})} 
                className="bg-zinc-950 border-zinc-800"
                required
            />
            
            <Input 
                placeholder="Download URL (Mega/Google Drive)" 
                value={formData.download_url} 
                onChange={e => setFormData({...formData, download_url: e.target.value})} 
                className="bg-zinc-950 border-zinc-800"
                required
            />

            <Textarea 
                placeholder="Description" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="bg-zinc-950 border-zinc-800 min-h-[100px]"
                required
            />
            
            <Input 
                placeholder="Tags (comma separated)" 
                value={formData.tags} 
                onChange={e => setFormData({...formData, tags: e.target.value})} 
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
      </Tabs>
    </div>
    </>
  );
}
