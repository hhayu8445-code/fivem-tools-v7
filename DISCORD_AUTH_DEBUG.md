# Discord Authentication Debugging Guide

## Quick Status Check

Open your browser's Developer Console (F12) and run:

```javascript
// Check if OAuth data is stored
console.log('Client ID:', localStorage.getItem('oauth_state') ? 'OAuth state found' : 'NO STATE');
console.log('Discord User:', localStorage.getItem('discord_user') ? 'User logged in' : 'NO USER');
console.log('Discord Token:', localStorage.getItem('discord_token') ? 'Token stored' : 'NO TOKEN');

// Check environment variables
console.log('Backend URL:', import.meta.env.VITE_BACKEND_URL);
console.log('Discord Client ID:', import.meta.env.VITE_DISCORD_CLIENT_ID);
console.log('Discord Redirect:', import.meta.env.VITE_DISCORD_REDIRECT_URI);
```

---

## Error Messages & Solutions

### ❌ "Discord authentication failed. Check your Discord account and try again"

**This is a generic error. Check the console for specific details:**

1. **Open DevTools (F12)** → Console tab
2. Look for messages starting with `[AUTH]` or `[Client OAuth]`
3. Find the actual error and match below:

#### Common Specific Errors:

| Error | Cause | Solution |
|-------|-------|----------|
| `invalid_grant` | OAuth code expired | Wait 10 seconds before retrying |
| `invalid_request` | Missing/wrong parameters | Check VITE_DISCORD_CLIENT_ID in .env |
| `unauthorized_client` | Client ID not authorized | Verify Client ID matches Discord app |
| `DISCORD_CLIENT_SECRET missing` | Backend config error | Add to Vercel environment variables |
| `invalid_redirect_uri` | Redirect URL mismatch | Check redirect URI in Discord app settings |
| `Network error` | Cannot reach backend | Check VITE_BACKEND_URL is correct |

---

## Step 1: Verify Environment Variables

### Local Development (.env file)

```bash
# Check your .env file contains:
VITE_API_KEY=<your_value>
VITE_APP_ID=<your_value>
VITE_DISCORD_CLIENT_ID=<your_discord_client_id>
VITE_DISCORD_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_BACKEND_URL=http://localhost:3000
```

**Validate:**
- `VITE_DISCORD_CLIENT_ID` is NOT empty
- `VITE_DISCORD_REDIRECT_URI` matches exactly what's in Discord app
- `VITE_BACKEND_URL` is accessible

### Production (Vercel)

Go to **Vercel Dashboard > Settings > Environment Variables** and verify these are set:

```
DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET
DISCORD_REDIRECT_URI
```

⚠️ **IMPORTANT**: These should NOT be in your .env file. Only in Vercel dashboard!

---

## Step 2: Verify Discord App Settings

1. Go to https://discord.com/developers/applications
2. Click your application
3. Go to **OAuth2** → **General** section
4. Verify:
   - ✅ **CLIENT ID** matches `VITE_DISCORD_CLIENT_ID` in your code
   - ✅ **Redirect URLs** section contains your callback URL:
     - Local: `http://localhost:5173/auth/callback`
     - Production: `https://yourdomain.com/auth/callback`
   - ✅ Save if you made changes

5. Go to **OAuth2** → **Client Secret** section
   - Copy this value (DO NOT share)
   - This goes in Vercel environment variables as `DISCORD_CLIENT_SECRET`

---

## Step 3: Test OAuth Flow

### Local Testing

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser DevTools (F12)** → Console tab

3. **Click "Login with Discord"** button

4. **Watch the console** for `[AUTH]` or `[Client OAuth]` messages:

   ```
   [Client OAuth] Starting callback handler...
   [Client OAuth] State validation passed
   [Client OAuth] PKCE verifier found
   [Client OAuth] Backend URL: http://localhost:3000
   [Client OAuth] Sending code to backend...
   [Client OAuth] Backend response successful
   [Client OAuth] Storing credentials...
   [Client OAuth] Creating user profile...
   [Client OAuth] Authentication successful for user: <USER_ID>
   ```

5. **If any step fails**, note the exact error message and check section below

### Network Tab Debugging

1. **In DevTools**, go to **Network** tab
2. Click "Login with Discord"
3. Look for requests to:
   - `https://discord.com/api/oauth2/authorize?...` (Should redirect)
   - `http://localhost:3000/discord-callback` (Or your backend URL) - **POST request**
   - This request should show `200 OK` response with `user` and `access_token`

If `discord-callback` request fails:
- ✅ Check response status (if 500, server error)
- ✅ Check response body for error message
- ✅ Check backend environment variables in Vercel

---

## Step 4: Debug Specific Scenarios

### Scenario A: "Server configuration error"

**This means backend environment variables are missing.**

1. If **local**: Check that VITE_BACKEND_URL points to a running backend
   ```bash
   npm run dev  # Starts on :5173
   # Backend should be running separately or no backend needed for dev
   ```

