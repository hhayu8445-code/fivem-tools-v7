import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import LoadingSpinner from '@/Components/LoadingSpinner';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import AssetCard from '@/Components/AssetCard';
import { useSearchParams } from 'react-router-dom';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialCategory = searchParams.get('category') || 'all';
  const initialQuery = searchParams.get('q') || '';
  const initialFramework = searchParams.get('framework') || 'all';
  const initialType = searchParams.get('type') || 'all';

  const [search, setSearch] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [framework, setFramework] = useState(initialFramework);
  const [type, setType] = useState(initialType);

  useEffect(() => {
    const params = {};
    if (category !== 'all') params.category = category;
    if (framework !== 'all') params.framework = framework;
    if (type !== 'all') params.type = type;
    if (search) params.q = search;
    setSearchParams(params);
  }, [category, framework, type, search, setSearchParams]);

  const buildQuery = () => {
      const q = {};
      if (category !== 'all') q.category = category;
      if (framework !== 'all') q.framework = framework;
      if (type !== 'all') q.type = type;
      // Note: base44 entity list doesn't support complex text search in 'query' prop efficiently without backend support usually, 
      // but we will fetch and filter client side if needed or assuming exact match for now.
      // For this demo, we'll use basic filtering.
      return q;
  };

  const { data: assets, isLoading } = useQuery({
    queryKey: ['assets', 'explore', category, framework, type],
    queryFn: () => base44.entities.Asset.list({ 
        query: buildQuery(),
        limit: 50,
        sort: { created_date: -1 }
    }),
  });

  // Client-side fuzzy search since list() query is usually exact match
  const filteredAssets = assets?.filter(a => 
      a.title.toLowerCase().includes(search.toLowerCase()) || 
      a.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  ) || [];

  const categories = [
      { id: 'all', label: 'All Categories' },
      { id: 'script', label: 'Scripts' },
      { id: 'mlo', label: 'Maps & MLO' },
      { id: 'vehicle', label: 'Vehicles' },
      { id: 'clothing', label: 'Clothing & EUP' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 backdrop-blur-sm">
        <div className="w-full md:w-1/3 space-y-2">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Search</label>
            <div className="relative">
                <img src="https://img.icons8.com/3d-fluency/94/search.png" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" alt="Search" />
                <Input 
                    placeholder="Keywords..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-zinc-900 border-zinc-700 pl-12"
                />
            </div>
        </div>

        <div className="flex flex-wrap gap-4 w-full md:w-2/3 justify-end">
             <div className="space-y-2 min-w-[140px]">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Category</label>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-700">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                        {categories.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2 min-w-[140px]">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Framework</label>
                 <Select value={framework} onValueChange={setFramework}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-700">
                        <SelectValue placeholder="Framework" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                        <SelectItem value="all">All Frameworks</SelectItem>
                        <SelectItem value="esx">ESX</SelectItem>
                        <SelectItem value="qbcore">QBCore</SelectItem>
                        <SelectItem value="standalone">Standalone</SelectItem>
                    </SelectContent>
                </Select>
            </div>

             <div className="space-y-2 min-w-[140px]">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Type</label>
                 <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-700">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="open_source">Open Source</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-zinc-500 px-2">
        <span>Found {filteredAssets.length} results</span>
        {(category !== 'all' || framework !== 'all' || type !== 'all' || search) && (
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                    setCategory('all');
                    setFramework('all');
                    setType('all');
                    setSearch('');
                }}
                className="h-auto p-0 text-violet-400 hover:text-violet-300 hover:bg-transparent"
            >
                <img src="https://img.icons8.com/3d-fluency/94/multiply.png" className="w-4 h-4 mr-1" alt="Clear" /> Clear Filters
            </Button>
        )}
      </div>

      {isLoading ? (
          <div className="flex justify-center py-20">
              <LoadingSpinner size="xl" />
          </div>
      ) : filteredAssets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredAssets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
            ))}
        </div>
      ) : (
          <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-800">
              <img src="https://img.icons8.com/3d-fluency/94/search.png" className="w-16 h-16 mx-auto mb-4 opacity-50" alt="No Results" />
              <h3 className="text-lg font-medium text-zinc-400">No assets found</h3>
              <p className="text-zinc-600">Try adjusting your filters or search terms</p>
          </div>
      )}
    </div>
  );
}
