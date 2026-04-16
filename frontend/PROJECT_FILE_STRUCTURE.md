# Game Reco Frontend - Complete File Structure

## 📁 Project Overview
**Game Recommendation Platform** - A responsive React SPA that delivers personalized PC game recommendations based on user hardware specs and genre preferences.

---

## 🗂️ Complete Directory Structure

```
game-reco-frontend/
│
├── 📂 .qoder/                          # Qoder IDE configuration
│   ├── agents/                         # AI agent configurations
│   └── skills/                         # Custom skill definitions
│
├── 📂 public/                          # Static assets served at root
│   └── vite.svg                        # Vite logo / favicon
│
├── 📂 src/                             # Source code directory
│   │
│   ├── 📂 assets/                      # Static assets imported in JS
│   │   └── react.svg                   # React logo asset
│   │
│   ├── 📂 components/                  # Reusable UI components
│   │   ├── Gamecard.jsx                # Individual game display card
│   │   ├── Gameslider.jsx              # Horizontal game carousel/slider
│   │   ├── Hardwareform.jsx            # PC hardware specification form
│   │   ├── Navbar.jsx                  # Navigation bar component
│   │   ├── ProtectedRoute.jsx          # Route protection wrapper for auth
│   │   └── Slidercard.jsx              # Card component for slider items
│   │
│   ├── 📂 context/                     # React Context API providers
│   │   └── Authcontext.jsx             # Authentication state management
│   │
│   ├── 📂 hooks/                       # Custom React hooks
│   │   ├── index.js                    # Hook exports barrel file
│   │   └── useDebounce.js              # Debounce hook for search inputs
│   │
│   ├── 📂 pages/                       # Page-level components (routes)
│   │   ├── AdminPanel.css              # Admin panel styles
│   │   ├── Adminpanel.jsx              # Admin dashboard for CRUD operations
│   │   ├── Dashboard.jsx               # User dashboard with game browsing
│   │   ├── EditSlider.css              # Slider editor styles
│   │   ├── EditSlider.jsx              # Admin slider management page
│   │   ├── Gamedetail.css              # Game detail page styles
│   │   ├── Gamedetail.jsx              # Individual game details view
│   │   ├── Games.jsx                   # Games listing page
│   │   ├── Home.jsx                    # Landing/home page
│   │   ├── Login.jsx                   # User login page
│   │   ├── Profile.jsx                 # User profile management
│   │   ├── Recommend.jsx               # Game recommendation results page
│   │   └── Register.jsx                # User registration page
│   │
│   ├── 📂 services/                    # API and external service calls
│   │   └── api.js                      # Axios API client configuration
│   │
│   ├── App.jsx                         # Main application component & routing
│   ├── main.jsx                        # Application entry point
│   ├── index.css                       # Global styles & Tailwind imports
│   └── App.css                         # App-specific styles
│
├── 📂 dist/                            # Production build output (generated)
│   ├── assets/                         # Bundled JS and CSS files
│   ├── index.html                      # Built HTML file
│   └── vite.svg                        # Copied public asset
│
├── 📄 .env.example                     # Environment variables template
├── 📄 .gitignore                       # Git ignore rules
├── 📄 eslint.config.js                 # ESLint configuration
├── 📄 index.html                       # HTML entry point (dev)
├── 📄 package.json                     # Project dependencies & scripts
├── 📄 package-lock.json                # Locked dependency versions
├── 📄 postcss.config.js                # PostCSS configuration
├── 📄 tailwind.config.js               # Tailwind CSS configuration
├── 📄 vite.config.js                   # Vite build configuration
├── 📄 setup.sh                         # Setup script for Linux/Mac
│
├── 📄 README.md                        # Project documentation
├── 📄 API_DOCUMENTATION.md             # API reference guide
├── 📄 ENHANCEMENTS_SUMMARY.md          # Feature enhancements log
├── 📄 FILE_STRUCTURE.md                # This file
├── 📄 PROJECT_SUMMARY.md               # Project overview summary
└── 📄 SETUP_GUIDE.md                   # Development setup instructions
```

---

## 📊 File Statistics

### By Category:

| Category | Count | Description |
|----------|-------|-------------|
| **React Components** | 17 | `.jsx` files (6 components + 11 pages) |
| **Stylesheets** | 4 | `.css` files (3 page-specific + 1 global) |
| **Configuration** | 6 | Build tools, linters, CSS frameworks |
| **Documentation** | 6 | Markdown documentation files |
| **Utilities** | 3 | Hooks, services, entry point |
| **Build Output** | 3 | `dist/` directory contents |

### Total Files: ~45 files
### Total Directories: 12 directories

---

## 🔑 Key Files Explained

### Core Application Files

#### `App.jsx` (Root Level)
- **Location**: `/App.jsx`
- **Purpose**: Main application component with React Router v6 configuration
- **Key Features**:
  - Defines all application routes
  - Wraps routes with `AuthProvider` for authentication context
  - Includes `Navbar` on all pages
  - Implements 404 catch-all route
