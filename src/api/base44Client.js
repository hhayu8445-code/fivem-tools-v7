// ✅ SECURITY FIX: Validate environment variables at startup
const API_KEY = import.meta.env.VITE_API_KEY;
const APP_ID = import.meta.env.VITE_APP_ID;

// 🔴 THROW ERROR if credentials are missing - don't silently continue
if (!API_KEY || !APP_ID) {
  const missingVars = [];
  if (!API_KEY) missingVars.push('VITE_API_KEY');
  if (!APP_ID) missingVars.push('VITE_APP_ID');
  throw new Error(
    `❌ CRITICAL: Missing environment variables: ${missingVars.join(', ')}\n` +
    'Please check your .env file and ensure all required variables are set.'
  );
}

const BASE_URL = `https://app.base44.com/api/apps/${APP_ID}/entities`;

// Helper to construct query string from object
const buildQueryString = (params) => {
  if (!params) return '';
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === 'object') {
      // Handle nested objects if API supports specific format, 
      // for now simplified to string or ignoring complex filters if not supported by standard params
      // Assuming the API might take simple key=value for filtering
      // For complex queries ($or, $regex), the API might require specific handling
      // typically passed as separate params or a single 'query' param stringified
      // We'll try standard key=value for now.
      searchParams.append(key, JSON.stringify(value));
    } else {
      searchParams.append(key, value);
    }
  });
  return searchParams.toString();
};

