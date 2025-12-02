import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/Components/ui/badge';

export default function AssetCard({ asset }) {
    const getIconUrl = (cat) => {
        switch (cat) {
            case 'script': return 'https://img.icons8.com/3d-fluency/94/source-code.png';
            case 'mlo': return 'https://img.icons8.com/3d-fluency/94/map-marker.png';
            case 'vehicle': return 'https://images.icon-icons.com/577/PNG/256/Car_Grey_icon-icons.com_54905.png';
            case 'clothing': return 'https://cdn3d.iconscout.com/3d/premium/thumb/vacation-wear-3d-icon-png-download-4551865.png';
            default: return 'https://cdn3d.iconscout.com/3d/premium/thumb/add-folder-3d-icon-png-download-5727515.png';
        }
    };

    const iconUrl = getIconUrl(asset.category);
    const framework = asset.framework || (asset.tags && asset.tags.length > 0 ? asset.tags[0] : null);

    const getBadgeColor = (type) => {
        switch (type) {
            case 'paid': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'leaked': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'open_source': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
        }
    };

    return (
        <Link to={`/asset?id=${asset.id}`} className="block group">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-violet-500/50 hover:shadow-[0_0_20px_rgba(124,58,237,0.1)] hover:-translate-y-1 h-full flex flex-col">

                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-zinc-950">
                    <img
                        src={asset.thumbnail}
                        alt={asset.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-60" />

                    <div className="absolute top-3 left-3">
                        <Badge variant="outline" className="bg-zinc-950/80 backdrop-blur text-zinc-300 border-zinc-800 flex items-center gap-1.5">
                            <img src={iconUrl} className="w-4 h-4" alt={asset.category} />
                            <span className="capitalize">{asset.category}</span>
                        </Badge>
                    </div>

                    <div className="absolute top-3 right-3">
                        <Badge variant="outline" className={`backdrop-blur border ${getBadgeColor(asset.type)} uppercase text-[10px] font-bold tracking-wider`}>
                            {asset.type?.replace('_', ' ')}
                        </Badge>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2 text-xs text-violet-400 font-medium">
                        {framework && (
                            <>
                                <span className="uppercase tracking-wider">{framework}</span>
                                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                            </>
                        )}
                        <span className="text-zinc-500">{asset.version || 'v1.0'}</span>
                    </div>

                    <h3 className="text-lg font-semibold text-zinc-100 mb-2 line-clamp-1 group-hover:text-violet-400 transition-colors">
                        {asset.title}
                    </h3>

                    <p className="text-sm text-zinc-500 line-clamp-2 mb-4 flex-1">
                        {asset.description}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <img src="https://img.icons8.com/3d-fluency/94/download-from-cloud.png" className="w-4 h-4" alt="Downloads" />
                            <span>{asset.downloads || 0} downloads</span>
                        </div>
                        <span className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors">
                            Details &rarr;
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}