# 🚀 Quick Setup Guide - Game Recommendation Backend

## Prerequisites

- Node.js v16+ installed
- MongoDB Atlas account or local MongoDB installation
- API keys for external services (optional but recommended)

---

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Core: express, mongoose, dotenv, cors
- Authentication: jsonwebtoken, bcryptjs
- External APIs: node-fetch, node-cron
- Validation: express-validator

---

## Step 2: Configure Environment Variables

```bash
cp .env.example .env
```

Edit the `.env` file with your credentials:

### Required (Core)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/game_recommendation_db
JWT_SECRET=your_super_secret_jwt_key_here
PORT=3000
NODE_ENV=development
```

### Optional (External APIs)
```env
# Get from https://rawg.io/apidoc
RAWG_API_KEY=your_rawg_api_key_here

# Get from https://api-docs.igdb.com/
IGDB_CLIENT_ID=your_igdb_client_id_here
IGDB_CLIENT_SECRET=your_igdb_client_secret_here

# Get from https://steamcommunity.com/dev/apikey
STEAM_API_KEY=your_steam_api_key_here
```

### Optional (Cache & AI)
```env
# Cache duration in hours (default: 24)
CACHE_TTL_HOURS=24

# Enable/disable AI discovery (default: true)
ENABLE_AI_DISCOVERY=true

# Cron schedule for AI discovery (default: daily at 2 AM UTC)
CRON_SCHEDULE=0 2 * * *
```

---

## Step 3: Set Up Database

### Option A: MongoDB Atlas (Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`

### Option B: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Update `MONGODB_URI` in `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/game_recommendation_db
   ```

---

## Step 4: Run the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Server should start on `http://localhost:3000`

---

## Step 5: Test the API

### Health Check
```bash
curl http://localhost:3000/api/games
```

### Get Recommendations
```bash
curl -X POST http://localhost:3000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"ram":16,"cpu":3.5,"gpu":8,"storage":500}'
```

---

## Step 6: Create Admin User (Optional)

To access admin endpoints, you need to create an admin user:

### Using Postman/cURL

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "securepassword123"
  }'
```

Then manually update the user's role in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

---

## Step 7: Fetch Games from External APIs (Optional)

Once you have an admin token:

```bash
curl -X POST http://localhost:3000/api/external-games/fetch-external \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"performanceTier":"Medium","useAllApis":true}'
```

This will fetch games from configured external APIs and populate your database.

---

## Common Issues & Solutions

### Issue: MongoDB connection error
**Solution**: Check your `MONGODB_URI` is correct and MongoDB is running

### Issue: Port already in use
**Solution**: Change `PORT` in `.env` or kill the process using port 3000

### Issue: External APIs not working
**Solution**: Verify API keys are correct and check rate limits

### Issue: AI Discovery not starting
**Solution**: Ensure `ENABLE_AI_DISCOVERY=true` in `.env`

---

## Next Steps

1. **Populate Database**: Use external API endpoints to fetch games
2. **Test Caching**: Make multiple recommendation requests with same specs
3. **Monitor Cache**: Use `/api/external-games/cache-status` endpoint
4. **Configure AI**: Adjust cron schedule based on your needs

---

## API Documentation

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## Support

If you encounter any issues:
1. Check the logs in the terminal
2. Verify all environment variables are set correctly
3. Ensure MongoDB connection is working
4. Check that all dependencies are installed

Happy coding! 🎮
