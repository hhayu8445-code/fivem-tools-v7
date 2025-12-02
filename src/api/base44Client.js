// WARNING: In production, move these to environment variables
// Use import.meta.env.VITE_API_KEY and import.meta.env.VITE_APP_ID
const API_KEY = import.meta.env.VITE_API_KEY;
const APP_ID = import.meta.env.VITE_APP_ID;

if (!API_KEY || !APP_ID) {
  console.error('Missing required environment variables: VITE_API_KEY or VITE_APP_ID');
}
const BASE_URL = `https://app.base44.com/api/apps/${APP_ID}/entities`;

if (!import.meta.env.VITE_API_KEY) {
  console.warn('⚠️ API credentials exposed! Set VITE_API_KEY in .env file');
}

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
            throw new Error(`API Error ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Failed to ${method} ${entityName}:`, error);
        // Fallback to empty array or null to prevent app crash
        if (method === 'GET' && !id) return [];
        return null;
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
      
      const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: DISCORD_CLIENT_ID,
          client_secret: import.meta.env.VITE_DISCORD_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: DISCORD_REDIRECT_URI
        })
      });
      
      const tokens = await tokenResponse.json();
      if (!tokens.access_token) throw new Error('Failed to get token');
      
      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });
      
      const discordUser = await userResponse.json();
      const user = {
        id: discordUser.id,
        email: discordUser.email,
        username: discordUser.username,
        discriminator: discordUser.discriminator,
        avatar: discordUser.avatar 
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${discordUser.id}`,
        global_name: discordUser.global_name || discordUser.username
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
      const ADMIN_DISCORD_IDS = ['1197320834889560127'];
      const isAdminUser = ADMIN_DISCORD_IDS.includes(user.id);
      
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
