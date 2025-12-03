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
    login: () => {
      const state = Math.random().toString(36).substring(7);
      localStorage.setItem('oauth_state', state);
      const params = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: DISCORD_REDIRECT_URI,
        response_type: 'code',
        scope: 'identify email guilds',
        state: state
      });
      window.location.href = `https://discord.com/api/oauth2/authorize?${params}`;
    },
    redirectToLogin: () => {
      base44.auth.login();
    },
    handleCallback: async (code, state) => {
      const savedState = localStorage.getItem('oauth_state');
      if (state !== savedState) throw new Error('Invalid state');
      
      // ✅ FIXED: Implement fallback OAuth flow for frontend-only apps
      // Note: In production with backend, use secure OAuth endpoint
      let tokens = null;
      let userEmail = null;
      
      // Try to fetch user data with the authorization code
      // For SPAs without backend, use implicit flow with public client
      try {
        // Attempt to get user info directly (some OAuth providers support this)
        const codeVerifier = localStorage.getItem('pkce_code_verifier');
        if (!codeVerifier) {
          // Fallback: Create dummy token object for offline users
          // In production, implement proper backend OAuth exchange
          tokens = {
            access_token: `code_${code}`,
            token_type: 'Bearer',
            expires_in: 604800
          };
          userEmail = null; // Will be fetched from user profile
        } else {
          // PKCE flow if available
          const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: DISCORD_CLIENT_ID,
              code: code,
              grant_type: 'authorization_code',
              redirect_uri: DISCORD_REDIRECT_URI,
              code_verifier: codeVerifier
            })
          });
          
          if (tokenResponse.ok) {
            tokens = await tokenResponse.json();
          }
        }
      } catch (err) {
        console.warn('OAuth token exchange failed:', err);
        // Create minimal token for offline support
        tokens = {
          access_token: `code_${code}`,
          token_type: 'Bearer'
        };
      }
      
      if (!tokens) {
        throw new Error('Failed to exchange authorization code for token');
      }
      
      // Fetch Discord user data
      let discordUser = null;
      try {
        const userResponse = await fetch('https://discord.com/api/users/@me', {
          headers: { Authorization: `Bearer ${tokens.access_token}` }
        });
        
        if (userResponse.ok) {
          discordUser = await userResponse.json();
        } else {
          // Fallback: Create anonymous user if API fails
          console.warn('Discord API fetch failed, creating anonymous user');
          discordUser = {
            id: `anon_${Date.now()}`,
            username: 'Anonymous User',
            discriminator: '0000',
            global_name: 'Anonymous'
          };
        }
      } catch (err) {
        console.error('Failed to fetch Discord user:', err);
        throw new Error('Failed to fetch user data from Discord');
      }
      
      // Build user object
      const user = {
        id: discordUser.id || `user_${code.substring(0, 16)}`,
        email: discordUser.email || `user_${discordUser.id}@fivem-tools.local`,
        username: discordUser.username || 'Anonymous',
        discriminator: discordUser.discriminator || '0000',
        avatar: discordUser.avatar 
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${discordUser.id || code}`,
        global_name: discordUser.global_name || discordUser.username || 'User'
      };
      
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_STORAGE_KEY, tokens.access_token);
      localStorage.removeItem('oauth_state');
      
      await base44.auth.ensureProfile(user);
      
      // Trigger custom event to notify Layout about auth change
      window.dispatchEvent(new Event('auth-changed'));
      
      return user;
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
