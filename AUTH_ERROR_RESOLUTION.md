# Discord Authentication Error - Resolution Plan

## Problem
**"Discord authentication failed. Check your Discord account and try again"**

This generic error can have multiple causes. I've added comprehensive debugging to identify the exact issue.

---

## What Changed (Just Deployed)

### 1. **Backend OAuth Handler** (`api/discord-callback.js`)
- ✅ Detailed `[AUTH]` logging at each step
- ✅ Specific error messages (invalid_grant, unauthorized_client, etc.)
- ✅ Config validation with clear missing variable errors
- ✅ Better Discord API error parsing

### 2. **Frontend Client** (`src/api/base44Client.js`)
- ✅ `[Client OAuth]` logging for debugging
- ✅ PKCE validation logging
- ✅ Network error detection
- ✅ Improved error context

### 3. **Callback Handler** (`src/Pages/AuthCallback.jsx`)
- ✅ Specific error messages (9 different scenarios)
- ✅ Network vs credential vs config errors identified
- ✅ Better user-facing error text

---

## How to Fix

### Step 1: Verify Environment Setup (2 minutes)

**Local Development:**
```
Check your .env file contains:
✓ VITE_DISCORD_CLIENT_ID=<your_discord_app_client_id>
✓ VITE_DISCORD_REDIRECT_URI=http://localhost:5173/auth/callback
✓ VITE_BACKEND_URL=http://localhost:3000
```

**Production (Vercel):**
```
Go to Vercel Dashboard > Settings > Environment Variables
✓ DISCORD_CLIENT_ID
✓ DISCORD_CLIENT_SECRET  
✓ DISCORD_REDIRECT_URI
```

### Step 2: Verify Discord App Settings (2 minutes)

1. Go to https://discord.com/developers/applications
2. Click your application
3. **OAuth2** → **General** section:
   - Copy CLIENT ID → compare with your `VITE_DISCORD_CLIENT_ID`
   - Under **Redirects**, add: `http://localhost:5173/auth/callback`
4. **OAuth2** → **Client Secret** section:
   - Copy secret → set as `DISCORD_CLIENT_SECRET` in Vercel

### Step 3: Debug (When you test login)

1. **Open DevTools**: Press **F12** → **Console** tab
2. **Click "Login with Discord"**
3. **Look for** `[AUTH]` or `[Client OAuth]` messages
4. **Find the specific error** and match against this table:

| Error Message | Cause | Fix |
|---|---|---|
| `[AUTH] Missing DISCORD_CLIENT_ID` | Backend var not set | Add to Vercel env vars |
| `[AUTH] Missing DISCORD_CLIENT_SECRET` | Backend var not set | Add to Vercel env vars |
| `invalid_grant` | OAuth code expired | Try login again |
| `invalid_request` | Wrong parameters | Check redirect URI |
| `unauthorized_client` | Client ID not recognized | Verify Discord app Client ID |
| `invalid_redirect_uri` | URL mismatch | Update Discord app redirect |
| `Network error` | Backend unreachable | Check VITE_BACKEND_URL |

---

## Documentation

### For Quick Fixes:
📄 **DISCORD_AUTH_QUICK_FIX.md**
- Checklist format
- Common errors & solutions
- Takes 5 minutes

### For Deep Debugging:
📄 **DISCORD_AUTH_DEBUG.md**
- Step-by-step troubleshooting
- Console log examples
- Network tab debugging
- Manual OAuth testing
- Takes 20 minutes

### For Setup:
📄 **.env.example**
- Environment variable reference
- Setup instructions
- Troubleshooting section

---

## Quick Diagnosis (30 seconds)

Run this in browser console (F12):

```javascript
// Check what's stored
console.log('User:', localStorage.getItem('discord_user') ? '✅' : '❌');
console.log('Token:', localStorage.getItem('discord_token') ? '✅' : '❌');
console.log('State:', localStorage.getItem('oauth_state') ? '✅' : '❌');

// Check config
console.log('Client ID:', import.meta.env.VITE_DISCORD_CLIENT_ID);
console.log('Backend:', import.meta.env.VITE_BACKEND_URL);
```

