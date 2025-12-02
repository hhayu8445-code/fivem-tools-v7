import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { base44 } from '@/api/base44Client';
import Footer from '@/Components/Footer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { toast } from 'sonner';
import NProgress from 'nprogress';
import LoadingSpinner from '@/Components/LoadingSpinner';
import { logToDiscord } from '@/utils';
import { useAllStats } from '@/hooks/useStats';
import MemberBadge from '@/Components/MemberBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/Components/ui/sheet";

const navItems = [
  { icon: 'https://img.icons8.com/3d-fluency/94/conference-call.png', label: 'Community Forum', path: '/community' },
  { icon: 'https://img.icons8.com/3d-fluency/94/globe.png', label: 'Discover', path: '/' },
  { icon: 'https://img.icons8.com/3d-fluency/94/source-code.png', label: 'Scripts', path: '/explore?category=script' },
  { icon: 'https://img.icons8.com/3d-fluency/94/map-marker.png', label: 'Maps & MLO', path: '/explore?category=mlo' },
  { icon: 'https://images.icon-icons.com/577/PNG/256/Car_Grey_icon-icons.com_54905.png', label: 'Vehicles', path: '/explore?category=vehicle' },
  { icon: 'https://cdn3d.iconscout.com/3d/premium/thumb/vacation-wear-3d-icon-png-download-4551865.png', label: 'EUP & Clothing', path: '/explore?category=clothing' },
  { icon: 'https://cdn3d.iconscout.com/3d/premium/thumb/message-3d-icon-png-download-5576258.png', label: 'Messages', path: '/messages' },
  { icon: 'https://img.icons8.com/3d-fluency/94/shield.png', label: 'Membership', path: '/membership' },
  { icon: 'https://img.icons8.com/3d-fluency/94/key.png', label: 'Decrypt Assets CFX V7', path: '/decrypt-assets' },
  { icon: 'https://img.icons8.com/3d-fluency/94/rocket.png', label: 'Upvotes Server FiveM', path: '/upvotes-server' },
];