- **Dependencies**: React Router v6, AuthContext, all page components

#### `main.jsx`
- **Location**: `/src/main.jsx`
- **Purpose**: Application entry point
- **Key Features**:
  - Renders App component into DOM
  - Provides Toast notifications via `react-hot-toast`
  - Enables StrictMode for development

#### `index.html`
- **Location**: `/index.html`
- **Purpose**: HTML template for Vite
- **Key Features**:
  - Entry point for browser
  - Links to `main.jsx` as module
  - Contains root div for React mounting

---

### Routing Structure

#### Protected Routes (Require Authentication)
- `/dashboard` - User dashboard
- `/profile` - User profile
- `/recommend` - Game recommendations

#### Admin-Only Routes
- `/adminpanel` - Admin CRUD operations
- `/admin/edit-slider` - Slider management

#### Public Routes
- `/` - Home page
- `/login` - Login
- `/register` - Registration
- `/games` - Browse games
- `/games/getGame/:id` - Game details

---

### Component Architecture

#### UI Components (`/src/components/`)

1. **Gamecard.jsx**
   - Displays individual game information
   - Shows cover art, title, rating, platform
   - Click navigation to game details

2. **Gameslider.jsx**
   - Horizontal scrolling carousel
   - Used for featured/trending games
   - Responsive width handling

3. **Hardwareform.jsx**
   - Collects user PC specifications
   - RAM, CPU, GPU, storage inputs
   - Used for recommendation engine

4. **Navbar.jsx**
   - Sticky navigation header
   - Responsive mobile/desktop layouts
   - Auth-aware (shows different links based on login state)
   - Admin menu items conditional rendering

5. **ProtectedRoute.jsx**
   - Higher-order component for route protection
   - Checks authentication status
   - Redirects to login if not authenticated
   - Handles admin-only route access

6. **Slidercard.jsx**
   - Individual card within sliders
   - Optimized for horizontal layout
   - Hover effects and animations

---

### State Management

#### Context API (`/src/context/Authcontext.jsx`)
- **Provider**: `AuthProvider`
- **State Managed**:
  - `user` - Current user object (from localStorage)
  - `loading` - Async operation status
  - `error` - Error messages
  - `isAuthenticated` - Boolean auth flag
  - `isAdmin` - Role-based access flag
- **Methods**:
  - `login(email, password)` - User authentication
  - `register(name, email, password)` - User registration
  - `logout()` - Clear auth state
  - `setError(msg)` - Manual error setting

---

### Custom Hooks (`/src/hooks/`)

1. **useDebounce.js**
   - Delays value updates for performance
   - Used in search functionality
   - Prevents excessive API calls
   - Configurable delay (default: 300ms)

2. **index.js**
   - Barrel export file
   - Centralizes hook exports

---

### API Services (`/src/services/api.js`)
- **Axios Instance Configuration**
- **Base URL**: From `VITE_API_URL` environment variable
- **Endpoints**:
  - `authAPI` - Login, register
  - `gamesAPI` - CRUD operations for games
  - `recommendationAPI` - Get game recommendations
  - `sliderAPI` - Manage homepage sliders
- **Interceptors**: Token injection, error handling

---

### Pages Breakdown (`/src/pages/`)

#### User-Facing Pages

1. **Home.jsx**
   - Landing page with hero section
   - Feature highlights
   - Call-to-action buttons
   - Auth-aware content

2. **Dashboard.jsx**
   - Main game browsing interface
   - Search and filter functionality
   - Genre/platform filtering
   - Game cards grid layout

3. **Games.jsx**
   - Comprehensive games listing
   - Category sections (trending, top-rated, etc.)
   - Preview and full-view modes

4. **Gamedetail.jsx**
   - Detailed game information
   - System requirements
   - Screenshots carousel
   - Add to library/recommend actions

5. **Recommend.jsx**
   - Hardware input form
   - Genre preference selection
   - Results display with match scores
   - Compatibility indicators

6. **Profile.jsx**
   - User information display
   - Edit profile capabilities
   - View owned games
   - Account settings

7. **Login.jsx**
   - Email/password form
   - Form validation
   - Error handling
   - Navigate to dashboard on success

8. **Register.jsx**
   - New user registration
   - Name, email, password fields
   - Validation and error handling
   - Auto-login after registration

#### Admin Pages

9. **Adminpanel.jsx**
   - Admin dashboard
   - Game management (CRUD)
   - User management
   - Analytics overview

10. **EditSlider.jsx**
    - Homepage slider configuration
    - Add/remove games from sliders
    - Reorder slider items
    - Preview changes

---

## 🎨 Styling Architecture

### CSS Strategy

1. **Global Styles** (`index.css`)
   - Tailwind directives (`@tailwind base/components/utilities`)
   - Custom animations (`fadeIn`, `spin`)
   - Base resets

2. **Component-Specific Styles**
   - Inline Tailwind classes (majority)
   - Some pages have separate `.css` files for complex layouts

