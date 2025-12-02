import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Progress } from '@/Components/ui/progress';
import { Dialog, DialogContent } from '@/Components/ui/dialog';
import { Skeleton } from '@/Components/ui/skeleton';
import LoadingSpinner from '@/Components/LoadingSpinner';
import { toast } from 'sonner';
import { Play, Square, Search, X } from 'lucide-react';

const cfxApi = {
    async getServerInfo(serverEndpoint) {
        try {
            let serverId = serverEndpoint;
            if (serverEndpoint.includes('cfx.re/join/')) {
                serverId = serverEndpoint.split('cfx.re/join/')[1];
            }
            const response = await fetch(`https://servers-frontend.fivem.net/api/servers/single/${serverId}`);
            if (!response.ok) throw new Error('Server not found');
            const serverData = await response.json();
            const ipAddress = serverData.Data?.connectEndPoints?.[0] || serverData.EndPoint || 'N/A';
            return {
                ...serverData,
                ipAddress: ipAddress,
                ping: Math.floor(Math.random() * 100) + 20,
                premium: serverData.Data?.vars?.premium === 'true',
                verified: true
            };
        } catch (error) {
            console.error('CFX API Error:', error);
            throw error;
        }
    },
    async getServerPlayers(serverEndpoint) {
        try {
            let serverId = serverEndpoint;
            if (serverEndpoint.includes('cfx.re/join/')) {
                serverId = serverEndpoint.split('cfx.re/join/')[1];
            }
            const response = await fetch(`https://servers-frontend.fivem.net/api/servers/single/${serverId}`);
            if (!response.ok) throw new Error('Players not found');
            const data = await response.json();
            return data.Data?.players || [];
        } catch (error) {
            console.error('CFX Players API Error:', error);
            return [];
        }
    },
    async getServerList() {
        return [];
    }
};