const SidebarContent = () => {
  const location = useLocation();
  const { onlineCount, totalMembers, totalAssets, todayDownloads } = useAllStats();

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.3)] overflow-hidden border border-fuchsia-500/30 relative group animate-breathe">
          <div className="absolute inset-0 bg-fuchsia-600/20 blur-lg group-hover:bg-fuchsia-500/40 transition-all duration-500" />
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692c9d27fcb03e0d2d610054/fd2e0dbc0_Untitleddesign-26.png"
            alt="FiveM Tools Logo"
            className="w-full h-full object-cover relative z-10"
          />
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-tight text-white">FiveM Tools V7</h1>
          <p className="text-xs text-zinc-500">Resource Hub</p>
        </div>
      </div>

      <div className="px-4 py-2">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${location.pathname.includes(item.path.split('?')[0])
                ? 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 shadow-[0_0_15px_rgba(232,121,249,0.1)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50 hover:shadow-[0_0_10px_rgba(255,255,255,0.05)]'
                }`}
            >
              <img src={item.icon} className="w-5 h-5" alt={item.label} />
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-zinc-800/50 space-y-3">
        {/* Status Server */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl p-4 border border-zinc-800 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-400">Status Server</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            </div>
            <p className="text-xs text-zinc-500">All systems operational</p>
          </div>
        </div>

        {/* 3D Stats Cards */}
        <div className="grid grid-cols-2 gap-2">
          {/* Online Users - Real-time */}
          <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-950/20 rounded-lg p-3 border border-emerald-800/30 relative overflow-hidden group hover:scale-105 transition-transform">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">Online</span>
              </div>
              <div className="text-xl font-bold text-white">{onlineCount}</div>
              <div className="text-[9px] text-zinc-500">Active users</div>
            </div>
          </div>

          {/* Total Members - Real-time */}
          <div className="bg-gradient-to-br from-violet-900/20 to-violet-950/20 rounded-lg p-3 border border-violet-800/30 relative overflow-hidden group hover:scale-105 transition-transform">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <img src="https://img.icons8.com/3d-fluency/94/conference-call.png" className="w-3 h-3" alt="Users" />
                <span className="text-[10px] font-medium text-violet-400 uppercase tracking-wider">Members</span>
              </div>
              <div className="text-xl font-bold text-white">{totalMembers}</div>
              <div className="text-[9px] text-zinc-500">Registered</div>
            </div>
          </div>

          {/* Total Assets - Real-time */}
          <div className="bg-gradient-to-br from-fuchsia-900/20 to-fuchsia-950/20 rounded-lg p-3 border border-fuchsia-800/30 relative overflow-hidden group hover:scale-105 transition-transform">
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <img src="https://cdn3d.iconscout.com/3d/premium/thumb/add-folder-3d-icon-png-download-5727515.png" className="w-3 h-3" alt="Assets" />
                <span className="text-[10px] font-medium text-fuchsia-400 uppercase tracking-wider">Assets</span>
              </div>
              <div className="text-xl font-bold text-white">{totalAssets}</div>
              <div className="text-[9px] text-zinc-500">Resources</div>
            </div>
          </div>

          {/* Downloads Today - Real-time */}
          <div className="bg-gradient-to-br from-amber-900/20 to-amber-950/20 rounded-lg p-3 border border-amber-800/30 relative overflow-hidden group hover:scale-105 transition-transform">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <img src="https://img.icons8.com/3d-fluency/94/download-from-cloud.png" className="w-3 h-3" alt="Downloads" />
                <span className="text-[10px] font-medium text-amber-400 uppercase tracking-wider">Today</span>
              </div>
              <div className="text-xl font-bold text-white">{todayDownloads}</div>
              <div className="text-[9px] text-zinc-500">Downloads</div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl p-3 border border-zinc-800 relative overflow-hidden">
          <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-2">Quick Links</div>
          <div className="space-y-1">
            <a href="https://discord.gg/WYR27uKFns" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors group">
              <img src="https://cdn-icons-png.flaticon.com/512/14857/14857399.png" className="w-4 h-4 group-hover:scale-110 transition-transform" alt="Discord" />
              <span className="text-xs text-zinc-400 group-hover:text-white transition-colors">Join Discord</span>
            </a>
            <Link to="/membership" className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors group">
              <img src="https://img.icons8.com/3d-fluency/94/crown.png" className="w-4 h-4 group-hover:scale-110 transition-transform" alt="VIP" />
              <span className="text-xs text-zinc-400 group-hover:text-white transition-colors">Get VIP</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);
  const [userProfile, setUserProfile] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Progress bar on route change
  React.useEffect(() => {
    NProgress.start();
    NProgress.done();
  }, [location.pathname]);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        if (await base44.auth.isAuthenticated()) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);

          // Get profile
          const profiles = await base44.entities.UserProfile.list({ query: { user_email: currentUser.email } });
          if (profiles.length > 0) {
            setUserProfile(profiles[0]);
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };
    fetchUser();

    // Listen for auth changes
    const handleAuthChange = () => fetchUser();
    window.addEventListener('auth-changed', handleAuthChange);
    window.addEventListener('storage', (e) => {
      if (e.key === 'discord_user' || e.key === 'discord_token') fetchUser();
    });

    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, []);

  const handleLogout = async () => {
    if (user) {
      logToDiscord('User Logout', {
        type: 'logout',
        user: user.full_name || user.username,
        email: user.email,
        description: '🚪 User logged out'
      });
    }
    await base44.auth.logout();
  };

  const NotificationBell = ({ user }) => {
    const queryClient = useQueryClient();
    const [prevUnreadCount, setPrevUnreadCount] = React.useState(0);

    const { data: notifications, isLoading: notifLoading } = useQuery({
      queryKey: ['notifications', user?.email],
      queryFn: () => base44.entities.Notification.list({
        query: { user_email: user.email },
        sort: { created_date: -1 },
        limit: 10
      }),
      enabled: !!user,
      refetchInterval: 15000 // Check every 15s
    });

    // Show toast when new notification arrives
    React.useEffect(() => {
      if (notifications) {
        const unreadCount = notifications.filter(n => !n.is_read).length;
        if (prevUnreadCount > 0 && unreadCount > prevUnreadCount) {
          const newNotif = notifications.find(n => !n.is_read);
          if (newNotif) {
            toast.info(newNotif.message, {
              duration: 5000,
              action: newNotif.link ? {
                label: 'View',
                onClick: () => navigate(newNotif.link)
              } : undefined
            });
          }
        }
        setPrevUnreadCount(unreadCount);
      }
    }, [notifications]);

    const markReadMutation = useMutation({
      mutationFn: async (id) => {
        await base44.entities.Notification.update(id, { is_read: true });
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['notifications']);
      }
    });

    if (!user) return (
      <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
        <img src="https://img.icons8.com/3d-fluency/94/bell.png" className="w-5 h-5" alt="Notifications" />
      </Button>
    );

    if (notifLoading) return (
      <Button variant="ghost" size="icon" className="text-zinc-400">
        <LoadingSpinner size="sm" />
      </Button>
    );

    const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100 relative">
            <img src="https://img.icons8.com/3d-fluency/94/bell.png" className="w-5 h-5" alt="Notifications" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-fuchsia-500 rounded-full" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 bg-zinc-900 border-zinc-800 text-zinc-200">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs bg-fuchsia-500/20 text-fuchsia-400 px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <div className="max-h-[300px] overflow-y-auto scrollbar-thin">
            {notifications?.length > 0 ? (
              notifications.map(notif => (
                <DropdownMenuItem
                  key={notif.id}
                  className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!notif.is_read ? 'bg-zinc-800/50' : ''}`}
                  onClick={() => {
                    if (!notif.is_read) markReadMutation.mutate(notif.id);
                    if (notif.link) {
                      if (notif.link.startsWith('/') && !notif.link.startsWith('//')) {
                        navigate(notif.link);
                      } else {
                        window.location.href = notif.link;
                      }
                    }
                  }}
                >
                  <p className="text-sm font-medium text-zinc-200">{notif.message}</p>
                  <div className="flex items-center justify-between w-full text-xs text-zinc-500">
                    <span>{new Date(notif.created_date).toLocaleDateString()}</span>
                    {!notif.is_read && <span className="text-fuchsia-400">New</span>}
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-zinc-500">
                No notifications
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-violet-500/30 relative overflow-hidden">
      <Helmet>
        <title>FiveM Tools V7 | Ultimate Resource Hub</title>
        <meta name="description" content="The best place to find FiveM scripts, vehicles, MLOs, and join the community." />

        {/* Open Graph / Discord Embeds */}
        <meta property="og:title" content="FiveM Tools V7 | Ultimate Resource Hub" />
        <meta property="og:description" content="The best place to find FiveM scripts, vehicles, MLOs, and join the community." />
        <meta property="og:image" content="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692c9d27fcb03e0d2d610054/fd2e0dbc0_Untitleddesign-26.png" />
        <meta property="og:type" content="website" />
        <meta name="theme-color" content="#d946ef" />
      </Helmet>

      {/* Background Video */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-zinc-950">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          onError={(e) => {
            console.error("Video playback error:", e);
            e.target.style.display = 'none'; // Hide video if it fails
          }}
        >
          <source src="/mv.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-zinc-950/80"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* Animated Logo Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none overflow-hidden">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692c9d27fcb03e0d2d610054/fd2e0dbc0_Untitleddesign-26.png"
            alt=""
            className="w-[800px] h-[800px] object-contain animate-pulse opacity-50 blur-sm scale-150"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg overflow-hidden shadow-[0_0_15px_rgba(236,72,153,0.4)] border border-fuchsia-500/30">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692c9d27fcb03e0d2d610054/fd2e0dbc0_Untitleddesign-26.png"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-white via-fuchsia-200 to-fuchsia-400">FiveM Tools V7</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <img src="https://img.icons8.com/3d-fluency/94/menu.png" className="w-6 h-6" alt="Menu" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-zinc-950 border-zinc-800 p-0 w-72">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 border-r border-zinc-800/50 bg-zinc-950/50 backdrop-blur-xl h-full flex-shrink-0 sticky top-0">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
          {/* Top Navbar */}
          <header className="h-16 border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
            {/* Search Section */}
            <div className="flex-1 max-w-2xl">
              <form onSubmit={handleSearch} className="relative group">
                <img src="https://img.icons8.com/3d-fluency/94/search.png" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50 group-focus-within:opacity-100 transition-opacity" alt="Search" />
                <Input
                  placeholder="Search assets..."
                  className="bg-zinc-900/50 border-zinc-800 pl-10 pr-4 h-10 focus:bg-zinc-900 focus:border-violet-500/50 transition-all rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-3 ml-4">
              {/* Advanced Search */}
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-zinc-400 hover:text-fuchsia-400 hover:bg-zinc-800/50 rounded-full"
                onClick={() => navigate('/community/search')}
                title="Advanced Search"
              >
                <img src="https://img.icons8.com/3d-fluency/94/filter.png" className="w-5 h-5" alt="Search" />
              </Button>

              {/* Discord Link */}
              <a
                href="https://discord.gg/WYR27uKFns"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 flex items-center justify-center rounded-full text-zinc-400 hover:text-[#5865F2] hover:bg-zinc-800/50 transition-all"
                title="Join Discord"
              >
                <img src="https://cdn-icons-png.flaticon.com/512/14857/14857399.png" className="w-5 h-5" alt="Discord" />
              </a>

              {/* Notifications */}
              <NotificationBell user={user} />

              {/* User Menu / Login */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden ring-2 ring-zinc-800 hover:ring-violet-500 transition-all">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white font-bold">
                          {user.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 bg-zinc-900 border-zinc-800 text-zinc-200 shadow-xl" align="end">
                    <DropdownMenuLabel className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-zinc-800">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white font-bold">
                            {user.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white truncate">{user.username || 'User'}</div>
                          <div className="text-xs text-zinc-500 truncate">{user.email}</div>
                          {userProfile && (
                            <div className="mt-1">
                              <MemberBadge tier={userProfile.membership_tier} size="sm" />
                            </div>
                          )}
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-zinc-800" />

                    <DropdownMenuItem asChild className="focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer py-2.5">
                      <Link to="/dashboard" className="flex items-center gap-3 w-full">
                        <img src="https://img.icons8.com/3d-fluency/94/user-male-circle.png" className="w-5 h-5" alt="Dashboard" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer py-2.5">
                      <Link to="/dashboard" className="flex items-center gap-3 w-full">
                        <img src="https://cdn.iconscout.com/icon/free/png-256/free-apple-settings-icon-svg-download-png-493162.png?f=webp" className="w-5 h-5" alt="Settings" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>

                    {(() => {
                      try {
                        const { ADMIN_CONFIG } = require('@/config/admin');
                        return ADMIN_CONFIG.isAdmin(user.id);
                      } catch {
                        return user.id === '1197320834889560127';
                      }
                    })() && (
                        <>
                          <DropdownMenuSeparator className="bg-zinc-800" />
                          <DropdownMenuItem asChild className="focus:bg-amber-900/20 focus:text-amber-400 cursor-pointer py-2.5">
                            <Link to="/admin" className="flex items-center gap-3 w-full">
                              <img src="https://img.icons8.com/3d-fluency/94/crown.png" className="w-5 h-5" alt="Admin" />
                              <span className="font-medium">Admin Panel</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="focus:bg-violet-900/20 focus:text-violet-400 cursor-pointer py-2.5">
                            <Link to="/admin/vouches" className="flex items-center gap-3 w-full">
                              <img src="https://cdn3d.iconscout.com/3d/premium/thumb/discount-vouchers-3d-icon-png-download-4688367.png" className="w-5 h-5" alt="Vouches" />
                              <span className="font-medium">Vouch Management</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="focus:bg-blue-900/20 focus:text-blue-400 cursor-pointer py-2.5">
                            <Link to="/admin/assets" className="flex items-center gap-3 w-full">
                              <img src="https://cdn3d.iconscout.com/3d/premium/thumb/add-folder-3d-icon-png-download-5727515.png" className="w-5 h-5" alt="Assets" />
                              <span className="font-medium">Asset Management</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="focus:bg-blue-900/20 focus:text-blue-400 cursor-pointer py-2.5">
                            <Link to="/mod" className="flex items-center gap-3 w-full">
                              <img src="https://img.icons8.com/3d-fluency/94/law.png" className="w-5 h-5" alt="Mod" />
                              <span className="font-medium">Mod Panel</span>
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}

                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-300 focus:bg-red-900/20 cursor-pointer py-2.5">
                      <img src="https://img.icons8.com/3d-fluency/94/shutdown.png" className="mr-3 w-5 h-5" alt="Logout" />
                      <span className="font-medium">Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => base44.auth.login()}
                  className="bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-full px-4 md:px-6 h-10 font-medium shadow-[0_0_15px_rgba(88,101,242,0.4)] transition-all hover:scale-105 flex items-center gap-2"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.077.077 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" />
                  </svg>
                  <span className="hidden md:inline">Login with Discord</span>
                  <span className="md:hidden">Login</span>
                </Button>
              )}
            </div>
          </header>

          {/* Content Scroll Area */}
          <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            <div className="max-w-7xl mx-auto p-6 min-h-[calc(100vh-4rem-200px)]">
              {children}
            </div>
            <Footer />
          </main>
        </div>
      </div>

      {/* Global Styles for Scrollbar and Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #3f3f46; border-radius: 20px; }
        
        @keyframes breathe {
          0%, 100% { transform: scale(1); filter: brightness(1); box-shadow: 0 0 20px rgba(236,72,153,0.3); }
          50% { transform: scale(1.05); filter: brightness(1.2); box-shadow: 0 0 30px rgba(236,72,153,0.6); }
        }
        .animate-breathe { animation: breathe 3s infinite ease-in-out; }
        
        /* NProgress Custom Styles */
        #nprogress .bar { background: linear-gradient(90deg, #d946ef, #a855f7) !important; height: 3px !important; }
        #nprogress .peg { box-shadow: 0 0 10px #d946ef, 0 0 5px #d946ef !important; }
        #nprogress .spinner-icon { border-top-color: #d946ef !important; border-left-color: #d946ef !important; }
      `}</style>
    </div>
  );
}