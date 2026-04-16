# Game Recommendation Backend - Simplified Deployment Guide

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` with your MongoDB connection string
   - Update `JWT_SECRET` with a secure random string

3. **Start server:**
   ```bash
   npm start
   ```

4. **Test API:**
   - Health check: http://localhost:5000/health
   - API root: http://localhost:5000/

---

## 🌐 Deploy to Render

### Step 1: Prepare MongoDB Atlas

1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a FREE cluster (M0)
3. Create database user with username/password
4. Add IP whitelist: `0.0.0.0/0` (allow from anywhere)
5. Get connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/game_reco?retryWrites=true&w=majority
   ```

### Step 2: Connect GitHub to Render

1. Go to https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: game-reco-backend
   - **Branch**: main
   - **Root Directory**: (leave blank)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### Step 3: Add Environment Variables

In Render dashboard → Your Service → Environment tab, add:

```
MONGODB_URI=mongodb+srv://khans037978_db_user:mCS9C7toyWVx0zGY@gamereco1.ckdq3de.mongodb.net/game_reco?appName=gamereco1
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
RAWG_API_KEY=e8e7d68c3dbc44d4a95a58c97419ac8d
ALLOWED_ORIGINS=https://game-reco-frontend.vercel.app
NODE_ENV=production
PORT=5000
```

### Step 4: Deploy

1. Click "Create Web Service"
2. Wait for deployment (2-3 minutes)
3. Check logs for:
   ```
   ✅ MongoDB Connected
   🚀 Server running on port 5000
   ```

### Step 5: Test Deployment

Visit: `https://your-app-name.onrender.com/health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-04-04T..."
}
```

---

## 📁 Project Structure

```
game-reco-backend/
├── src/
│   ├── config/
│   │   └── Db.js              # Database connection
│   ├── controllers/           # Request handlers
│   ├── middleware/            # Auth & error handling
│   ├── models/                # Mongoose schemas
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   └── app.js                 # Express app setup
├── .env                       # Environment variables (local only)
├── .env.example               # Template for env vars
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies & scripts
└── server.js                  # Entry point
```

---

## 🔧 Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT tokens | Random string |
| `JWT_EXPIRES_IN` | Token expiration time | `24h` |
| `RAWG_API_KEY` | RAWG games API key | Your API key |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `ALLOWED_ORIGINS` | CORS allowed origins | Comma-separated URLs |

---

## 🛠️ Available Scripts

```bash
npm start              # Start production server
npm test               # Run tests
npm run test-connection # Test database connection
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Games
- `GET /api/games` - Get all games
- `GET /api/games/:id` - Get single game
- `POST /api/games` - Add game (admin)
- `PUT /api/games/:id` - Update game (admin)
- `DELETE /api/games/:id` - Delete game (admin)

### Recommendations
- `POST /api/recommendations` - Get game recommendations

### Sliders
- `GET /api/slider/getAllSliders` - Get all sliders

### External Games
- `POST /api/external/fetch-external` - Fetch from external APIs (admin)

---

## 🐛 Troubleshooting

### 503 Service Unavailable on Render

**Cause**: Service crashed or MONGODB_URI not set

**Fix**:
1. Check Render logs for errors
2. Verify MONGODB_URI is set in Environment tab
3. Redeploy with "Clear build cache & deploy"

### MongoDB Connection Error

**Cause**: Invalid connection string or credentials

**Fix**:
1. Verify MONGODB_URI is correct
2. Check username/password in Atlas
3. Ensure Network Access allows your IP

### CORS Errors

**Cause**: Frontend origin not allowed

**Fix**:
Add your frontend URL to `ALLOWED_ORIGINS` in environment variables:
```
ALLOWED_ORIGINS=https://your-frontend.com,http://localhost:3000
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` to Git** - Already in `.gitignore`
2. **Use strong JWT_SECRET** - Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
3. **Set NODE_ENV=production** on Render
4. **Use environment variables** for all secrets
5. **Enable HTTPS** - Automatic on Render

---

## 📊 Monitoring

### Check Logs
- Render Dashboard → Your Service → Logs tab

### Health Check
```bash
curl https://your-app.onrender.com/health
```

### Database Status
Check MongoDB Atlas dashboard for:
- Connections count
- Storage usage
- Query performance

---

## 🎯 Key Features

✅ Simplified codebase - Easy to maintain  
✅ Production-ready configuration  
✅ Works locally and on Render  
✅ MongoDB Atlas support  
✅ CORS configured  
✅ Error handling  
✅ Health check endpoint  
✅ Clean project structure  

---

## 📞 Support

For issues:
1. Check Render logs
2. Verify environment variables
3. Test MongoDB connection
4. Review error messages

Happy deploying! 🚀
