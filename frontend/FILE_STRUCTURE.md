# Game Reco Frontend - File Structure

```
game-reco-frontend/
│
├── 📄 package.json                 # Project dependencies and scripts
├── 📄 package-lock.json            # Locked dependency versions
├── 📄 vite.config.js               # Vite build configuration
├── 📄 tailwind.config.js           # Tailwind CSS custom theme
├── 📄 postcss.config.js            # PostCSS configuration
├── 📄 .gitignore                   # Git ignore rules
├── 📄 .env.example                 # Environment variables template
├── 🔧 setup.sh                     # Quick setup script (executable)
│
├── 📚 README.md                    # Main documentation
├── 📚 SETUP_GUIDE.md               # Detailed setup guide
├── 📚 API_DOCUMENTATION.md         # API specifications
├── 📚 PROJECT_SUMMARY.md           # Project overview
│
├── 📄 index.html                   # HTML entry point
│
└── src/                            # Source code directory
    │
    ├── 📄 main.jsx                 # React entry point
    ├── 📄 App.jsx                  # Main app component with routing
    ├── 🎨 index.css                # Global styles & Tailwind
    │
    ├── components/                 # Reusable UI components
    │   ├── 🧩 Navbar.jsx           # Navigation bar component
    │   ├── 🧩 Footer.jsx           # Footer component
    │   ├── 🧩 PCSpecsForm.jsx      # PC specifications form
    │   ├── 🧩 GameCard.jsx         # Individual game card
    │   ├── 🧩 GameList.jsx         # Grid of game cards
    │   └── 🧩 GameDetails.jsx      # Detailed game view
    │
    ├── pages/                      # Page components (routes)
    │   ├── 📄 Home.jsx             # Landing page (/)
    │   ├── 📄 CheckSpecs.jsx       # Specs form page (/check)
    │   ├── 📄 Results.jsx          # Results page (/results)
    │   └── 📄 GameDetailsPage.jsx  # Game details (/game/:id)
    │
    ├── services/                   # Business logic & API
    │   └── 🔌 api.js               # Axios HTTP client
    │
    └── context/                    # React Context (state)
        └── 🔄 RecommendationContext.jsx  # Global state
```

---

## 📦 Generated After Build

After running `npm run build`:

```
game-reco-frontend/
│
├── dist/                           # Production build output
│   ├── index.html                  # Optimized HTML
│   ├── assets/                     # Bundled assets
│   │   ├── index-[hash].js        # Minified JavaScript
│   │   ├── index-[hash].css       # Minified CSS
│   │   └── [other-assets]         # Images, fonts, etc.
│   └── ...
│
└── node_modules/                   # Installed dependencies
    └── ...
```

---

## 🗂️ Component Relationships

```
App.jsx (Root)
│
├── RecommendationProvider (Context)
│   │
│   └── Router
│       │
│       ├── Navbar (Always visible)
│       │
│       ├── Routes (Main content)
│       │   ├── Home
│       │   ├── CheckSpecs
│       │   │   └── PCSpecsForm
│       │   ├── Results
│       │   │   └── GameList
│       │   │       └── GameCard (multiple)
│       │   └── GameDetailsPage
│       │       └── GameDetails
│       │
│       └── Footer (Always visible)
```

---

## 🔄 Data Flow

```
User Input
    ↓
PCSpecsForm
    ↓
api.js (POST /api/recommend)
    ↓
RecommendationContext (Store results)
    ↓
Results Page
    ↓
GameList → GameCard
    ↓
Click Card
    ↓
GameDetailsPage
    ↓
api.js (GET /api/games/:id)
    ↓
GameDetails (Display)
```

---

## 📋 File Count Summary

| Category | Count | Details |
|----------|-------|---------|
| **Components** | 6 | Navbar, Footer, PCSpecsForm, GameCard, GameList, GameDetails |
| **Pages** | 4 | Home, CheckSpecs, Results, GameDetailsPage |
| **Services** | 1 | api.js |
| **Context** | 1 | RecommendationContext |
| **Config Files** | 5 | package.json, vite.config.js, tailwind.config.js, postcss.config.js, .env.example |
| **Docs** | 4 | README, SETUP_GUIDE, API_DOCS, PROJECT_SUMMARY |
| **Entry Points** | 3 | index.html, main.jsx, App.jsx |
| **Styles** | 1 | index.css |
| **Scripts** | 1 | setup.sh |
| **TOTAL** | 26+ | Main project files |

---

## 🎯 Key File Purposes

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts, project metadata |
| `vite.config.js` | Build configuration, dev server, API proxy |
| `tailwind.config.js` | Custom colors, fonts, animations |
| `postcss.config.js` | PostCSS plugins (Tailwind, Autoprefixer) |
| `.env.example` | Environment variables template |

### Core Application

| File | Purpose |
|------|---------|
| `index.html` | HTML template, Google Fonts, root div |
| `main.jsx` | React mounting point |
| `App.jsx` | Router setup, main app structure |
| `index.css` | Global styles, Tailwind directives, animations |

### Components

| File | Purpose |
|------|---------|
| `Navbar.jsx` | Top navigation with links |
| `Footer.jsx` | Bottom footer with info |
| `PCSpecsForm.jsx` | Form with validation for PC specs |
| `GameCard.jsx` | Reusable card for game display |
| `GameList.jsx` | Grid container for multiple cards |
| `GameDetails.jsx` | Full game information display |

### Pages

| File | Purpose |
|------|---------|
| `Home.jsx` | Landing page with features |
| `CheckSpecs.jsx` | Specs form page wrapper |
| `Results.jsx` | Recommendations display |
| `GameDetailsPage.jsx` | Individual game details wrapper |

### Services & Context

| File | Purpose |
|------|---------|
| `api.js` | HTTP client, API calls, error handling |
| `RecommendationContext.jsx` | Global state for recommendations |

---

## 💾 File Sizes (Approximate)

| File | Lines | Size |
|------|-------|------|
| `PCSpecsForm.jsx` | ~250 | 8 KB |
| `GameDetails.jsx` | ~300 | 10 KB |
| `Home.jsx` | ~200 | 7 KB |
| `Results.jsx` | ~180 | 6 KB |
| `Navbar.jsx` | ~120 | 4 KB |
| `Footer.jsx` | ~120 | 4 KB |
| `GameCard.jsx` | ~120 | 4 KB |
| `GameList.jsx` | ~40 | 1.5 KB |
| `api.js` | ~120 | 4 KB |
| `index.css` | ~200 | 7 KB |
| **Total Source** | ~2500+ | ~85 KB |

*Build output (minified): ~200-300 KB*

---

## 🚀 Build Process Flow

```
Source Files (src/)
    ↓
Vite Build Tool
    ↓
1. Transpile JSX → JS (React)
2. Process CSS (Tailwind → PostCSS)
3. Minify JS & CSS
4. Code Splitting by Route
5. Asset Optimization
6. Hash Filenames
    ↓
Optimized Bundle (dist/)
    ↓
Ready for Deployment
```

---

## 📱 Responsive Breakpoints

Used throughout components:

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px+ | 2-column grids, show full text |
| `md` | 768px+ | 3-column grids, horizontal layouts |
| `lg` | 1024px+ | Sidebar layouts, larger text |
| `xl` | 1280px+ | Max content width containers |

---

This structure provides a clean, maintainable, and scalable React application architecture. 🏗️
