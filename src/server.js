import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Environment variables - NEVER expose client_secret to frontend
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'https://fivemtools.net/auth/callback';

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://fivemtools.net',
  credentials: true
}));

// ✅ Discord OAuth Token Exchange Endpoint
app.post('/api/discord-callback', async (req, res) => {
  try {
    const { code, codeVerifier } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    console.log('[Backend] Exchanging authorization code for token...');

    // ✅ SECURE: Exchange code for token using client_secret
    // Client secret is ONLY on backend, never exposed to frontend
    const tokenResponse = await fetch('https://discord.com/api/v10/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: DISCORD_REDIRECT_URI,
        // Note: PKCE is not used with client_secret (they're mutually exclusive)
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('[Backend] Discord token exchange failed:', tokenData);
      
      // ✅ Provide specific error messages
      if (tokenData.error === 'invalid_grant') {
        return res.status(401).json({ 
          error: 'Authorization code expired or was already used. Please login again.' 
        });
      }
      
      return res.status(tokenResponse.status).json({ 
        error: tokenData.error_description || tokenData.error || 'Token exchange failed' 
      });
    }

    console.log('[Backend] Token exchange successful');

    const access_token = tokenData.access_token;

    // ✅ Fetch user data using access token
    console.log('[Backend] Fetching user data...');

    const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      console.error('[Backend] Failed to fetch user data:', userData);
      return res.status(userResponse.status).json({ 
        error: 'Failed to fetch user data' 
      });
    }

    console.log('[Backend] User data fetched successfully:', userData.id);

    // ✅ Return user data and token to frontend
    // Frontend will store in localStorage
    res.json({
      user: {
        id: userData.id,
        username: userData.username,
        discriminator: userData.discriminator,
        email: userData.email,
        avatar: userData.avatar,
        verified: userData.verified,
      },
      access_token: access_token,
    });

  } catch (err) {
    console.error('[Backend] Discord callback error:', err);
    res.status(500).json({ 
      error: 'Internal server error during authentication' 
    });
  }
});

// ✅ Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`✅ Discord OAuth endpoint: /api/discord-callback`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
});
