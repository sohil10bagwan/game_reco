# MongoDB Atlas Setup Guide

## 🎯 Quick Start - Using Your Atlas Connection String

Your application is **already configured** to work with MongoDB Atlas! You just need to provide your connection string.

---

## Step 1: Get Your MongoDB Atlas Connection String

### If you already have MongoDB Atlas set up:

1. Go to https://cloud.mongodb.com/
2. Click **"Database"** in the left sidebar
3. Find your cluster and click **"Connect"**
4. Choose **"Connect your application"**
5. Select:
   - Driver: **Node.js**
   - Version: **5.9.0 or later**
6. Copy the connection string

It looks like this:
```
mongodb+srv://your_username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Important: Replace `<password>` with your actual password!

Example:
```
mongodb+srv://gameuser:MySecurePass123@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

Then add your database name at the end:
```
mongodb+srv://gameuser:MySecurePass123@cluster0.abc123.mongodb.net/game_reco?retryWrites=true&w=majority
```

---

## Step 2: Update Your Environment Variable

### For Local Development (`.env` file):

Replace the placeholder in your `.env` file:

```env
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/game_reco?retryWrites=true&w=majority
```

**With your actual connection string:**

```env
MONGODB_URI=mongodb+srv://gameuser:MySecurePass123@cluster0.abc123.mongodb.net/game_reco?retryWrites=true&w=majority
```

⚠️ **Important**: URL-encode special characters in your password:
- `@` → `%40`
- `!` → `%21`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `^` → `%5E`
- `&` → `%26`
- `*` → `%2A`
- `(` → `%28`
- `)` → `%29`

Example: If password is `MyP@ssw0rd!`, use `MyP%40ssw0rd%21`

---

### For Render Deployment (Environment Variables):

1. Go to https://dashboard.render.com/
2. Select your `game-reco-backend` service
3. Click **"Environment"** tab
4. Find the `MONGODB_URI` variable
5. Click **"Edit"**
6. Paste your **full Atlas connection string**
7. Click **"Save Changes"**

---

## Step 3: Redeploy to Render

After updating the environment variable:

1. In Render Dashboard, go to **"Manual Deploy"** section
2. Click **"Clear build cache & deploy"**
3. Wait 2-3 minutes for deployment
4. Check the **Logs** tab

### Expected Success Logs:

```
✅ CORS enabled for: https://game-reco-frontend.vercel.app
🚀 Server running in production mode on port 3000
✅ MongoDB Connected: game_reco
```

---

## Step 4: Test Your API

Once deployed, test these endpoints:

### Health Check:
```
GET https://game-reco-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-03-31T12:00:00.000Z"
}
```

### Get All Games:
```
GET https://game-reco-backend.onrender.com/api/games
```

Expected response:
```json
{
  "success": true,
  "count": 0,
  "data": []
}
```

---

## 🔧 Production Connection Options

Your code already includes optimal connection settings for MongoDB Atlas:

```javascript
{
  maxPoolSize: 10,              // Max connections in pool
  minPoolSize: 5,               // Min connections maintained
  maxIdleTimeMS: 30000,         // Close idle after 30s
  serverSelectionTimeoutMS: 5000,  // Timeout if unavailable
  socketTimeoutMS: 45000,          // Socket timeout
  heartbeatFrequencyMS: 10000,     // Health check interval
  retryWrites: true,            // Auto-retry failed writes
  retryReads: true,             // Auto-retry failed reads
  w: 'majority'                 // Write concern for safety
}
```

These settings are perfect for production use with Atlas!

---

## ✅ Checklist

Before deploying, verify:

- [ ] MongoDB Atlas cluster is created and running
- [ ] Database user created with proper permissions
- [ ] Network Access allows `0.0.0.0/0` (or specific IPs)
- [ ] Connection string copied correctly
- [ ] Password URL-encoded if it has special characters
- [ ] Database name added to connection string (`/game_reco`)
- [ ] MONGODB_URI updated in Render environment variables
- [ ] Service redeployed with "Clear build cache & deploy"
- [ ] Logs show successful MongoDB connection
- [ ] Health endpoint returns `"database": "connected"`

---

## 🐛 Troubleshooting

### Error: "authentication failed" or "bad auth"
**Solution**: 
- Double-check username and password
- Ensure special characters in password are URL-encoded
- Verify database user exists in Atlas

### Error: "getaddrinfo ENOTFOUND"
**Solution**:
- Check cluster DNS name is correct
- Verify internet connection
- Ensure cluster is not paused

### Error: "connection timeout"
**Solution**:
- Check Network Access settings in Atlas
- Ensure IP whitelist includes `0.0.0.0/0`
- Verify cluster is running (not paused)

### Still getting 503 on Render
**Solution**:
- Check Render logs for MongoDB connection errors
- Verify MONGODB_URI is set correctly in Render (not .env)
- Clear build cache and redeploy
- Wait 2-3 minutes after deployment

---

## 📊 Monitor Your Atlas Cluster

1. Go to https://cloud.mongodb.com/
2. Click **"Metrics"** tab
3. View:
   - Connections count
   - Operations per second
   - Storage usage
   - Query performance

FREE tier (M0) includes:
- 512 MB storage
- Shared RAM
- Perfect for development and small projects

---

## 🎉 You're All Set!

Once you've updated your MONGODB_URI with your Atlas connection string and redeployed, your application will work perfectly on Render!

The code requires **NO changes** - it's already optimized for MongoDB Atlas with production-ready connection options.

Just provide your connection string and you're good to go! 🚀