2. If **Vercel deployment**: 
   - Go to Vercel dashboard
   - Settings → Environment Variables
   - Verify these exist:
     - DISCORD_CLIENT_ID
     - DISCORD_CLIENT_SECRET
     - DISCORD_REDIRECT_URI
   - Redeploy after adding

### Scenario B: "Session expired" or "Invalid state"

```javascript
// Clear OAuth session
localStorage.removeItem('oauth_state');
localStorage.removeItem('pkce_code_verifier');
localStorage.removeItem('discord_user');
localStorage.removeItem('discord_token');
console.log('Cleared. Try login again.');
```

### Scenario C: "Network error"

1. Check your internet connection
2. Open DevTools → Network tab
3. Try login and check what requests fail:
   - If `discord.com/api/...` fails → Discord API unreachable
   - If `localhost:3000/discord-callback` fails → Backend not running
   - If both fail → Internet issue

### Scenario D: Login button shows but redirect doesn't work

1. **Before clicking login**, open DevTools → Network tab
2. Click "Login with Discord"
3. You should see a redirect to `https://discord.com/api/oauth2/authorize?...`
4. If you see it but nothing happens → Pop-up blocked
   - Check browser pop-up settings
   - Allow pop-ups for this site

---

## Step 5: Production Deployment Checklist

Before deploying to Vercel:

- [ ] All environment variables set in Vercel dashboard
- [ ] Discord app redirect URI updated to production URL
- [ ] VITE_DISCORD_REDIRECT_URI in code matches Discord app
- [ ] VITE_BACKEND_URL is set (Vercel sets to `/api` by default)
- [ ] DISCORD_CLIENT_SECRET is in Vercel (not in code)
- [ ] Redeploy after changing environment variables

---

## Step 6: Enable Debug Logging

### For More Detailed Logs

The backend (api/discord-callback.js) logs with `[AUTH]` prefix. To see these:

1. In Vercel dashboard:
   - Go to project → Deployments → View Logs
   - Filter by function logs

2. Look for messages like:
   ```
   [AUTH] Starting OAuth callback. Code present: true
   [AUTH] Config valid. Exchanging code for token...
   [AUTH] Token received successfully
   [AUTH] User data received: 12345678
   [AUTH] Authentication successful for user: 12345678
   ```

If you see errors in logs, that's your actual issue.

---

## Manual Testing (Advanced)

If GUI testing doesn't work, test OAuth manually:

```bash
# 1. Get authorization code manually
# Open in browser: https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:5173/auth/callback&response_type=code&scope=identify%20email%20guilds

# 2. You'll be redirected to: http://localhost:5173/auth/callback?code=ABC123&state=XYZ
# 3. Copy the CODE value

# 4. Test backend exchange (PowerShell)
$code = "ABC123"  # From redirect URL
$verifier = "test_verifier"

$response = Invoke-WebRequest -Uri "http://localhost:3000/discord-callback" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body (@{code=$code; codeVerifier=$verifier} | ConvertTo-Json)

$response.Content | ConvertFrom-Json
```

---

## Still Having Issues?

1. **Collect this information:**
   - Error message from AuthCallback page
   - Console logs (screenshot or copy-paste)
   - Network requests (screenshot)
   - Environment variables (don't share secrets!)
   - Discord app Client ID (public, ok to share)

2. **Check the most common issues:**
   - Wrong `VITE_DISCORD_CLIENT_ID` (doesn't match Discord app)
   - Wrong `VITE_DISCORD_REDIRECT_URI` (doesn't match Discord app or local setup)
   - Missing `DISCORD_CLIENT_SECRET` in Vercel
   - Backend not running or unreachable

3. **Reset everything:**
   ```javascript
   // Clear all OAuth data
   Object.keys(localStorage).forEach(k => {
     if (k.includes('oauth') || k.includes('discord') || k.includes('pkce')) {
       localStorage.removeItem(k);
     }
   });
   console.log('Cleared. Restart browser and try login.');
   ```

---

## Reference: Complete OAuth Flow

```
1. User clicks "Login with Discord"
   ↓
2. Frontend generates PKCE code_verifier + code_challenge
   ↓
3. Frontend redirects to Discord auth page
   ↓
4. User logs in to Discord and approves permissions
   ↓
5. Discord redirects back to: http://localhost:5173/auth/callback?code=XXX&state=YYY
   ↓
6. AuthCallback component gets code + state from URL
   ↓
7. Frontend calls: POST /api/discord-callback { code, codeVerifier }
   ↓
8. Backend exchanges code for token (using CLIENT_SECRET)
   ↓
9. Backend fetches user data from Discord API
   ↓
10. Backend returns { user, access_token } to frontend
    ↓
11. Frontend stores user + token in localStorage
    ↓
12. Redirect to dashboard
```

Each step must succeed for authentication to work!
