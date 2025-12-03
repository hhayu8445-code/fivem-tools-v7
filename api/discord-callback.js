// Vercel Serverless Function - Discord OAuth Callback with Enhanced Error Handling
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.error(`[AUTH] Invalid method: ${req.method}`);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, codeVerifier } = req.body;

  console.log('[AUTH] Starting OAuth callback. Code present:', !!code, 'Verifier present:', !!codeVerifier);

  if (!code || !codeVerifier) {
    console.error('[AUTH] Missing required parameters. Code:', !!code, 'Verifier:', !!codeVerifier);
    return res.status(400).json({ error: 'Missing code or codeVerifier' });
  }

  const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
  const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
  const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

  // ✅ Enhanced validation with detailed logging
  if (!DISCORD_CLIENT_ID) {
    console.error('[AUTH] Missing DISCORD_CLIENT_ID');
    return res.status(500).json({ error: 'Server configuration error: Missing CLIENT_ID' });
  }
  if (!DISCORD_CLIENT_SECRET) {
    console.error('[AUTH] Missing DISCORD_CLIENT_SECRET');
    return res.status(500).json({ error: 'Server configuration error: Missing CLIENT_SECRET' });
  }
  if (!DISCORD_REDIRECT_URI) {
    console.error('[AUTH] Missing DISCORD_REDIRECT_URI');
    return res.status(500).json({ error: 'Server configuration error: Missing REDIRECT_URI' });
  }

  console.log('[AUTH] Config valid. Exchanging code for token...');

  try {
    // Exchange code for token
    const tokenBody = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: DISCORD_REDIRECT_URI,
      code_verifier: codeVerifier
    });

    console.log('[AUTH] Token request to Discord API...');

    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenBody
    });

    const tokenResponseText = await tokenResponse.text();

    if (!tokenResponse.ok) {
      console.error(`[AUTH] Discord token error (${tokenResponse.status}):`, tokenResponseText);
      
      // ✅ Parse and provide specific error
      let errorDetail = 'Discord authentication failed';
      try {
        const errorJson = JSON.parse(tokenResponseText);
        errorDetail = errorJson.error || errorJson.error_description || errorDetail;
        console.error('[AUTH] Discord error response:', errorJson);
      } catch (e) {
        console.error('[AUTH] Could not parse error response');
      }

      return res.status(tokenResponse.status).json({ 
        error: errorDetail,
        debug: process.env.NODE_ENV !== 'production' ? tokenResponseText : undefined
      });
    }

    let tokens;
    try {
      tokens = JSON.parse(tokenResponseText);
      console.log('[AUTH] Token received successfully');
    } catch (e) {
      console.error('[AUTH] Failed to parse token response:', tokenResponseText);
      return res.status(500).json({ error: 'Invalid token response from Discord' });
    }

    if (!tokens.access_token) {
      console.error('[AUTH] No access token in response:', tokens);
      return res.status(500).json({ error: 'No access token received from Discord' });
    }

    // Fetch user data
    console.log('[AUTH] Fetching user data from Discord...');

    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });

    if (!userResponse.ok) {
      console.error(`[AUTH] Discord user fetch error (${userResponse.status})`);
      return res.status(userResponse.status).json({ error: 'Failed to fetch Discord user data' });
    }

    const discordUser = await userResponse.json();
    console.log('[AUTH] User data received:', discordUser.id);

    // ✅ Return user data and token to frontend
    const responseData = {
      user: {
        id: discordUser.id,
        email: discordUser.email || `user_${discordUser.id}@discord.local`,
        username: discordUser.username,
        discriminator: discordUser.discriminator,
        avatar: discordUser.avatar 
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          : `https://cdn.discordapp.com/embed/avatars/${(parseInt(discordUser.id) >> 22) % 6}.png`,
        global_name: discordUser.global_name || discordUser.username
      },
      access_token: tokens.access_token
    };

    console.log('[AUTH] Authentication successful for user:', discordUser.id);
    return res.status(200).json(responseData);
  } catch (error) {
    console.error('[AUTH] Unhandled error:', error);
    console.error('[AUTH] Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Internal server error during authentication',
      debug: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
}
