import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/Components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import AssetCard from '@/Components/AssetCard';
import LoadingSpinner from '@/Components/LoadingSpinner';


export default function Home() {
  const navigate = useNavigate();
  const { data: trendingAssets, isLoading: isTrendingLoading } = useQuery({
    queryKey: ['assets', 'trending'],
    queryFn: () => base44.entities.Asset.list({
      sort: { views: -1 },
      limit: 4
    }),
  });

  const { data: latestAssets, isLoading: isLatestLoading } = useQuery({
    queryKey: ['assets', 'latest'],
    queryFn: () => base44.entities.Asset.list({
      sort: { created_date: -1 },
      limit: 12
    }),
  });



  if (isTrendingLoading || isLatestLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        >
          <source src="/mv.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />

        <div className="relative p-8 md:p-12 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-6">
            <img src="https://img.icons8.com/3d-fluency/94/star.png" className="w-4 h-4" alt="Sparkles" />
            <span>The #1 FiveM Resource Hub</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
            Premium Assets for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
              Next-Gen Servers
            </span>
          </h1>

          <p className="text-zinc-400 text-lg mb-8 max-w-xl leading-relaxed">
            Access thousands of curated Scripts, MLOs, Vehicles, and EUPs.
            Optimized for ESX and QBCore frameworks.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-8 text-base h-12" onClick={() => navigate('/explore')}>
              Browse All Assets
            </Button>
            <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-full px-8 text-base h-12" onClick={() => navigate('/membership')}>
              Get Premium Access
            </Button>
          </div>
        </div>
      </div>

      {/* Trending Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <img src="https://img.icons8.com/3d-fluency/94/line-chart.png" className="w-6 h-6" alt="Trending" />
            </div>
            <h2 className="text-xl font-bold text-white">Trending this Week</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingAssets?.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      </section>

      {/* Latest Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <img src="https://img.icons8.com/3d-fluency/94/clock.png" className="w-6 h-6" alt="Latest" />
            </div>
            <h2 className="text-xl font-bold text-white">Latest Updates</h2>
          </div>
          <Link to="/explore" className="text-sm text-zinc-500 hover:text-violet-400 flex items-center gap-1 transition-colors">
            View All <img src="https://img.icons8.com/3d-fluency/94/forward.png" className="w-4 h-4" alt="Arrow" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {latestAssets?.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      </section>
    </div>
  );
}
