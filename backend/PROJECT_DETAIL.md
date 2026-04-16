# 🎮 Game Recommender — Full Project Detail

## What is it?
A production-grade REST API backend for a **PC Game Recommendation System**.
Users input their PC hardware specs (RAM, CPU, GPU, Storage) and the system recommends
compatible games from the database, scored by how well the hardware matches each game's
minimum requirements.

---

## Tech Stack

| Tech | Role |
|------|------|
| Node.js + Express | HTTP server & routing |
| MongoDB + Mongoose | Database & ODM |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |
| express-validator | Input validation |
| dotenv | Environment config |

---

## Features

### 1. Authentication System
- Register / Login with JWT (1-day expiry)
- Password hashed with bcrypt (salt 10)
- Role-based access: `user` and `admin`
- Protected routes via `protect` middleware
- Optional auth (token if present, no block if absent)

### 2. Game Management (Admin only for write)
- Full CRUD: Add, Get All, Get by ID, Update, Delete
- Filter by genre, platform, search by title
- Sort by createdAt, title, rating, year
- Genres: Action, RPG, FPS, Horror, Indie, etc.
- Platforms: PC, PlayStation, Xbox, Nintendo, Mobile

### 3. Recommendation Engine (Core Feature)
- User submits hardware specs → gets back compatible games sorted by match score
- Each game scored 0–100 based on hardware overhead ratio
- Logs every recommendation to DB (async, non-blocking)
- Works for both guests and logged-in users

### 4. Slider/Banner Management (Admin only for write)
- Homepage slider/banner items with image, accent color, gradient background
- Supports ordering, platform filter, type (Steam, Epic, GOG, etc.)
- isActive flag to show/hide slides

---

## File Structure

```
game-reco-backend/
│
├── server.js                       ← Entry point: starts server, connects DB
│
├── src/
│   ├── app.js                      ← Express setup, CORS, route mounting
│   │
│   ├── config/
│   │   └── Db.js                   ← MongoDB connection via Mongoose
│   │
│   ├── models/                     ← MongoDB schemas
│   │   ├── User.js                 ← name, email, password (hashed), role
│   │   ├── Game.js                 ← title, genre, minRam/Cpu/Gpu, storage, platform, rating
│   │   ├── Recommendationlog.js    ← userId, userSpecs, recommendedGames[], totalMatches
│   │   └── sliderModel.js          ← title, imageUrl, accent, bg, isActive, order
│   │
│   ├── controllers/                ← Request/response logic
│   │   ├── Authcontroller.js       ← register, login, getProfile
│   │   ├── Gamecontroller.js       ← addGame, getAllGames, getGameById, updateGame, deleteGame
│   │   ├── Recommendationcontroller.js  ← recommend
│   │   └── sliderController.js     ← createSlider, getAllSliders, getSliderById, updateSlider, deleteSlider
│   │
│   ├── routes/                     ← URL path definitions
│   │   ├── Authroutes.js           ← /api/auth/*
│   │   ├── Gameroutes.js           ← /api/games/*
│   │   ├── Recommendationroutes.js ← /api/recommendations
│   │   └── sliderRoutes.js         ← /api/slider/*
│   │
│   ├── services/
│   │   └── Recommendationservice.js ← Core engine: fetch all games → score → sort → log
│   │
│   ├── middleware/
│   │   ├── Authmiddleware.js       ← protect, adminOnly, optionalAuth
│   │   ├── validationMiddleware.js ← express-validator rules
│   │   └── errorMiddleware.js      ← global error handler + 404
│   │
│   └── utils/
│       └── Comparehardware.js      ← Hardware scoring algorithm
│
├── .env                            ← PORT, MONGO_URI, JWT_SECRET, NODE_ENV
├── .env.example                    ← Environment variable template
├── package.json
└── PROJECT_DETAIL.md               ← This file
```

---

## Workflow / Request Flow

```
Client Request
     │
     ▼
app.js (CORS + body parser)
     │
     ▼
Route File  (/api/auth | /api/games | /api/recommendations | /api/slider)
     │
     ▼
Middleware (protect → adminOnly → optionalAuth)  [if required]
     │
     ▼
Controller  (validates input, calls service/model)
     │
     ├──► Service (Recommendation engine only)
     │         │
     │         ▼
     │    Utils/compareHardware.js  (scores each game 0-100)
     │         │
     │         ▼
     │    RecommendationLog.create() [async, fire & forget]
     │
     ▼
Model (Mongoose → MongoDB)
     │
     ▼
JSON Response → Client
```

---

## Recommendation Engine Flow (Core Logic)

```
POST /api/recommendations
  { ram: 16, cpu: 3.5, gpu: 8, storage: 500 }
         │
         ▼
  Validate spec ranges
         │
         ▼
  Fetch ALL games from MongoDB
         │
         ▼
  For each game → compareHardware()
    ├── ram >= minRam?      → ramScore     (0–25)
    ├── cpu >= minCpu?      → cpuScore     (0–25)
    ├── gpu >= minGpu?      → gpuScore     (0–25)
    └── storage >= storage? → storageScore (0–25)
         │
         ▼
  isCompatible = all 4 conditions met
  matchScore   = sum of 4 scores (max 100)
         │
         ▼
  Filter incompatible games out
         │
         ▼
  Sort by matchScore DESC (best match first)
         │
         ▼
  Log to RecommendationLog (async)
         │
         ▼
  Return { games[], totalMatches, userSpecs }
```

