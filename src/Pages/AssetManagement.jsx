import React, { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function AssetManagement() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [editingAsset, setEditingAsset] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (await base44.auth.isAuthenticated()) {
          const currentUser = await base44.auth.me();
          if (currentUser.id !== '1197320834889560127') {
            window.location.href = '/';
            return;
          }
          setUser(currentUser);
        } else {
          window.location.href = '/';
        }
      } catch (error) {
        window.location.href = '/';
      }
    };
    checkAuth();
  }, []);

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['assets-admin'],
    queryFn: () => base44.entities.Asset.list({ limit: 1000, sort: { created_date: -1 } }),
    enabled: !!user
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Asset.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['assets-admin']);
      toast.success('Asset updated successfully');
      setIsDialogOpen(false);
      setEditingAsset(null);
    },
    onError: () => toast.error('Failed to update asset')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Asset.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['assets-admin']);
      toast.success('Asset deleted successfully');
    },
    onError: () => toast.error('Failed to delete asset')
  });

  const handleEdit = (asset) => {
    setEditingAsset({ ...asset });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingAsset) return;
    updateMutation.mutate({
      id: editingAsset.id,
      data: {
        name: editingAsset.name,
        description: editingAsset.description,
        category: editingAsset.category,
        type: editingAsset.type,
        framework: editingAsset.framework,
        download_url: editingAsset.download_url,
        image_url: editingAsset.image_url,
        version: editingAsset.version,
        file_size: editingAsset.file_size
      }
    });
  };

  const handleDelete = (id) => {
    if (confirm('Delete this asset? This cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleTogglePremium = (asset) => {
    updateMutation.mutate({
      id: asset.id,
      data: { type: asset.type === 'premium' ? 'free' : 'premium' }
    });
  };

  const filteredAssets = assets.filter(asset => {
    const matchSearch = asset.name?.toLowerCase().includes(search.toLowerCase()) ||
                       asset.description?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'all' || asset.category === filterCategory;
    const matchType = filterType === 'all' || asset.type === filterType;
    return matchSearch && matchCategory && matchType;
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Asset Management</h1>
        <p className="text-zinc-400">Manage all uploaded assets and resources</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-zinc-400 mb-1">Total Assets</p>
              <p className="text-3xl font-bold text-white">{assets.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-zinc-400 mb-1">Free</p>
              <p className="text-3xl font-bold text-green-400">{assets.filter(a => a.type === 'free').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-zinc-400 mb-1">Premium</p>
              <p className="text-3xl font-bold text-yellow-400">{assets.filter(a => a.type === 'premium').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-zinc-400 mb-1">Scripts</p>
              <p className="text-3xl font-bold text-fuchsia-400">{assets.filter(a => a.category === 'script').length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-900 border-zinc-800 mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-950 border-zinc-700 text-zinc-300"
            />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="bg-zinc-950 border-zinc-700 text-zinc-300">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="script">Scripts</SelectItem>
                <SelectItem value="mlo">MLOs</SelectItem>
                <SelectItem value="vehicle">Vehicles</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="bg-zinc-950 border-zinc-700 text-zinc-300">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assets List */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Assets ({filteredAssets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 mx-auto border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">No assets found</div>
          ) : (
            <div className="space-y-4">
              {filteredAssets.map((asset) => (
                <div key={asset.id} className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    {asset.image_url && (
                      <img src={asset.image_url} alt={asset.name} className="w-24 h-24 rounded-lg object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-white font-semibold text-lg">{asset.name}</h3>
                          <p className="text-sm text-zinc-400 line-clamp-2">{asset.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={asset.type === 'premium' ? 'default' : 'secondary'} 
                                 className={asset.type === 'premium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}>
                            {asset.type === 'premium' ? '👑 Premium' : '🆓 Free'}
                          </Badge>
                          <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                            {asset.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-zinc-500 mb-3">
                        {asset.framework && <span>Framework: {asset.framework}</span>}
                        {asset.version && <span>v{asset.version}</span>}
                        {asset.file_size && <span>{asset.file_size}</span>}
                        {asset.downloads && <span>{asset.downloads} downloads</span>}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleEdit(asset)} className="bg-fuchsia-600 hover:bg-fuchsia-700">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleTogglePremium(asset)} 
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                          {asset.type === 'premium' ? 'Make Free' : 'Make Premium'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(asset.id)}
                                className="border-red-700 text-red-400 hover:bg-red-900/20">
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Asset</DialogTitle>
          </DialogHeader>
          {editingAsset && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Name</label>
                <Input
                  value={editingAsset.name || ''}
                  onChange={(e) => setEditingAsset({ ...editingAsset, name: e.target.value })}
                  className="bg-zinc-950 border-zinc-700 text-zinc-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                <Textarea
                  value={editingAsset.description || ''}
                  onChange={(e) => setEditingAsset({ ...editingAsset, description: e.target.value })}
                  className="bg-zinc-950 border-zinc-700 text-zinc-300 min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Category</label>
                  <Select value={editingAsset.category} onValueChange={(v) => setEditingAsset({ ...editingAsset, category: v })}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-700 text-zinc-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      <SelectItem value="script">Script</SelectItem>
                      <SelectItem value="mlo">MLO</SelectItem>
                      <SelectItem value="vehicle">Vehicle</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Type</label>
                  <Select value={editingAsset.type} onValueChange={(v) => setEditingAsset({ ...editingAsset, type: v })}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-700 text-zinc-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Framework</label>
                  <Select value={editingAsset.framework} onValueChange={(v) => setEditingAsset({ ...editingAsset, framework: v })}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-700 text-zinc-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      <SelectItem value="ESX">ESX</SelectItem>
                      <SelectItem value="QBCore">QBCore</SelectItem>
                      <SelectItem value="Standalone">Standalone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Version</label>
                  <Input
                    value={editingAsset.version || ''}
                    onChange={(e) => setEditingAsset({ ...editingAsset, version: e.target.value })}
                    className="bg-zinc-950 border-zinc-700 text-zinc-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Download URL</label>
                <Input
                  value={editingAsset.download_url || ''}
                  onChange={(e) => setEditingAsset({ ...editingAsset, download_url: e.target.value })}
                  className="bg-zinc-950 border-zinc-700 text-zinc-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Image URL</label>
                <Input
                  value={editingAsset.image_url || ''}
                  onChange={(e) => setEditingAsset({ ...editingAsset, image_url: e.target.value })}
                  className="bg-zinc-950 border-zinc-700 text-zinc-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">File Size</label>
                <Input
                  value={editingAsset.file_size || ''}
                  onChange={(e) => setEditingAsset({ ...editingAsset, file_size: e.target.value })}
                  placeholder="e.g., 25 MB"
                  className="bg-zinc-950 border-zinc-700 text-zinc-300"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={updateMutation.isPending} className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-700">
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button onClick={() => setIsDialogOpen(false)} variant="outline" className="border-zinc-700 text-zinc-300">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
