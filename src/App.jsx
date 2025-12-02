import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import Layout from './Layout';
import OfflineIndicator from './Components/OfflineIndicator';
import ErrorBoundary from './Components/ErrorBoundary';
import RealtimeNotifications from './Components/RealtimeNotifications';
import { useUpdatePresence } from './hooks/useRealtime';
import { useAuth } from './hooks/useAuth';
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
import EditThread from './Pages/EditThread';
import EditReply from './Pages/EditReply';
import ForumSearch from './Pages/ForumSearch';
import Admin from './Pages/Admin';
import ModDashboard from './Pages/ModDashboard';
import VouchAdmin from './Pages/VouchAdmin';
import AssetManagement from './Pages/AssetManagement';
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
  const { user } = useAuth();
  useUpdatePresence(user?.email);

  return (
    <Router>
      <RealtimeNotifications userEmail={user?.email} />
      <Layout>
            <Routes>
              <Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
              <Route path="/explore" element={<ErrorBoundary><Explore /></ErrorBoundary>} />
              <Route path="/asset" element={<ErrorBoundary><Asset /></ErrorBoundary>} />
              <Route path="/membership" element={<ErrorBoundary><Membership /></ErrorBoundary>} />
              <Route path="/community" element={<ErrorBoundary><Community /></ErrorBoundary>} />
              <Route path="/community/category/:id" element={<ErrorBoundary><ForumCategory /></ErrorBoundary>} />
              <Route path="/community/thread/:id" element={<ErrorBoundary><Thread /></ErrorBoundary>} />
              <Route path="/community/edit-thread/:id" element={<ErrorBoundary><ProtectedRoute><EditThread /></ProtectedRoute></ErrorBoundary>} />
              <Route path="/community/edit-reply/:id" element={<ErrorBoundary><ProtectedRoute><EditReply /></ProtectedRoute></ErrorBoundary>} />
              <Route path="/profile" element={<ErrorBoundary><Profile /></ErrorBoundary>} />
              <Route path="/decrypt-assets" element={<ErrorBoundary><ProtectedRoute><DecryptAssets /></ProtectedRoute></ErrorBoundary>} />
              <Route path="/upvotes-server" element={<ErrorBoundary><UpvotesServer /></ErrorBoundary>} />
              <Route path="/dashboard" element={<ErrorBoundary><ProtectedRoute><Dashboard /></ProtectedRoute></ErrorBoundary>} />
              <Route path="/community/create-thread" element={<ErrorBoundary><ProtectedRoute><CreateThread /></ProtectedRoute></ErrorBoundary>} />
              <Route path="/community/search" element={<ErrorBoundary><ProtectedRoute><ForumSearch /></ProtectedRoute></ErrorBoundary>} />
              <Route path="/messages" element={<ErrorBoundary><ProtectedRoute><Messages /></ProtectedRoute></ErrorBoundary>} />
              <Route path="/admin" element={<ErrorBoundary><ProtectedRoute requireAdmin={true}><Admin /></ProtectedRoute></ErrorBoundary>} />
              <Route path="/admin/vouches" element={<ErrorBoundary><ProtectedRoute requireAdmin={true}><VouchAdmin /></ProtectedRoute></ErrorBoundary>} />
              <Route path="/admin/assets" element={<ErrorBoundary><ProtectedRoute requireAdmin={true}><AssetManagement /></ProtectedRoute></ErrorBoundary>} />
              <Route path="/mod" element={<ErrorBoundary><ProtectedRoute requireMod={true}><ModDashboard /></ProtectedRoute></ErrorBoundary>} />
              <Route path="/terms" element={<ErrorBoundary><Terms /></ErrorBoundary>} />
              <Route path="/privacy" element={<ErrorBoundary><Privacy /></ErrorBoundary>} />
              <Route path="/auth/callback" element={<ErrorBoundary><AuthCallback /></ErrorBoundary>} />
              <Route path="*" element={<ErrorBoundary><NotFound /></ErrorBoundary>} />
            </Routes>
          </Layout>
      </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <Toaster position="top-right" theme="dark" richColors closeButton />
          <OfflineIndicator />
          <AppContent />
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