---

## Hardware Scoring Formula

Each hardware component contributes max 25 points:

```
ramScore     = min((userRam     / gameMinRam)     * 25, 25)
cpuScore     = min((userCpu     / gameMinCpu)     * 25, 25)
gpuScore     = min((userGpu     / gameMinGpu)     * 25, 25)
storageScore = min((userStorage / gameStorage)    * 25, 25)

matchScore   = round(ramScore + cpuScore + gpuScore + storageScore)  → max 100
```

If any single component does NOT meet the minimum → isCompatible = false → game excluded.

---

## API Endpoints

### Auth  `/api/auth`

| Method | Route | Access | Body / Notes |
|--------|-------|--------|--------------|
| POST | `/register` | Public | `{ name, email, password }` |
| POST | `/login` | Public | `{ email, password }` → returns JWT |
| GET | `/profile` | Private | Header: `Authorization: Bearer <token>` |

### Games  `/api/games`

| Method | Route | Access | Notes |
|--------|-------|--------|-------|
| GET | `/getAllGames` | Public | Query: `?genre=&platform=&search=&sortBy=&order=` |
| GET | `/getGame/:id` | Public | Single game by MongoDB ID |
| POST | `/addGame` | Admin | Add new game |
| PUT | `/updateGame/:id` | Admin | Update game |
| DELETE | `/deleteGame/:id` | Admin | Delete game |

### Recommendations  `/api/recommendations`

| Method | Route | Access | Body |
|--------|-------|--------|------|
| POST | `/` | Public* | `{ ram, cpu, gpu, storage }` |

*optionally authenticated — logs userId if JWT token is provided

### Slider  `/api/slider`

| Method | Route | Access | Notes |
|--------|-------|--------|-------|
| GET | `/getAllSliders` | Public | Query: `?platform=&type=&search=&sortBy=&order=` |
| GET | `/getSlider/:id` | Public | Single slider by ID |
| POST | `/createSlider` | Admin | Create slider/banner |
| PUT | `/updateSlider/:id` | Admin | Update slider |
| DELETE | `/deleteSlider/:id` | Admin | Delete slider |

---

## Data Models

### User
```
name        String   (2–50 chars)
email       String   (unique, lowercase)
password    String   (hashed, min 6 chars, hidden by default)
role        String   (enum: user | admin, default: user)
timestamps
```

### Game
```
title       String   (unique)
genre       [String] (enum: Action | RPG | Strategy | Sports | Simulation |
                            Horror | Adventure | FPS | Puzzle | Racing |
                            Fighting | MMO | Indie)
description String   (max 500 chars)
imageUrl    String
minRam      Number   (GB)
minCpu      Number   (GHz)
minGpu      Number   (GB VRAM)
storage     Number   (GB)
platform    [String] (enum: PC | PlayStation | Xbox | Nintendo | Mobile)
Years       Number
version     String
developer   String
publisher   String
rating      Number   (0–10)
addedBy     ObjectId → ref: User
timestamps
```

### RecommendationLog
```
userId            ObjectId → ref: User  (nullable, for guests)
userSpecs         { ram, cpu, gpu, storage, imageUrl }
recommendedGames  [{ gameId, title, matchScore }]
totalMatches      Number
timestamps
```

### Slider
```
title       String
version     String
platform    [String]  (lowercase)
type        String    (lowercase: p2p | steam | epic | origin | gog | other)
year        Number    (1970–2100)
description String    (max 500 chars)
imageUrl    String    (validated URL or empty)
accent      String    (hex color, default: #4fc3f7)
bg          String    (CSS gradient, default: dark blue gradient)
isActive    Boolean   (default: true)
order       Number    (display order, default: 0)
addedBy     ObjectId → ref: User
timestamps
```

---

## Middleware

| Middleware | Purpose |
|------------|---------|
| `protect` | Verifies JWT, attaches `req.user`, blocks if invalid/expired |
| `adminOnly` | Blocks non-admin users with 403 |
| `optionalAuth` | Attaches user if token present, silently skips if not |
| `errorHandler` | Global error catcher, returns JSON error response |
| `notFound` | 404 handler for unmatched routes |
| `validationMiddleware` | express-validator rules for auth, games, recommendations |

---

## Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/game_recommender
JWT_SECRET=your_super_secret_key
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

---

## Setup & Run

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Development (auto-restart)
npm run dev

# Production
npm start
```

---

## Error Code Reference

| Code | Meaning |
|------|---------|
| `EMAIL_EXISTS` | Email already registered |
| `INVALID_CREDENTIALS` | Wrong email or password |
| `NO_TOKEN` | No JWT provided |
| `TOKEN_EXPIRED` | JWT has expired |
| `INVALID_TOKEN` | JWT is malformed |
| `USER_NOT_FOUND` | User ID from token not in DB |
| `ACCOUNT_INACTIVE` | User account is inactive |
| `INSUFFICIENT_PERMISSIONS` | Non-admin accessing admin route |
| `GAME_NOT_FOUND` | Game ID not found |
| `SLIDER_NOT_FOUND` | Slider ID not found |
| `INVALID_ID` | MongoDB ObjectId format invalid |
| `DUPLICATE_KEY` | Unique field already exists |
| `INVALID_SPEC_RANGE` | Hardware spec out of allowed range |
| `INTERNAL_ERROR` | Unhandled server error |