const apiRequest = async (entityName, method = 'GET', id = '', data = null, params = {}) => {
  let url = `${BASE_URL}/${entityName}`;
  if (id) url += `/${id}`;

  // Handle special params like limit, sort, skip which might need to be query params
  const queryParams = new URLSearchParams();
  if (params.query) {
    Object.entries(params.query).forEach(([k, v]) => queryParams.append(k, v));
  }
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.skip) queryParams.append('skip', params.skip);
  if (params.sort) queryParams.append('sort', JSON.stringify(params.sort));

  const queryString = queryParams.toString();
  if (queryString) url += `?${queryString}`;

  const options = {
    method,
    headers: {
      'api_key': API_KEY,
      'Content-Type': 'application/json'
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.text().catch(() => '');
      const errorMessage = `API Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error(`❌ Failed to ${method} ${entityName}:`, error);
    // ✅ IMPROVED: Throw error instead of silently failing
    // Components can catch and show toast notifications
    throw error;
  }
};

// Generic Entity Handler
const createEntityHandler = (entityName) => ({
  list: async (params = {}) => {
    return await apiRequest(entityName, 'GET', '', null, params);
  },
  get: async (id) => {
    return await apiRequest(entityName, 'GET', id);
  },
  create: async (data) => {
    return await apiRequest(entityName, 'POST', '', data);
  },
  update: async (id, data) => {
    return await apiRequest(entityName, 'PUT', id, data);
  },
  delete: async (id) => {
    return await apiRequest(entityName, 'DELETE', id);
  }
});

const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;
const DISCORD_REDIRECT_URI = import.meta.env.VITE_DISCORD_REDIRECT_URI || window.location.origin + '/auth/callback';

const AUTH_STORAGE_KEY = 'discord_user';
const TOKEN_STORAGE_KEY = 'discord_token';

export const base44 = {
  auth: {
    isAuthenticated: async () => {
      const user = localStorage.getItem(AUTH_STORAGE_KEY);
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      return !!(user && token);
    },
    me: async () => {
      const userStr = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!userStr) return null;
      return JSON.parse(userStr);
    },
    logout: async () => {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.location.href = '/';
    },
    login: async () => {
      try {
        const state = Math.random().toString(36).substring(7);
        localStorage.setItem('oauth_state', state);

        // ✅ Simple OAuth flow - PKCE not needed since we use client_secret on backend
        const params = new URLSearchParams({
          client_id: DISCORD_CLIENT_ID,
          redirect_uri: DISCORD_REDIRECT_URI,
          response_type: 'code',
          scope: 'identify email guilds',
          state: state
        });
        window.location.href = `https://discord.com/api/oauth2/authorize?${params}`;
      } catch (err) {
        console.error('Login error:', err);
        throw new Error('Failed to initiate login. Please try again.');
      }
    },
    redirectToLogin: () => {
      base44.auth.login();
    },
    handleCallback: async (code, state) => {
      console.log('[Client OAuth] Starting callback handler...');

      // ✅ Validate state parameter
      const savedState = localStorage.getItem('oauth_state');
      if (state !== savedState) {
        console.error('[Client OAuth] State mismatch. Expected:', savedState, 'Got:', state);
        throw new Error('Invalid state: Session expired or tampered');
      }

      console.log('[Client OAuth] State validation passed');

      // ✅ SECURE: Call backend API to exchange code for token
      // Client secret is safely stored on backend only
      const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
      console.log('[Client OAuth] Backend URL:', backendUrl);

      try {
        console.log('[Client OAuth] Sending code to backend...');

        const response = await fetch(`${backendUrl}/api/discord-callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });

        const responseData = await response.json();

        if (!response.ok) {
          console.error('[Client OAuth] Backend returned error:', response.status, responseData);
          const errorMessage = responseData.error || `Server error (${response.status})`;
          throw new Error(errorMessage);
        }

        console.log('[Client OAuth] Backend response successful');

        const { user, access_token } = responseData;

        if (!user) {
          console.error('[Client OAuth] Missing user in response:', responseData);
          throw new Error('Invalid response: Missing user data');
        }

        if (!access_token) {
          console.error('[Client OAuth] Missing access_token in response:', responseData);
          throw new Error('Invalid response: No access token');
        }

        console.log('[Client OAuth] Storing credentials...');

        // ✅ Store token and user data
        localStorage.setItem(TOKEN_STORAGE_KEY, access_token);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

        // ✅ Clean up OAuth temporary data
        localStorage.removeItem('oauth_state');

        console.log('[Client OAuth] Creating user profile...');

        try {
          await base44.auth.ensureProfile(user);
        } catch (profileErr) {
          console.warn('[Client OAuth] Profile creation warning:', profileErr);
          // Don't fail authentication if profile creation fails
        }

        // Trigger custom event to notify Layout about auth change
        window.dispatchEvent(new Event('auth-changed'));

        console.log('[Client OAuth] Authentication successful for user:', user.id);
        return user;
      } catch (err) {
        console.error('[Client OAuth] OAuth error:', err);
        console.error('[Client OAuth] Error stack:', err.stack);

        // Re-throw with context
        if (err.message.includes('Failed to fetch')) {
          throw new Error('Network error: Could not reach authentication server. Check your internet connection.');
        }

        throw new Error(err.message || 'Failed to authenticate with Discord. Please try again.');
      }
    },
    ensureProfile: async (user) => {
      const profiles = await base44.entities.UserProfile.list({
        query: { user_email: user.email },
        limit: 1
      });

      // Check if user is admin by Discord ID
      const { ADMIN_CONFIG } = await import('@/config/admin');
      const isAdminUser = ADMIN_CONFIG.isAdmin(user.id);

      if (profiles.length === 0) {
        await base44.entities.UserProfile.create({
          user_email: user.email,
          discord_id: user.id,
          membership_tier: isAdminUser ? 'admin' : 'free',
          daily_downloads_count: 0,
          posts_count: 0,
          likes_received_count: 0,
          reputation: 0,
          points: 0,
          last_seen: new Date().toISOString()
        });
      } else if (isAdminUser && profiles[0].membership_tier !== 'admin') {
        // Auto-upgrade to admin if Discord ID matches
        await base44.entities.UserProfile.update(profiles[0].id, {
          membership_tier: 'admin'
        });
      }
    }
  },
  entities: {
    Asset: createEntityHandler('Asset'),
    UserProfile: createEntityHandler('UserProfile'),
    Notification: createEntityHandler('Notification'),
    ForumCategory: createEntityHandler('ForumCategory'),
    ForumThread: createEntityHandler('ForumThread'),
    ForumReply: createEntityHandler('ForumReply'),
    DirectMessage: createEntityHandler('DirectMessage'),
    DownloadLog: createEntityHandler('DownloadLog'),
    ForumLike: createEntityHandler('ForumLike'),
    ForumReport: createEntityHandler('ForumReport'),
    VouchMessage: createEntityHandler('VouchMessage')
  }
};