3. **Tailwind Configuration** (`tailwind.config.js`)
   - Custom color palette (cyberpunk theme)
   - Extended spacing/sizing scales
   - Custom font families

---

## ⚙️ Build Configuration

### Vite Configuration (`vite.config.js`)
```javascript
{
  plugins: [react()],
  resolve: {
    extensions: ['.jsx', '.js', '.json']  // Auto-resolve extensions
  },
  server: {
    port: 5173  // Dev server port
  }
}
```

### Build Process
1. **Development**: `npm run dev` → Vite dev server (HMR enabled)
2. **Production**: `npm run build` → Rollup bundling → `/dist` folder
3. **Preview**: `npm run preview` → Local production preview

### Module Resolution
- **Explicit Extensions**: All imports use `.jsx` extension
- **Relative Paths**: `./src/...` from root `App.jsx`
- **Auto-resolution**: Vite configured to resolve `.jsx`, `.js`, `.json`

---

## 🔐 Environment Variables

### `.env.example` Template
```
VITE_API_URL=http://localhost:3000/api
```

**Usage**:
- Renamed to `.env` or `.env.local` for development
- Injected via `import.meta.env.VITE_API_URL`
- Required for API connectivity

---

## 📦 Dependencies (package.json)

### Production Dependencies
- `react` ^18.2.0 - UI framework
- `react-dom` ^18.3.1 - React DOM renderer
- `react-router-dom` ^6.30.3 - Client-side routing
- `axios` ^1.13.5 - HTTP client
- `react-hot-toast` ^2.6.0 - Toast notifications

### Development Dependencies
- `vite` ^5.0.8 - Build tool
- `@vitejs/plugin-react` ^4.2.1 - React plugin for Vite
- `tailwindcss` ^3.4.0 - Utility-first CSS
- `autoprefixer` ^10.4.16 - CSS vendor prefixes
- `postcss` ^8.4.32 - CSS processing

---

## 🚀 Deployment Structure

### Production Build (`/dist/`)
```
dist/
├── index.html              # Minified HTML
├── vite.svg                # Favicon
└── assets/
    ├── index-[hash].css    # Bundled styles (63.52 KB)
    └── index-[hash].js     # Bundled scripts (294.19 KB)
```

**Deployment Target**: Render.com (or any static host)
**Build Command**: `npm run build`
**Publish Directory**: `dist/`

---

## 🔄 Data Flow

### Authentication Flow
```
User Input → AuthContext.login() → API Call → 
Store Token (localStorage) → Update User State → 
ProtectedRoute Check → Navigate to Dashboard
```

### Recommendation Flow
```
HardwareForm Input → RecommendationAPI → 
Backend Scoring → Results Array → 
Sorted Display → GameCard Components
```

### Game Browsing Flow
```
Dashboard Load → GamesAPI.getAll() → 
Filter/Search Applied → State Update → 
GameCard Grid Render → Click Navigation → GameDetail
```

---

## 📝 Code Organization Principles

### Separation of Concerns
- **Components**: Pure UI, reusable, no business logic
- **Pages**: Route-level, data fetching, state management
- **Context**: Global state (auth)
- **Hooks**: Reusable logic extraction
- **Services**: API communication layer

### Naming Conventions
- **Components**: PascalCase (e.g., `Gamecard.jsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useDebounce`)
- **Context**: PascalCase with `Context` suffix
- **CSS**: Matching page/component name with `.css` extension

---

## 🎯 Key Architectural Decisions

1. **App.jsx in Root** (non-standard but valid)
   - Allows cleaner `public/` folder separation
   - Requires explicit `./src/` import paths

2. **Explicit .jsx Extensions**
   - Ensures reliable Vite/Rollup builds
   - Prevents module resolution errors

3. **Context over Redux**
   - Simpler state for auth-only global state
   - No need for complex state management

4. **Tailwind-First Styling**
   - Utility classes inline
   - Minimal custom CSS files
   - Rapid UI development

5. **Page-Based Routing**
   - One component per route
   - Easy to understand and maintain
   - Scalable structure

---

## 🛠️ Development Workflow

### Getting Started
1. Clone repository
2. `npm install` - Install dependencies
3. Create `.env` from `.env.example`
4. `npm run dev` - Start development server

### Making Changes
1. Add new component → `/src/components/NewComponent.jsx`
2. Add new page → `/src/pages/NewPage.jsx`
3. Add route → Update `App.jsx` Routes array
4. Add API endpoint → Extend `/src/services/api.js`

### Testing Locally
1. `npm run dev` - Development with HMR
2. `npm run build` - Test production build
3. `npm run preview` - Preview production build

---

## 📈 Future Enhancements

### Potential Additions
- `/src/store/` - Redux Toolkit (if state complexity grows)
- `/src/utils/` - Helper functions
- `/src/constants/` - App constants
- `/__tests__/` - Unit and integration tests
- `/src/types/` - TypeScript definitions (if migrating to TS)

---

**Last Updated**: March 30, 2026  
**Project Version**: 1.0.0  
**Framework**: React 18 + Vite 5.0.8