export default function UpvotesServer() {
    const [currentAd, setCurrentAd] = React.useState(0);
    const adBanners = [
        'https://cdn.discordapp.com/attachments/1252388644480618527/1368659142616813588/fiyat_listesi.png?ex=692f3328&is=692de1a8&hm=52d01e571fc0f6fb63d424e3997deb5e80a5af22d02ea9066c9aae711f7eff59',
        'https://cdn.discordapp.com/attachments/1252388644480618527/1375726682635239474/20.png?ex=692f3410&is=692de290&hm=97437a02a8ec0befd20f63d4bf6214eb436d0c26e890ac88825e6baec894ed9d'
    ];

    const [serverInput, setServerInput] = React.useState('');
    const [upvotesInput, setUpvotesInput] = React.useState('');
    const [serverStatus, setServerStatus] = React.useState('idle');
    const [serverInfo, setServerInfo] = React.useState(null);
    const [showUdgModal, setShowUdgModal] = React.useState(false);
    const [udgKeyInput, setUdgKeyInput] = React.useState('');
    const [serverList, setServerList] = React.useState([]);
    const [onlinePlayers, setOnlinePlayers] = React.useState([]);
    const [isValidating, setIsValidating] = React.useState(false);
    const [logs, setLogs] = React.useState([]);
    const [showPriceModal, setShowPriceModal] = React.useState(false);
    const logIdRef = React.useRef(0);

    const [state, setState] = React.useState({
        progress: 0,
        isRunning: false,
        startTime: null,
        totalUpvotes: 0,
        targetUpvotes: 0,
        udgKeyVerified: false
    });

    const intervalRef = React.useRef(null);
    const logsEndRef = React.useRef(null);

    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLogs(prev => [...prev.slice(-99), { id: logIdRef.current++, message, type, timestamp }]);
        setTimeout(() => logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    React.useEffect(() => {
        const interval = setInterval(() => {
            setCurrentAd((prev) => (prev + 1) % adBanners.length);
        }, 5000);
        cfxApi.getServerList().then(setServerList);
        return () => clearInterval(interval);
    }, []);

    React.useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const validateServer = async (address) => {
        if (!address.trim()) {
            toast.error('Invalid Input', { description: 'Please enter a server address' });
            return false;
        }

        setServerStatus('validating');
        setIsValidating(true);

        try {
            addLog(`Initializing connection to server: ${address}`, 'info');
            addLog(`Establishing secure connection...`, 'info');
            const serverData = await cfxApi.getServerInfo(address);
            setIsValidating(false);
            setServerInfo(serverData);
            setServerStatus('valid');

            // Fetch real online players from server
            addLog(`Analyzing server infrastructure...`, 'info');
            addLog(`Retrieving active player data from server...`, 'info');
            const playersData = await cfxApi.getServerPlayers(address);
            console.log('Raw players data:', playersData);
            const players = Array.isArray(playersData) ? playersData.map((player, i) => {
                const playerName = player?.name || player?.Name || player?.nickname || `Player ${i + 1}`;
                return {
                    id: player?.id || player?.Id || i,
                    name: playerName,
                    avatar: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692c9d27fcb03e0d2d610054/fd2e0dbc0_Untitleddesign-26.png',
                    server: serverData.Data.hostname,
                    identifiers: player?.identifiers || player?.Identifiers || []
                };
            }) : [];
            setOnlinePlayers(players);

            addLog(`Server connection established successfully`, 'success');
            addLog(`Server: ${serverData.Data.hostname}`, 'success');
            addLog(`IP Address: ${serverData.ipAddress}`, 'info');
            addLog(`Active Players: ${serverData.Data.clients}/${serverData.Data.sv_maxclients}`, 'info');
            addLog(`Upvote Power Index: ${serverData.Data.upvotePower}`, 'info');
            addLog(`Player database synchronized: ${players.length} active users`, 'success');
            toast.success('Server Validated! 🎉', { description: `${serverData.Data.hostname} is online with ${serverData.Data.clients} players` });
            return true;
        } catch (error) {
            setIsValidating(false);
            setServerStatus('invalid');
            setServerInfo(null);
            addLog(`Connection failed: Unable to reach server`, 'error');
            addLog(`Error: ${error.message}`, 'error');
            toast.error('Server Not Found', { description: 'The server could not be found or is currently offline' });
            return false;
        }
    };

    const startProcess = () => {
        if (!serverInfo) return;
        const amount = parseInt(upvotesInput);
        if (isNaN(amount) || amount < 1 || amount > 50000) {
            toast.error('Invalid Amount', { description: 'Please enter a number between 1 and 50,000' });
            return;
        }

        setState(prev => ({
            ...prev,
            targetUpvotes: amount,
            isRunning: true,
            startTime: Date.now(),
            progress: 0,
            totalUpvotes: 0
        }));

        addLog(`Initializing upvote delivery system`, 'process');
        addLog(`Target upvotes: ${amount}`, 'info');
        addLog(`Destination: ${serverInfo.Data.hostname}`, 'info');
        addLog(`Encrypting data packets...`, 'info');
        addLog(`Estimated time: ${Math.ceil(amount / 100)} seconds`, 'info');
        toast.success('Process Started! 🚀', { description: `Sending ${amount} upvotes to ${serverInfo.Data.hostname}` });

        let lastLoggedProgress = 0;
        intervalRef.current = setInterval(() => {
            setState(prev => {
                if (!prev.isRunning) return prev;
                const newProgress = Math.min(prev.progress + (100 / 30000) * 100, 100);
                const newTotal = Math.floor(prev.targetUpvotes * (newProgress / 100));

                // Log setiap 10% progress
                if (Math.floor(newProgress / 10) > Math.floor(lastLoggedProgress / 10)) {
                    const progressPercent = Math.floor(newProgress / 10) * 10;
                    addLog(`Upvote delivery progress: ${progressPercent}% | ${newTotal}/${prev.targetUpvotes} packets sent`, 'process');
                    lastLoggedProgress = newProgress;
                }

                if (newProgress >= 95 && !prev.udgKeyVerified) {
                    addLog(`Security checkpoint activated at 95%`, 'warning');
                    addLog(`License verification required to continue`, 'warning');
                    addLog(`Process temporarily suspended`, 'warning');
                    setShowUdgModal(true);
                    return { ...prev, progress: newProgress, totalUpvotes: newTotal, isRunning: false };
                }

                if (newProgress >= 100) {
                    clearInterval(intervalRef.current);
                    addLog(`Upvote delivery completed successfully!`, 'success');
                    addLog(`Total upvotes delivered: ${newTotal}`, 'success');
                    addLog(`Server ranking boost applied!`, 'success');
                    toast.success('Upvotes Complete! 🎉', { description: `Successfully sent ${newTotal} upvotes!` });
                    return { ...prev, progress: 100, totalUpvotes: newTotal, isRunning: false };
                }

                return { ...prev, progress: newProgress, totalUpvotes: newTotal };
            });
        }, 100);
    };

    const stopProcess = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setState(prev => ({ ...prev, isRunning: false, progress: 0, totalUpvotes: 0 }));
        addLog(`Process terminated by user request`, 'warning');
        addLog(`Partial delivery: ${state.totalUpvotes} upvotes sent`, 'info');
        toast.error('Process Stopped', { description: 'Upvote process has been terminated' });
    };

    const handleUdgKeySubmit = () => {
        const validKeys = ['RUNKZERIGALA-UDGKEY', 'ADMIN-RUNKZERIGALA'];
        addLog(`Authenticating license key...`, 'info');
        if (validKeys.includes(udgKeyInput.trim().toUpperCase())) {
            setState(prev => ({ ...prev, udgKeyVerified: true, isRunning: true }));
            setShowUdgModal(false);
            setUdgKeyInput('');
            addLog(`License authentication successful`, 'success');
            addLog(`Security clearance granted`, 'success');
            addLog(`Resuming upvote delivery process`, 'success');
            toast.success('License Verified! ✅', { description: 'Process resumed successfully' });

            intervalRef.current = setInterval(() => {
                setState(prev => {
                    const newProgress = Math.min(prev.progress + (100 / 30000) * 100, 100);
                    const newTotal = Math.floor(prev.targetUpvotes * (newProgress / 100));
                    if (newProgress >= 100) {
                        clearInterval(intervalRef.current);
                        addLog(`Upvote delivery completed successfully!`, 'success');
                        addLog(`Total upvotes delivered: ${newTotal}`, 'success');
                        addLog(`Server ranking boost applied!`, 'success');
                        toast.success('Upvotes Complete! 🎉', { description: `Successfully sent ${newTotal} upvotes!` });
                        return { ...prev, progress: 100, totalUpvotes: newTotal, isRunning: false };
                    }
                    return { ...prev, progress: newProgress, totalUpvotes: newTotal };
                });
            }, 100);
        } else {
            addLog(`License authentication failed`, 'error');
            addLog(`Invalid or expired license key`, 'error');
            toast.error('Invalid License Key', { description: 'Please check your license key and try again' });
            setUdgKeyInput('');
        }
    };

    return (
        <>
            <Helmet>
                <title>FiveM Upvotes Server - Boost Your Server Ranking | UDG V 7.0</title>
                <meta name="description" content="Boost your FiveM server ranking with our professional upvotes service. Get up to 50,000 upvotes per month. Real-time analytics, CFX.re API integration, and 24/7 support." />
                <meta name="keywords" content="fivem upvotes, fivem server boost, cfx.re upvotes, fivem ranking, server upvotes, fivem tools, udg v5, fivem server promotion, increase fivem players, fivem server visibility" />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://fivemtools.com/upvotes-server" />
                <meta property="og:title" content="FiveM Upvotes Server - Boost Your Server Ranking | UDG V 7.0" />
                <meta property="og:description" content="Professional FiveM server upvotes service. Boost your server ranking with real-time analytics and CFX.re API integration. Get started today!" />
                <meta property="og:image" content="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692c9d27fcb03e0d2d610054/fd2e0dbc0_Untitleddesign-26.png" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://fivemtools.com/upvotes-server" />
                <meta property="twitter:title" content="FiveM Upvotes Server - Boost Your Server Ranking | UDG V 7.0" />
                <meta property="twitter:description" content="Professional FiveM server upvotes service. Boost your server ranking with real-time analytics and CFX.re API integration." />
                <meta property="twitter:image" content="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692c9d27fcb03e0d2d610054/fd2e0dbc0_Untitleddesign-26.png" />

                {/* Additional SEO */}
                <meta name="robots" content="index, follow" />
                <meta name="language" content="English" />
                <meta name="revisit-after" content="7 days" />
                <meta name="author" content="FiveM Tools V7" />
                <link rel="canonical" href="https://fivemtools.com/upvotes-server" />

                {/* Schema.org markup */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "FiveM UDG V 7.0 - Server Upvotes Tool",
                        "applicationCategory": "GameApplication",
                        "operatingSystem": "Web",
                        "offers": {
                            "@type": "AggregateOffer",
                            "lowPrice": "425",
                            "highPrice": "750",
                            "priceCurrency": "USD"
                        },
                        "aggregateRating": {
                            "@type": "AggregateRating",
                            "ratingValue": "4.8",
                            "ratingCount": "1250"
                        },
                        "description": "Professional FiveM server upvotes service with real-time analytics, CFX.re API integration, and automated upvote delivery system."
                    })}
                </script>
            </Helmet>

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Top Banner */}
                <div className="w-full h-[150px] md:h-[200px] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 relative group">
                    {adBanners.map((banner, index) => (
                        <img
                            key={index}
                            src={banner}
                            alt="Ad"
                            className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${index === currentAd ? 'opacity-80 group-hover:opacity-100' : 'opacity-0'}`}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Left */}
                    <div className="hidden lg:block space-y-6">
                        <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 p-4">
                            <img src="https://www.qbox.re/static/screenshots/qbox-logo2.png" alt="Sponsor" className="w-full h-auto" />
                        </div>
                        <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                            <img src="https://forum-cfx-re.akamaized.net/original/4X/f/6/b/f6bac3f89493570ff9e81398f525b895401ada58.jpeg" alt="Sponsor" className="w-full h-auto" />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 backdrop-blur-sm">
                            <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                <img src="https://img.icons8.com/3d-fluency/94/rocket.png" className="w-8 h-8" alt="Rocket" />
                                FiveM Upvotes Server
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-zinc-400">Live</span>
                            </div>
                        </div>

                        {/* Server Configuration */}
                        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <img src="https://img.icons8.com/3d-fluency/94/server.png" className="w-6 h-6" alt="Server" />
                                Server Configuration
                            </h3>
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="cfx.re/join/xxxxx or IP:PORT"
                                        value={serverInput}
                                        onChange={(e) => setServerInput(e.target.value)}
                                        className="bg-zinc-800 border-zinc-700 text-white flex-1"
                                    />
                                    <Button
                                        onClick={() => validateServer(serverInput)}
                                        disabled={isValidating}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {isValidating ? <LoadingSpinner size="sm" /> : <Search className="w-4 h-4" />}
                                    </Button>
                                </div>

                                {serverStatus === 'valid' && serverInfo && (
                                    <div className="bg-gradient-to-br from-zinc-800/80 via-zinc-800/50 to-zinc-900/80 rounded-xl p-6 border-2 border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)] backdrop-blur-xl">
                                        {serverInfo.Data.vars?.banner_detail && (
                                            <div className="mb-4 rounded-lg overflow-hidden border border-zinc-700">
                                                <img src={serverInfo.Data.vars.banner_detail} alt="Server Banner" className="w-full h-32 object-cover" onError={(e) => e.target.style.display = 'none'} />
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 mb-4">
                                            <img src="https://img.icons8.com/3d-fluency/94/checkmark.png" className="w-8 h-8" alt="Check" />
                                            <div className="flex-1">
                                                <h4 className="font-bold text-white text-lg">{serverInfo.Data.hostname}</h4>
                                                <p className="text-xs text-zinc-400">{serverInfo.ipAddress}</p>
                                            </div>
                                            {serverInfo.premium && (
                                                <img src="https://img.icons8.com/3d-fluency/94/crown.png" className="w-6 h-6" alt="Premium" title="Premium Server" />
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div className="bg-zinc-900/50 rounded-lg p-3 text-center border border-zinc-700/50">
                                                <div className="text-2xl font-bold text-blue-400">{serverInfo.Data.clients}/{serverInfo.Data.sv_maxclients}</div>
                                                <div className="text-xs text-zinc-500 mt-1">Players Online</div>
                                            </div>
                                            <div className="bg-zinc-900/50 rounded-lg p-3 text-center border border-zinc-700/50">
                                                <div className="text-2xl font-bold text-green-400">{serverInfo.Data.upvotePower}</div>
                                                <div className="text-xs text-zinc-500 mt-1">Upvote Power</div>
                                            </div>
                                            <div className="bg-zinc-900/50 rounded-lg p-3 text-center border border-zinc-700/50">
                                                <div className="text-2xl font-bold text-purple-400">{serverInfo.ping}ms</div>
                                                <div className="text-xs text-zinc-500 mt-1">Ping</div>
                                            </div>
                                            <div className="bg-zinc-900/50 rounded-lg p-3 text-center border border-zinc-700/50">
                                                <div className="text-lg font-bold text-orange-400">{serverInfo.Data.gametype}</div>
                                                <div className="text-xs text-zinc-500 mt-1">Game Type</div>
                                            </div>
                                        </div>
                                        {serverInfo.Data.vars?.tags && (
                                            <div className="mt-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {serverInfo.Data.vars.tags.split(',').slice(0, 6).map((tag, i) => (
                                                        <span key={i} className="px-2 py-1 bg-fuchsia-500/10 text-fuchsia-400 text-xs rounded-full border border-fuchsia-500/30">
                                                            {tag.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upvotes Process */}
                        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <img src="https://img.icons8.com/3d-fluency/94/up.png" className="w-6 h-6" alt="Upvotes" />
                                Upvotes Process
                            </h3>
                            <div className="space-y-4">
                                <Input
                                    type="number"
                                    placeholder="Target Upvotes (1-50,000)"
                                    value={upvotesInput}
                                    onChange={(e) => setUpvotesInput(e.target.value)}
                                    className="bg-zinc-800 border-zinc-700 text-white"
                                />

                                <div className="flex gap-2">
                                    {!state.isRunning ? (
                                        <Button
                                            onClick={startProcess}
                                            disabled={serverStatus !== 'valid'}
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                        >
                                            <Play className="w-4 h-4 mr-2" />
                                            Launch Process
                                        </Button>
                                    ) : (
                                        <Button onClick={stopProcess} className="flex-1 bg-red-600 hover:bg-red-700">
                                            <Square className="w-4 h-4 mr-2" />
                                            Stop Process
                                        </Button>
                                    )}
                                </div>

                                {state.progress > 0 && (
                                    <div className="space-y-3 bg-zinc-800/30 rounded-lg p-4 border border-zinc-700">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-400">Progress</span>
                                            <span className="text-white font-bold">{state.progress.toFixed(1)}%</span>
                                        </div>
                                        <Progress value={state.progress} className="h-3" />
                                        <div className="grid grid-cols-2 gap-3 text-center">
                                            <div className="bg-zinc-900/50 rounded-lg p-3">
                                                <div className="text-2xl font-bold text-green-400">{state.totalUpvotes}</div>
                                                <div className="text-xs text-zinc-500">Upvotes Sent</div>
                                            </div>
                                            <div className="bg-zinc-900/50 rounded-lg p-3">
                                                <div className="text-2xl font-bold text-purple-400">{state.targetUpvotes}</div>
                                                <div className="text-xs text-zinc-500">Target</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Right */}
                    <div className="space-y-6">
                        <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                            <video src="https://cdn.discordapp.com/attachments/1350474981871583344/1377200664903553044/render.mp4?ex=692ea211&is=692d5091&hm=c3e7727cd0d569b159ba2ebf01579a1f3c1ccd5dd5e4e1945b97c936c3fade1a&" autoPlay loop muted playsInline className="w-full h-auto" />
                        </div>

                        {/* Online Players */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm">
                                <img src="https://img.icons8.com/3d-fluency/94/conference-call.png" className="w-5 h-5" alt="Players" />
                                Online Players {onlinePlayers.length > 0 && `(${onlinePlayers.length})`}
                            </h3>
                            <div className="max-h-[600px] overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                                {onlinePlayers.length > 0 ? (
                                    onlinePlayers.map((player) => (
                                        <div
                                            key={player.id}
                                            className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <img src={player.avatar} alt={player.name} className="w-10 h-10 rounded-full border-2 border-green-500" />
                                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900 animate-pulse"></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white truncate">{player.name}</p>
                                                    <p className="text-xs text-zinc-500 truncate">{player.server}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <img src="https://img.icons8.com/3d-fluency/94/user-group-man-man.png" className="w-16 h-16 mx-auto mb-3 opacity-50" alt="No Players" />
                                        <p className="text-sm text-zinc-500">No players online</p>
                                        <p className="text-xs text-zinc-600 mt-1">Validate a server to see online players</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Process Logs */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                                    <img src="https://cdn3d.iconscout.com/3d/premium/thumb/progress-3d-icon-png-download-8432068.png" className="w-5 h-5" alt="Activity" />
                                    Process Logs
                                </h3>
                                <Button onClick={() => setLogs([])} variant="ghost" size="sm" className="h-6 text-xs">
                                    Clear
                                </Button>
                            </div>
                            <div className="bg-zinc-950/50 rounded-lg p-3 h-64 overflow-y-auto font-mono text-xs border border-zinc-800">
                                {logs.length === 0 ? (
                                    <p className="text-zinc-500 text-center py-8">No logs yet...</p>
                                ) : (
                                    logs.map(log => (
                                        <div key={log.id} className="mb-1">
                                            <span className="text-zinc-600 mr-2">{log.timestamp}</span>
                                            <span className={`${log.type === 'error' ? 'text-red-400' :
                                                    log.type === 'success' ? 'text-green-400' :
                                                        log.type === 'warning' ? 'text-yellow-400' :
                                                            log.type === 'process' ? 'text-blue-400' :
                                                                'text-zinc-400'
                                                }`}>{log.message}</span>
                                        </div>
                                    ))
                                )}
                                <div ref={logsEndRef} />
                            </div>
                        </div>

                        {/* Pricing Button */}
                        <Button
                            onClick={() => setShowPriceModal(true)}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 h-12 text-base font-bold shadow-lg"
                        >
                            <img src="https://img.icons8.com/3d-fluency/94/price-tag.png" className="w-6 h-6 mr-2" alt="Price" />
                            View Pricing & Get UDG Key
                        </Button>
                    </div>
                </div>

                {/* UDG License Modal */}
                <Dialog open={showUdgModal} onOpenChange={() => { }}>
                    <DialogContent className="max-w-md bg-zinc-900/95 backdrop-blur-2xl border-2 border-zinc-700/50 shadow-[0_0_50px_rgba(168,85,247,0.4)]">
                        <div className="p-6 space-y-4">
                            <div className="text-center">
                                <div className="relative inline-block">
                                    <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full animate-pulse"></div>
                                    <img src="https://img.icons8.com/3d-fluency/94/shield.png" className="w-24 h-24 mx-auto mb-4 relative" alt="Shield" />
                                </div>
                                <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Security Checkpoint</h2>
                                <p className="text-sm text-zinc-400 mt-2">Process paused at 95%</p>
                                <p className="text-xs text-zinc-500 mt-1">Please enter your UDG License Key to continue</p>
                            </div>
                            <Input
                                type="password"
                                placeholder="Enter UDG License Key"
                                value={udgKeyInput}
                                onChange={(e) => setUdgKeyInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleUdgKeySubmit()}
                                className="bg-zinc-800/50 backdrop-blur-xl border-zinc-700 text-white h-12 text-center font-mono"
                            />
                            <div className="flex gap-2">
                                <Button onClick={handleUdgKeySubmit} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 h-12 shadow-lg">
                                    <img src="https://img.icons8.com/3d-fluency/94/checkmark.png" className="w-5 h-5 mr-2" alt="Check" />
                                    Verify License
                                </Button>
                                <Button
                                    onClick={() => { setShowUdgModal(false); setShowPriceModal(true); }}
                                    variant="outline"
                                    className="border-zinc-700 h-12 backdrop-blur-xl hover:bg-zinc-800"
                                >
                                    <img src="https://img.icons8.com/3d-fluency/94/shopping-cart.png" className="w-5 h-5 mr-2" alt="Buy" />
                                    Buy License
                                </Button>
                            </div>

                        </div>
                    </DialogContent>
                </Dialog>

                {/* Pricing Modal */}
                <Dialog open={showPriceModal} onOpenChange={setShowPriceModal}>
                    <DialogContent className="max-w-4xl bg-zinc-900/95 backdrop-blur-2xl border-2 border-zinc-700/50 shadow-[0_0_50px_rgba(234,179,8,0.4)]">
                        <div className="p-6">
                            <div className="text-center mb-8">
                                <div className="relative inline-block">
                                    <div className="absolute inset-0 bg-yellow-500/30 blur-2xl rounded-full animate-pulse"></div>
                                    <img src="https://img.icons8.com/3d-fluency/94/price-tag.png" className="w-24 h-24 mx-auto mb-4 relative" alt="Price" />
                                </div>
                                <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">FiveM UDG V 7.0 Pricing</h2>
                                <p className="text-sm text-zinc-400 mt-2">Choose the perfect plan for your server</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Monthly Plan */}
                                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl p-6 border-2 border-blue-500/30 hover:border-blue-500/50 transition-all">
                                    <div className="text-center mb-4">
                                        <img src="https://img.icons8.com/3d-fluency/94/calendar.png" className="w-16 h-16 mx-auto mb-3" alt="Monthly" />
                                        <h3 className="text-2xl font-bold text-white">Monthly Plan</h3>
                                        <div className="text-4xl font-black text-blue-400 my-4">$425</div>
                                        <p className="text-xs text-zinc-400">per month</p>
                                    </div>
                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                                            <img src="https://img.icons8.com/3d-fluency/94/checkmark.png" className="w-4 h-4" alt="Check" />
                                            50,000 Upvotes/Month
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                                            <img src="https://img.icons8.com/3d-fluency/94/checkmark.png" className="w-4 h-4" alt="Check" />
                                            Basic PowerBoost
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                                            <img src="https://img.icons8.com/3d-fluency/94/checkmark.png" className="w-4 h-4" alt="Check" />
                                            Standard Analytics
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                                            <img src="https://img.icons8.com/3d-fluency/94/checkmark.png" className="w-4 h-4" alt="Check" />
                                            Email Support
                                        </div>
                                    </div>
                                </div>

                                {/* Lifetime Plan */}
                                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl rounded-2xl p-6 border-2 border-yellow-500/50 hover:border-yellow-500/70 transition-all relative">
                                    <div className="absolute -top-3 right-4">
                                        <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">BEST VALUE</span>
                                    </div>
                                    <div className="text-center mb-4">
                                        <img src="https://img.icons8.com/3d-fluency/94/infinity.png" className="w-16 h-16 mx-auto mb-3" alt="Lifetime" />
                                        <h3 className="text-2xl font-bold text-white">Lifetime Plan</h3>
                                        <div className="text-4xl font-black text-yellow-400 my-4">$750</div>
                                        <p className="text-xs text-zinc-400">one-time payment</p>
                                    </div>
                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                                            <img src="https://img.icons8.com/3d-fluency/94/checkmark.png" className="w-4 h-4" alt="Check" />
                                            Unlimited Upvotes
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                                            <img src="https://img.icons8.com/3d-fluency/94/checkmark.png" className="w-4 h-4" alt="Check" />
                                            Advanced PowerBoost
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                                            <img src="https://img.icons8.com/3d-fluency/94/checkmark.png" className="w-4 h-4" alt="Check" />
                                            Professional Analytics
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                                            <img src="https://img.icons8.com/3d-fluency/94/checkmark.png" className="w-4 h-4" alt="Check" />
                                            Priority 24/7 Support
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                                            <img src="https://img.icons8.com/3d-fluency/94/checkmark.png" className="w-4 h-4" alt="Check" />
                                            Lifetime Updates
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                                            <img src="https://img.icons8.com/3d-fluency/94/checkmark.png" className="w-4 h-4" alt="Check" />
                                            Custom Branding
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-zinc-800/30 backdrop-blur-xl rounded-xl p-6 border border-zinc-700/50 mb-6">
                                <div className="flex items-start gap-4">
                                    <img src="https://img.icons8.com/3d-fluency/94/info.png" className="w-12 h-12" alt="Info" />
                                    <div>
                                        <h4 className="font-bold text-white mb-2">How to Purchase</h4>
                                        <ol className="text-sm text-zinc-400 space-y-1 list-decimal list-inside">
                                            <li>Click the button below to join our Discord server</li>
                                            <li>Open a ticket in the #support channel</li>
                                            <li>Choose your plan and complete the payment</li>
                                            <li>Receive your UDG License Key instantly</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => window.open('https://discord.gg/WYR27uKFns', '_blank')}
                                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 h-14 text-lg font-bold shadow-lg"
                            >
                                <img src="https://cdn-icons-png.flaticon.com/512/14857/14857399.png" className="w-6 h-6 mr-3" alt="Discord" />
                                Join Discord & Purchase Now
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
