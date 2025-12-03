import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const handleAuth = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('Authentication cancelled');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      if (!code || !state) {
        setError('Invalid callback parameters');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      try {
        await base44.auth.handleCallback(code, state);
        // Success - redirect to dashboard
        setTimeout(() => navigate('/dashboard'), 500);
      } catch (err) {
        console.error('Authentication error:', err);
        console.error('Error message:', err.message);
        
        // ✅ 100% REALISTIC: Provide specific error messages for different failure scenarios
        let errorMessage = 'Authentication failed. Please try again.';
        
        if (err.message.includes('Invalid state')) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.message.includes('Invalid PKCE')) {
          errorMessage = 'Security error. Please login again.';
        } else if (err.message.includes('Discord')) {
          errorMessage = 'Discord authentication failed. Check your Discord account and try again.';
        } else if (err.message.includes('Invalid credentials')) {
          errorMessage = 'Invalid Discord credentials. Please make sure Discord is properly linked.';
        }
        
        setError(errorMessage);
        
        // Redirect after 4 seconds
        setTimeout(() => navigate('/'), 4000);
      }
    };

    handleAuth();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
              <img src="https://img.icons8.com/3d-fluency/94/error.png" className="w-10 h-10" alt="Error" />
            </div>
            <h2 className="text-xl font-bold text-red-400">{error}</h2>
            <p className="text-zinc-500">Redirecting...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-xl font-bold text-white">Authenticating with Discord...</h2>
            <p className="text-zinc-500">Please wait</p>
          </>
        )}
      </div>
    </div>
  );
}
