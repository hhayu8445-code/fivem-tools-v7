import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import Layout from './Layout';
import OfflineIndicator from './Components/OfflineIndicator';
import ErrorBoundary from './Components/ErrorBoundary';
import { useUpdatePresence } from './hooks/useRealtime';
import { base44 } from '@/api/base44Client';
import 'nprogress/nprogress.css';

// Pages
import Home from './Pages/Home';
import Explore from './Pages/Explore';
import Asset from './Pages/Asset';
import Membership from './Pages/Membership';
import Dashboard from './Pages/Dashboard';
import Community from './Pages/Community';
import Profile from './Pages/Profile';
import Messages from './Pages/Messages';
import ForumCategory from './Pages/ForumCategory';
import Thread from './Pages/Thread';
import CreateThread from './Pages/CreateThread';
import ForumSearch from './Pages/ForumSearch';
import Admin from './Pages/Admin';
import ModDashboard from './Pages/ModDashboard';
import NotFound from './Pages/NotFound';
import Terms from './Pages/Terms';
import Privacy from './Pages/Privacy';
import DecryptAssets from './Pages/DecryptAssets';
import UpvotesServer from './Pages/UpvotesServer';
import AuthCallback from './Pages/AuthCallback';
import ProtectedRoute from './Components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const fetchUser = () => {
      base44.auth.me().then(setUser).catch(() => {});
    };
    fetchUser();

    // Listen for auth changes
    const handleAuthChange = () => {
      fetchUser();
    };
    window.addEventListener('auth-changed', handleAuthChange);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, []);

  useUpdatePresence(user?.email);

  return (
    <ErrorBoundary>
      <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/asset" element={<Asset />} />
              <Route path="/membership" element={<Membership />} />
              <Route path="/community" element={<Community />} />
              <Route path="/community/category/:id" element={<ForumCategory />} />
              <Route path="/community/thread/:id" element={<Thread />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/decrypt-assets" element={<ProtectedRoute><DecryptAssets /></ProtectedRoute>} />
              <Route path="/upvotes-server" element={<UpvotesServer />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/community/create-thread" element={<ProtectedRoute><CreateThread /></ProtectedRoute>} />
              <Route path="/community/search" element={<ProtectedRoute><ForumSearch /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><Admin /></ProtectedRoute>} />
              <Route path="/mod" element={<ProtectedRoute requireMod={true}><ModDashboard /></ProtectedRoute>} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </Router>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <Toaster position="top-right" theme="dark" richColors closeButton />
        <OfflineIndicator />
        <AppContent />
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
