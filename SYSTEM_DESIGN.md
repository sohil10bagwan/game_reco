# 🎮 Game Recommendation System - Complete System Design

## Overview

The Game Recommendation System is a full-stack web application that provides personalized PC game recommendations based on user hardware specifications. The system consists of a React frontend with a cyberpunk-inspired UI and a Node.js/Express backend with MongoDB database, featuring advanced recommendation algorithms, user authentication, and admin management tools.

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐
│   React Frontend│◄────────────────►│ Node.js Backend │
│   (Vite + SPA)  │                  │  (Express API)  │
└─────────────────┘                  └─────────────────┘
         │                                   │
         │                                   │
         ▼                                   ▼
┌─────────────────┐                  ┌─────────────────┐
│   Browser       │                  │   MongoDB       │
│   Local Storage │                  │   Database      │
└─────────────────┘                  └─────────────────┘
```

### Technology Stack

#### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Password Hashing**: bcryptjs
- **CORS**: cors middleware
- **Environment**: dotenv

#### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Context
- **Icons**: Heroicons

## 📁 Project Structure

### Backend Structure
```
backend/
├── server.js                 # Application entry point
├── src/
│   ├── app.js               # Express app configuration
│   ├── config/
│   │   └── Db.js           # MongoDB connection
│   ├── models/             # Mongoose schemas
│   │   ├── User.js
│   │   ├── Game.js
│   │   ├── Recommendationlog.js
│   │   ├── sliderModel.js
│   │   ├── DeviceSearchCache.js
│   │   ├── ExternalGameSource.js
│   │   └── ...
│   ├── controllers/        # Request handlers
│   │   ├── Authcontroller.js
│   │   ├── Gamecontroller.js
│   │   ├── Recommendationcontroller.js
│   │   ├── sliderController.js
│   │   ├── ExternalGamesController.js
│   │   └── Librarycontroller.js
│   ├── routes/             # API route definitions
│   │   ├── Authroutes.js
│   │   ├── Gameroutes.js
│   │   ├── Recommendationroutes.js
│   │   ├── sliderRoutes.js
│   │   ├── ExternalGamesRoutes.js
│   │   └── Libraryroutes.js
│   ├── services/           # Business logic services
│   │   ├── Recommendationservice.js
│   │   ├── CacheService.js
│   │   ├── ExternalGameService.js
│   │   ├── SpecAnalyzerService.js
│   │   └── AIGameDiscoveryService.js
│   ├── middleware/         # Custom middleware
│   │   ├── Authmiddleware.js
│   │   ├── validationMiddleware.js
│   │   └── errorMiddleware.js
│   └── utils/
│       └── Comparehardware.js
├── package.json
└── README files
```

### Frontend Structure
```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── Gamecard.jsx
│   │   ├── Gameslider.jsx
│   │   ├── Hardwareform.jsx
│   │   ├── PasswordField.jsx
│   │   ├── RouteSkeleton.jsx
│   │   └── Slidercard.jsx
│   ├── pages/              # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Recommend.jsx
│   │   ├── Games.jsx
│   │   ├── Profile.jsx
│   │   ├── Library.jsx
│   │   ├── Adminpanel.jsx
│   │   ├── EditSlider.jsx
│   │   └── Gamedetail.jsx
│   ├── context/            # React Context providers
│   │   ├── Authcontext.jsx
│   │   └── CollectionContext.jsx
│   ├── hooks/              # Custom React hooks
│   │   ├── index.js
│   │   └── useDebounce.js
│   ├── routes/             # Route protection components
│   │   └── AccessGate.jsx
│   ├── services/           # API service layer
│   │   └── api.js
│   ├── utils/              # Utility functions
│   │   └── router.js
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # React entry point
│   ├── App.css
│   └── index.css
├── package.json
└── Configuration files
```

## 🔄 System Flow

### User Journey

1. **Landing**: User visits homepage with game sliders and features
2. **Authentication**: User registers/logs in (optional for recommendations)
3. **Hardware Input**: User enters PC specifications (RAM, CPU, GPU, Storage)
4. **Recommendation**: System analyzes specs and returns compatible games
5. **Game Details**: User can view detailed game information
6. **Library Management**: Authenticated users can bookmark/favorite games
7. **Admin Panel**: Admins can manage games, sliders, and view analytics

### Request Flow (Backend)

```
Client Request
     │
     ▼
