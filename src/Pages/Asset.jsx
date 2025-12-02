import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Skeleton } from '@/Components/ui/skeleton';
import { format } from 'date-fns';
import { toast } from 'sonner';
import LoadingSpinner from '@/Components/LoadingSpinner';
import LoginRequiredModal from '@/Components/LoginRequiredModal';
import { logToDiscord } from '@/utils';
import { checkAndAwardAchievement } from '@/utils/gamification';

export default function AssetDetail() {
    const [searchParams] = useSearchParams();
    const assetId = searchParams.get('id');
    const [user, setUser] = React.useState(null);
    const [userProfile, setUserProfile] = React.useState(null);
    const [downloadTimer, setDownloadTimer] = React.useState(0);
    const [showDownload, setShowDownload] = React.useState(false);
    const [showLoginModal, setShowLoginModal] = React.useState(false);

    React.useEffect(() => {
        const loadUser = async () => {
            if (await base44.auth.isAuthenticated()) {
                const u = await base44.auth.me();
                setUser(u);
                // In a real app, we would fetch the extended profile here
                const profiles = await base44.entities.UserProfile.list({
                    query: { user_email: u.email },
                    limit: 1
                });
                if (profiles.length > 0) {
                    setUserProfile(profiles[0]);
                } else {
                    // Create default profile if not exists
                    const newProfile = await base44.entities.UserProfile.create({
                        user_email: u.email,
                        membership_tier: 'free',
                        daily_downloads_count: 0,
                        last_download_date: new Date().toISOString()
                    });
                    setUserProfile(newProfile);
                }
            }
        };
        loadUser();
    }, []);

    const { data: asset, isLoading } = useQuery({
        queryKey: ['asset', assetId],
        queryFn: async () => {
            const assets = await base44.entities.Asset.list({
                query: { id: assetId }
            });
            return assets[0];
        },
        enabled: !!assetId,
    });

    const logDownloadMutation = useMutation({
        mutationFn: async () => {
            await base44.entities.DownloadLog.create({
                user_email: user.email,
                asset_id: asset.id,
                download_date: new Date().toISOString()
            });

            // Check for first download achievement
            const achievement = await checkAndAwardAchievement(user.email, 'first_download');
            if (achievement) {
                toast.success('🎉 Achievement Unlocked: First Download!', { duration: 5000 });
            }
        },
        onSuccess: () => {
            toast.success('Download started!');
            logToDiscord('Asset Downloaded', {
                type: 'download',
                user: user.full_name || user.username,
                email: user.email,
                description: `📥 Downloaded: ${asset.title}`,
                extra: { 'Asset ID': asset.id, 'Category': asset.category }
            });
        },
        onError: () => {
            toast.error('Failed to log download');
        }
    });

    React.useEffect(() => {
        let interval;
        if (showDownload && downloadTimer > 0) {
            interval = setInterval(() => {
                setDownloadTimer((prev) => {
                    if (prev <= 1) {
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [showDownload, downloadTimer]);

    const handleDownload = () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }

        const isVip = userProfile?.membership_tier === 'vip' || userProfile?.membership_tier === 'admin';

        if (asset.is_premium && !isVip) {
            toast.error('This is a Premium asset. Please upgrade to VIP to download.');
            return;
        }

        if (isVip) {
            startDownload();
        } else {
            setShowDownload(true);
            setDownloadTimer(15);
        }
    };

    const startDownload = () => {
        logDownloadMutation.mutate();
        window.open(asset.download_url, '_blank');
    };

    if (isLoading || !asset) {
        return <LoadingSpinner fullScreen />;
    }

    const framework = asset.framework || (asset.tags && asset.tags.length > 0 ? asset.tags[0] : 'Unknown');

    return (
        <>
            <LoginRequiredModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                message="You must login first to download this asset"
            />
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
                {/* Breadcrumb */}
                <div className="text-sm text-zinc-500 flex gap-2 items-center">
                    <Link to="/" className="hover:text-violet-400 transition-colors">Home</Link>
                    <span>/</span>
                    <Link to="/explore" className="hover:text-violet-400 transition-colors">Assets</Link>
                    <span>/</span>
                    <span className="text-zinc-300">{asset.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Gallery & Description */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Main Image */}
                        <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl relative group">
                            <div className="absolute top-4 right-4 z-10">
                                <Badge className={asset.is_premium ? "bg-amber-500/20 text-amber-400 border-amber-500/50" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"}>
                                    {asset.is_premium ? "PREMIUM" : "FREE"}
                                </Badge>
                            </div>
                            <img
                                src={asset.thumbnail}
                                alt={asset.title}
                                className="w-full object-cover max-h-[400px]"
                            />
                        </div>

                        {/* Thumbnails Grid */}
                        {asset.images && asset.images.length > 0 && (
                            <div className="grid grid-cols-4 gap-4">
                                {asset.images.map((img, i) => (
                                    <div key={i} className="aspect-video rounded-lg overflow-hidden border border-zinc-800 cursor-pointer hover:border-violet-500 transition-all">
                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <img src="https://img.icons8.com/3d-fluency/94/document.png" className="w-8 h-8" alt="Description" /> Description
                            </h2>
                            <div className="prose prose-invert max-w-none">
                                <div className="text-zinc-300 leading-relaxed space-y-4">
                                    {asset.description?.split('\n').map((paragraph, i) => (
                                        <p key={i} className="text-zinc-400">{paragraph}</p>
                                    ))}
                                </div>
                                
                                {/* Features Section */}
                                <div className="mt-6 pt-6 border-t border-zinc-800">
                                    <h3 className="text-lg font-semibold text-white mb-3">✨ Features</h3>
                                    <ul className="space-y-2 text-zinc-400">
                                        <li className="flex items-start gap-2">
                                            <span className="text-fuchsia-400 mt-1">•</span>
                                            <span>Optimized for {framework.toUpperCase()} framework</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-fuchsia-400 mt-1">•</span>
                                            <span>Clean and modern UI design</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-fuchsia-400 mt-1">•</span>
                                            <span>Fully configurable via config.lua</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-fuchsia-400 mt-1">•</span>
                                            <span>Regular updates and bug fixes</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-fuchsia-400 mt-1">•</span>
                                            <span>Discord support available</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Requirements */}
                                <div className="mt-6 pt-6 border-t border-zinc-800">
                                    <h3 className="text-lg font-semibold text-white mb-3">📋 Requirements</h3>
                                    <ul className="space-y-2 text-zinc-400">
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-400 mt-1">•</span>
                                            <span>Latest FiveM artifacts (recommended)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-400 mt-1">•</span>
                                            <span>{framework.toUpperCase()} framework installed</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-400 mt-1">•</span>
                                            <span>MySQL database (if applicable)</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Installation */}
                                <div className="mt-6 pt-6 border-t border-zinc-800">
                                    <h3 className="text-lg font-semibold text-white mb-3">🔧 Installation</h3>
                                    <ol className="space-y-2 text-zinc-400 list-decimal list-inside">
                                        <li>Download and extract the resource</li>
                                        <li>Place it in your resources folder</li>
                                        <li>Add to server.cfg: <code className="text-fuchsia-400 bg-zinc-950 px-2 py-1 rounded">ensure {asset.title?.toLowerCase().replace(/\s+/g, '-')}</code></li>
                                        <li>Configure settings in config.lua</li>
                                        <li>Restart your server</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Info & Actions */}
                    <div className="space-y-6">
                        {/* Download Card */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg sticky top-24">
                            <h1 className="text-2xl font-bold text-white mb-2">{asset.title}</h1>
                            <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
                                <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 uppercase text-xs font-bold">
                                    {asset.category}
                                </span>
                                <span>v{asset.version}</span>
                                <span>•</span>
                                <span>{asset.author || 'Unknown'}</span>
                            </div>

                            {showDownload ? (
                                <div className="space-y-4">
                                    {downloadTimer > 0 ? (
                                        <Button disabled className="w-full bg-zinc-800 text-zinc-400 h-12 text-lg relative overflow-hidden">
                                            <span className="relative z-10">Wait {downloadTimer}s...</span>
                                            <div className="absolute inset-0 bg-zinc-700/50" style={{ width: `${(downloadTimer / 15) * 100}%` }} />
                                        </Button>
                                    ) : (
                                        <Button onClick={startDownload} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-lg animate-in zoom-in">
                                            <img src="https://img.icons8.com/3d-fluency/94/download-from-cloud.png" className="mr-2 w-6 h-6" alt="Download" /> Download Now
                                        </Button>
                                    )}
                                    <p className="text-xs text-center text-zinc-500">
                                        Slow download? <Link to="/membership" className="text-violet-400 hover:underline">Upgrade to VIP</Link>
                                    </p>
                                </div>
                            ) : (
                                <Button onClick={handleDownload} className="w-full bg-violet-600 hover:bg-violet-700 text-white h-12 text-lg font-semibold shadow-lg shadow-violet-900/20">
                                    {asset.is_premium ?
                                        <img src="https://img.icons8.com/3d-fluency/94/lock.png" className="mr-2 w-6 h-6" alt="Premium" /> :
                                        <img src="https://img.icons8.com/3d-fluency/94/download-from-cloud.png" className="mr-2 w-6 h-6" alt="Download" />
                                    }
                                    {asset.is_premium ? "Unlock Premium Access" : "Download File"}
                                </Button>
                            )}

                            <div className="mt-6 pt-6 border-t border-zinc-800 grid grid-cols-2 gap-4">
                                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/50">
                                    <div className="text-xs text-zinc-500 mb-1">File Size</div>
                                    <div className="text-sm font-medium text-zinc-200">{asset.file_size}</div>
                                </div>
                                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/50">
                                    <div className="text-xs text-zinc-500 mb-1">Last Update</div>
                                    <div className="text-sm font-medium text-zinc-200">
                                        {asset.created_date ? format(new Date(asset.created_date), 'MMM d, yyyy') : 'N/A'}
                                    </div>
                                </div>
                            </div>

                            {/* Virus Check */}
                            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <span className="text-sm font-semibold text-green-400">Virus Scan</span>
                                </div>
                                <p className="text-xs text-zinc-400 mb-3">Check this file for viruses before downloading</p>
                                <a 
                                    href={`https://www.virustotal.com/gui/url/${encodeURIComponent(asset.download_url)}/detection`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors font-medium"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    Check on VirusTotal
                                </a>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <Button variant="outline" className="flex-1 border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300">
                                    <img src="https://cdn3d.iconscout.com/3d/premium/thumb/share-button-3d-icon-png-download-5656052.png" className="w-5 h-5 mr-2" alt="Share" /> Share
                                </Button>
                                <Button variant="outline" className="flex-1 border-zinc-700 bg-transparent hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/30 text-zinc-300">
                                    <img src="https://static.vecteezy.com/system/resources/previews/046/680/406/non_2x/3d-report-icon-report-symbol-3d-free-png.png" className="w-5 h-5 mr-2" alt="Report" /> Report
                                </Button>
                            </div>
                        </div>

                        {/* Tech Specs */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                <img src="https://cdn.iconscout.com/icon/free/png-256/free-apple-settings-icon-svg-download-png-493162.png?f=webp" className="w-5 h-5" alt="Specs" /> Technical Details
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Framework</span>
                                    <span className="text-zinc-200 font-medium">{framework}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Encrypted</span>
                                    <span className="text-zinc-200 font-medium">{asset.type === 'open_source' ? 'No (Open Source)' : 'Yes (Escrow)'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Support</span>
                                    <span className="text-zinc-200 font-medium">Discord Only</span>
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                            {asset.tags?.map(tag => (
                                <Badge key={tag} variant="secondary" className="bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200">
                                    #{tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
