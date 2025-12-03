# Discord Authentication Error - Quick Fix Checklist

**Error**: "Discord authentication failed. Check your Discord account and try again"

---

## 🚨 IMMEDIATE ACTIONS

### 1. Check Console Logs (F12)
Open Developer Tools → Console tab and look for messages starting with:
- `[AUTH]` - Backend OAuth handler logs
- `[Client OAuth]` - Frontend client logs

**These will tell you the EXACT problem!**

---

## ✅ Quick Fix Checklist

### A. Environment Variables Check

```bash
# 1. Local Development (.env file)
VITE_DISCORD_CLIENT_ID=<your_app_client_id>        # Must match Discord app
VITE_DISCORD_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_BACKEND_URL=http://localhost:3000
```

**Verify:**
- [ ] `VITE_DISCORD_CLIENT_ID` is NOT empty
- [ ] `VITE_DISCORD_CLIENT_ID` matches Discord app Client ID exactly
- [ ] `VITE_DISCORD_REDIRECT_URI` matches exactly what's in Discord app

### B. Production (Vercel) Only

Go to **Vercel Dashboard** → Settings → Environment Variables

**Verify these are set:**
- [ ] `DISCORD_CLIENT_ID` (same as VITE_DISCORD_CLIENT_ID)
- [ ] `DISCORD_CLIENT_SECRET` (from Discord app, NEVER in code)
- [ ] `DISCORD_REDIRECT_URI` (matches Discord app)

---

### C. Discord App Settings

1. Go to https://discord.com/developers/applications
2. Click your app
3. Go to **OAuth2** → **General**
4. **Verify:**
   - [ ] CLIENT ID matches `VITE_DISCORD_CLIENT_ID`
   - [ ] **Redirects** section includes your callback URL:
     - For local: `http://localhost:5173/auth/callback`
     - For production: `https://yourdomain.com/auth/callback`
5. **Click Save** if you made changes

---

## 🔍 Specific Error Messages & Fixes

| Console Error | Problem | Solution |
|---|---|---|
| `[AUTH] Missing DISCORD_CLIENT_ID` | Backend config missing | Add `DISCORD_CLIENT_ID` to Vercel env vars |
| `[AUTH] Missing DISCORD_CLIENT_SECRET` | Backend config missing | Add `DISCORD_CLIENT_SECRET` to Vercel env vars |
| `invalid_grant` | OAuth code expired | Try login again (don't wait >10min) |
| `invalid_request` | Wrong redirect URI | Check Discord app settings |
| `unauthorized_client` | Client ID not recognized | Verify Client ID in Discord app |
| `Network error: Could not reach auth server` | Backend unreachable | Check `VITE_BACKEND_URL` is correct |
| `No access token received` | Discord token exchange failed | Check DISCORD_CLIENT_SECRET in Vercel |

---

## 🧹 Clear & Retry

If you're still stuck, clear OAuth data:

```javascript
// Paste in browser console (F12)
localStorage.removeItem('oauth_state');
localStorage.removeItem('pkce_code_verifier');
localStorage.removeItem('discord_user');
localStorage.removeItem('discord_token');
console.log('Cleared. Try login again.');
```

Then try login again.

---

## 🆘 Still Not Working?

1. **Check what error appears in console** (F12 → Console)
2. **Match the error from the table above**
3. **Most common fixes:**
   - Wrong Client ID → Update .env
   - Wrong redirect URI → Update Discord app + .env
   - Missing backend vars → Add to Vercel
   - Expired code → Try login again

---

## 📚 Full Guide

For detailed troubleshooting, see: **DISCORD_AUTH_DEBUG.md**