Express App (app.js)
├── CORS & Body Parsing
├── Health Check Routes
└── API Route Mounting
     │
     ▼
Route Handler (/api/*)
     │
     ▼
Middleware Stack
├── Authentication (protect/optionalAuth)
├── Authorization (adminOnly)
└── Validation (express-validator)
     │
     ▼
Controller
├── Input Validation
├── Business Logic
└── Service Calls
     │
     ▼
Service Layer
├── Recommendation Engine
├── Cache Management
├── External API Integration
└── Data Processing
     │
     ▼
Database Layer (Mongoose)
├── Schema Validation
├── CRUD Operations
└── Data Persistence
     │
     ▼
Response Formatting
     │
     ▼
JSON Response → Client
```

## 🎯 Core Features

### 1. Authentication & Authorization
- **JWT-based authentication** with 24-hour token expiry
- **Role-based access control** (user/admin)
- **Password hashing** with bcrypt (salt rounds: 10)
- **Protected routes** with middleware
- **Optional authentication** for recommendations

### 2. Game Recommendation Engine
- **Hardware-based scoring** (0-100 points per game)
- **Compatibility filtering** (must meet minimum requirements)
- **Multi-criteria analysis** (RAM, CPU, GPU, Storage)
- **Performance tier classification**
- **Caching system** for repeated queries
- **Recommendation logging** for analytics

### 3. Game Management
- **Full CRUD operations** for games
- **Advanced filtering** (genre, platform, search, sort)
- **Rich metadata** (developer, publisher, rating, etc.)
- **Image and trailer support**
- **Admin-only write operations**

### 4. User Library
- **Bookmark system** for saving games
- **Favorites functionality**
- **Personal game collections**
- **Cross-device synchronization**

### 5. Admin Panel
- **Game catalog management**
- **Slider/banner management**
- **User analytics**
- **System monitoring**
- **Cache management**

### 6. External Integrations
- **External game APIs** for data enrichment
- **AI-powered game discovery**
- **Cache invalidation and cleanup**
- **Performance monitoring**

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String (2-50 chars),
  email: String (unique, lowercase),
  password: String (hashed, min 6 chars),
  role: String (enum: 'user'|'admin', default: 'user'),
  library: {
    bookmarks: [ObjectId],
    favorites: [ObjectId]
  },
  timestamps: true
}
```

### Game Model
```javascript
{
  title: String (unique),
  genre: [String] (enum: Action, RPG, FPS, etc.),
  description: String (max 500 chars),
  imageUrl: String,
  minRam: Number (GB),
  minCpu: Number (GHz),
  minGpu: Number (GB VRAM),
  storage: Number (GB),
  platform: [String] (enum: PC, PlayStation, Xbox, etc.),
  year: Number,
  version: String,
  developer: String,
  publisher: String,
  rating: Number (0-10),
  addedBy: ObjectId (ref: User),
  timestamps: true
}
```

### RecommendationLog Model
```javascript
{
  userId: ObjectId (ref: User, nullable),
  userSpecs: {
    ram: Number,
    cpu: Number,
    gpu: Number,
    storage: Number
  },
  recommendedGames: [{
    gameId: ObjectId,
    title: String,
    matchScore: Number
  }],
  totalMatches: Number,
  performanceTier: String,
  fromCache: Boolean,
  externalApiUsed: Boolean,
  apiSources: [String],
  timestamps: true
}
```

### Slider Model
```javascript
{
  title: String,
  version: String,
  platform: [String],
  type: String (enum: steam, epic, gog, etc.),
  year: Number,
  description: String,
  imageUrl: String,
  accent: String (hex color),
  bg: String (CSS gradient),
  isActive: Boolean,
  order: Number,
  addedBy: ObjectId (ref: User),
  timestamps: true
}
```

### DeviceSearchCache Model
```javascript
{
  specHash: String (unique),
  userSpecs: Object,
  performanceTier: String,
  games: [Object],
  apiSources: [String],
  lastUpdated: Date,
  accessCount: Number,
  timestamps: true
}
```

## 🔧 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get user profile (protected)

### Games (`/api/games`)
- `GET /getAllGames` - List games with filtering
- `GET /getGame/:id` - Get specific game
- `POST /addGame` - Add new game (admin)
- `PUT /updateGame/:id` - Update game (admin)
- `DELETE /deleteGame/:id` - Delete game (admin)

### Recommendations (`/api/recommendations`)
- `POST /` - Get game recommendations

### Library (`/api/library`)
- `GET /` - Get user's library
- `POST /bookmark/:gameId` - Add/remove bookmark
- `POST /favorite/:gameId` - Add/remove favorite

### Sliders (`/api/slider`)
- `GET /getAllSliders` - List sliders
- `GET /getSlider/:id` - Get specific slider
- `POST /createSlider` - Create slider (admin)
- `PUT /updateSlider/:id` - Update slider (admin)
- `DELETE /deleteSlider/:id` - Delete slider (admin)

### External Games (`/api/external`)
- `GET /status` - Cache and API status
- `POST /fetch` - Fetch external games (admin)
- `POST /refresh-cache` - Refresh cache (admin)
- `POST /invalidate-cache` - Invalidate cache (admin)
- `POST /cleanup-cache` - Cleanup old cache (admin)
- `POST /ai-discovery` - AI game discovery (admin)

## ⚡ Recommendation Algorithm

### Hardware Scoring Formula
Each hardware component contributes maximum 25 points (total: 100):

```
ramScore = min((userRam / gameMinRam) * 25, 25)
cpuScore = min((userCpu / gameMinCpu) * 25, 25)
gpuScore = min((userGpu / gameMinGpu) * 25, 25)
storageScore = min((userStorage / gameMinStorage) * 25, 25)

matchScore = round(ramScore + cpuScore + gpuScore + storageScore)
```

### Compatibility Rules
- **Must meet minimum requirements** for all components
- **Incompatible games are filtered out**
- **Games sorted by matchScore descending**
- **Higher scores = better hardware overhead**

### Caching Strategy
- **Spec hashing** for cache keys
- **Performance tier analysis**
- **TTL-based expiration**
- **Access count tracking**
- **Automatic cleanup**

## 🎨 Frontend Design System

### Color Palette
- **Primary**: Neon Pink (`#ff006e`)
- **Secondary**: Neon Cyan (`#00f5ff`)
- **Tertiary**: Neon Purple (`#8338ec`)
- **Success**: Neon Green (`#06ffa5`)
- **Backgrounds**: Dark gradients (`#0a0a0f` to `#252530`)

### Typography
- **Display**: Orbitron (headings, UI elements)
- **Body**: Rajdhani (content, descriptions)

### Components
- **Responsive grid layouts**
- **Hover animations and transitions**
- **Loading states and skeletons**
- **Error boundaries and fallbacks**
- **Form validation feedback**

## 🔐 Security Measures

### Backend Security
- **JWT token validation**
- **Password hashing with bcrypt**
- **Input sanitization and validation**
- **CORS configuration**
- **Rate limiting** (recommended)
- **Helmet.js** for headers (recommended)

### Frontend Security
- **XSS prevention** with React
- **Secure API communication**
- **Token storage** in localStorage
- **Input validation**
- **Error boundary protection**

## 📊 Performance Optimizations

### Backend
- **Database indexing** on frequently queried fields
- **Caching layer** for recommendations
- **Async logging** for non-blocking operations
- **Connection pooling** with MongoDB
- **Gzip compression** (recommended)

### Frontend
- **Code splitting** with React.lazy
- **Image optimization** and lazy loading
- **Bundle analysis** and tree shaking
- **Service worker** for caching (recommended)
- **CDN integration** (recommended)

## 🚀 Deployment Architecture

### Development
```
Local Development
├── Frontend: http://localhost:5173 (Vite dev server)
├── Backend: http://localhost:5000 (Express server)
└── Database: MongoDB local instance
```

### Production
```
Production Deployment
├── Frontend: Static hosting (Vercel/Netlify)
├── Backend: Cloud server (Heroku/Railway)
├── Database: MongoDB Atlas
└── CDN: Image and asset delivery
```

### Environment Variables
```env
# Backend
PORT=5000
MONGO_URI=mongodb://localhost:27017/game_reco
JWT_SECRET=your_super_secret_key
NODE_ENV=development
CLIENT_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com

# Frontend
VITE_API_URL=http://localhost:5000
```

## 🔄 Data Flow Patterns

### Recommendation Flow
1. User submits hardware specs
2. Specs validated and normalized
3. Cache checked for existing results
4. If cache miss:
   - Performance tier analyzed
   - External APIs queried (if enabled)
   - Games fetched from database
   - Hardware compatibility scored
   - Results cached for future use
5. Results logged (async)
6. Formatted response returned

### Authentication Flow
1. User credentials submitted
2. Password verified against hash
3. JWT token generated
4. Token returned to client
5. Client stores token in localStorage
6. Subsequent requests include token
7. Server validates token on protected routes

## 📈 Monitoring & Analytics

### Backend Monitoring
- **Request logging** with timestamps
- **Error tracking** and reporting
- **Performance metrics** (response times)
- **Database query monitoring**
- **Cache hit/miss ratios**

### Frontend Monitoring
- **User interaction tracking**
- **Error boundary reporting**
- **Performance monitoring**
- **API call success/failure rates**

## 🔧 Development Workflow

### Backend Development
```bash
cd backend
npm install
npm run dev  # With nodemon
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev  # Vite dev server
```

### Testing
```bash
# Backend tests (if implemented)
npm test

# Frontend tests (if implemented)
npm test
```

### Building for Production
```bash
# Backend
npm run build

# Frontend
npm run build
```

## 📚 API Documentation

### Request/Response Format
- **Content-Type**: `application/json`
- **Authentication**: `Bearer <token>` header
- **Error Format**: `{ success: false, message: string, code?: string }`
- **Success Format**: `{ success: true, data: object }`

### Error Codes
- `EMAIL_EXISTS` - Email already registered
- `INVALID_CREDENTIALS` - Wrong login credentials
- `NO_TOKEN` - Missing authentication token
- `TOKEN_EXPIRED` - JWT token expired
- `INVALID_TOKEN` - Malformed JWT token
- `INSUFFICIENT_PERMISSIONS` - Admin access required
- `GAME_NOT_FOUND` - Game ID not found
- `INVALID_SPEC_RANGE` - Hardware specs out of range

## 🔗 External Dependencies

### Backend Dependencies
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT handling
- `bcryptjs` - Password hashing
- `express-validator` - Input validation
- `cors` - Cross-origin requests
- `dotenv` - Environment variables

### Frontend Dependencies
- `react` - UI framework
- `react-router-dom` - Routing
- `axios` - HTTP client
- `tailwindcss` - CSS framework
- `@heroicons/react` - Icon library

## 🚀 Future Enhancements

### Planned Features
- **Real-time notifications**
- **Social features** (reviews, ratings)
- **Advanced filtering** (price, release date)
- **Mobile app** (React Native)
- **Multi-language support**
- **Dark/light theme toggle**
- **Advanced analytics dashboard**

### Technical Improvements
- **GraphQL API** migration
- **Redis caching** layer
- **Microservices architecture**
- **Container orchestration** (Docker/K8s)
- **CI/CD pipelines**
- **Automated testing suite**

---

## 📞 Support & Maintenance

### System Health Checks
- `/health` endpoint for backend status
- Database connection monitoring
- Cache performance tracking
- Error rate monitoring

### Backup Strategy
- **Database backups** (MongoDB Atlas automated)
- **Code repository** (Git)
- **Configuration backups**
- **Asset backups**

### Scaling Considerations
- **Horizontal scaling** for backend
- **Database sharding** for large datasets
- **CDN integration** for assets
- **Load balancing** for high traffic

This system design provides a comprehensive overview of the Game Recommendation System architecture, from high-level concepts to implementation details. The modular design allows for easy maintenance, scaling, and future enhancements.