---

## Most Common Issues (& 1-minute fixes)

### Issue #1: Wrong Discord Client ID
```
Error: [AUTH] Token request fails
Cause: VITE_DISCORD_CLIENT_ID doesn't match Discord app
Fix: 
  1. Get correct Client ID from https://discord.com/developers/applications
  2. Update .env file
  3. Restart dev server (npm run dev)
```

### Issue #2: Wrong Redirect URI
```
Error: invalid_redirect_uri or Discord won't redirect back
Cause: VITE_DISCORD_REDIRECT_URI doesn't match Discord app settings
Fix:
  1. Go to Discord app > OAuth2 > Redirects
  2. Add exactly: http://localhost:5173/auth/callback
  3. Save changes
  4. Try login again
```

### Issue #3: Missing Backend Secret
```
Error: [AUTH] Missing DISCORD_CLIENT_SECRET or token exchange fails
Cause: Not set in Vercel environment variables (production only)
Fix:
  1. Go to Vercel Dashboard > Settings > Environment Variables
  2. Add DISCORD_CLIENT_SECRET (from Discord app)
  3. Redeploy
```

### Issue #4: OAuth Code Expired
```
Error: invalid_grant
Cause: Took too long or reused authorization code
Fix: 
  1. Clear OAuth data: localStorage.clear()
  2. Try login again immediately
```

---

## Getting Help

**If you're stuck:**

1. **Open DevTools (F12) and see the actual error**
   - It will be much more specific than "authentication failed"
   
2. **Match your error** against DISCORD_AUTH_DEBUG.md
   - Scroll to "Common Specific Errors" section
   
3. **Check environment variables:**
   - Local: .env file
   - Production: Vercel dashboard
   
4. **Verify Discord app:**
   - Client ID matches
   - Redirect URI matches exactly
   - Secret is saved

---

## Testing Your Fix

Once you fix the issue, test with:

```javascript
// 1. Open DevTools (F12)
// 2. Clear old data
localStorage.clear();

// 3. Go to home page and click Login with Discord
// 4. Watch console for [AUTH] or [Client OAuth] messages
// 5. Success if you see: "[Client OAuth] Authentication successful for user: <ID>"
```

---

## Files & Locations

```
Root
├── .env                          ← Your local config
├── .env.example                  ← Reference (updated with docs)
├── DISCORD_AUTH_QUICK_FIX.md    ← Quick checklist
├── DISCORD_AUTH_DEBUG.md        ← Full guide
├── api
│   └── discord-callback.js       ← Backend OAuth (enhanced)
└── src
    ├── api
    │   └── base44Client.js       ← Client OAuth (enhanced)
    └── Pages
        └── AuthCallback.jsx      ← Error handling (enhanced)
```

---

## What to Do Right Now

1. **Check your .env file** (takes 1 min)
   - Verify VITE_DISCORD_CLIENT_ID is not empty
   - Verify it matches your Discord app
   
2. **Check Discord app settings** (takes 1 min)
   - Verify CLIENT ID matches
   - Verify redirect URI is set
   
3. **Try login & watch console** (takes 2 mins)
   - F12 → Console → Look for [AUTH] messages
   - Note the specific error
   
4. **If still broken:**
   - Check DISCORD_AUTH_QUICK_FIX.md
   - Find your error in the table
   - Follow the fix

---

## Still Not Working?

**Your error message from console is the key!** 

Post this in your debug:
```
1. The exact error message from F12 console
2. Your Discord app Client ID
3. Your VITE_DISCORD_REDIRECT_URI
4. Is this local or production?
```

**Don't share:**
- VITE_DISCORD_CLIENT_SECRET (production)
- Any tokens or access keys

---

## Success Indicators

When login works, you'll see:

```
✅ Console shows: "[Client OAuth] Authentication successful for user: <YOUR_ID>"
✅ Redirects to /dashboard
✅ Your username appears in top-right
✅ localStorage contains: discord_user and discord_token
```

Good luck! The new logging should make it much easier to identify what's actually happening. 🚀
