import React from 'react';
import { Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ADMIN_CONFIG } from '@/config/admin';

export default function ProtectedRoute({ children, requireAdmin = false, requireMod = false }) {
  const [isAuth, setIsAuth] = React.useState(null);
  const [hasAccess, setHasAccess] = React.useState(null);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      setIsAuth(authenticated);
      
      if (authenticated) {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        if (requireAdmin) {
          setHasAccess(ADMIN_CONFIG.isAdmin(currentUser.id));
        } else if (requireMod) {
          const modAccess = await ADMIN_CONFIG.isModerator(currentUser);
          setHasAccess(modAccess);
        } else {
          setHasAccess(true);
        }
      }
    };
    checkAuth();
  }, [requireAdmin, requireMod]);

  if (isAuth === null || (isAuth && hasAccess === null)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuth) {
    base44.auth.login();
    return null;
  }

  if ((requireAdmin || requireMod) && !hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <img src="https://img.icons8.com/3d-fluency/94/denied.png" className="w-20 h-20 mx-auto" alt="Access Denied" />
          <h2 className="text-2xl font-bold text-red-400">Access Denied</h2>
          <p className="text-zinc-500">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
}
