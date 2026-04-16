# Game Reco Frontend - Complete Setup Guide

## 📖 Table of Contents
1. [Quick Start](#quick-start)
2. [Manual Setup](#manual-setup)
3. [Configuration](#configuration)
4. [Development](#development)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Option 1: Using Setup Script (Linux/Mac)

```bash
cd game-reco-frontend
chmod +x setup.sh
./setup.sh
npm run dev
```

### Option 2: Using npm Commands (All Platforms)

```bash
cd game-reco-frontend
npm install
npm run dev
```

---

## 🔧 Manual Setup

### Step 1: Prerequisites

Ensure you have the following installed:

- **Node.js** v16.0.0 or higher
  - Download from: https://nodejs.org/
  - Verify: `node --version`

- **npm** v7.0.0 or higher (comes with Node.js)
  - Verify: `npm --version`

### Step 2: Install Dependencies

Navigate to the project directory and install all required packages:

```bash
cd game-reco-frontend
npm install
```

This will install:
- React 18
- React Router v6
- Axios
- Tailwind CSS
- Vite
- All necessary dev dependencies

### Step 3: Configure Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and set your backend API URL:

```env
VITE_API_URL=http://localhost:3000
```

**Important**: The backend API must be running and accessible at this URL.

### Step 4: Start Development Server

```bash
npm run dev
```

The application will start at: `http://localhost:5173`

---

## ⚙️ Configuration

### Backend API Configuration

The app communicates with a backend API. Make sure your backend:

1. **Is running** on the configured URL (default: `http://localhost:3000`)
2. **Has CORS enabled** to accept requests from `http://localhost:5173`
3. **Implements the required endpoints**:
   - `POST /api/recommend` - Get game recommendations
   - `GET /api/games/:id` - Get game details

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000` |

### Port Configuration

To change the development server port, edit `vite.config.js`:

```javascript
export default defineConfig({
  server: {
    port: 3001, // Your preferred port
  }
})
```

---

## 💻 Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── PCSpecsForm.jsx
│   ├── GameCard.jsx
│   ├── GameList.jsx
│   └── GameDetails.jsx
├── pages/              # Page components (routes)
│   ├── Home.jsx
│   ├── CheckSpecs.jsx
│   ├── Results.jsx
│   └── GameDetailsPage.jsx
├── services/           # API and business logic
│   └── api.js
├── context/            # React Context for state
│   └── RecommendationContext.jsx
├── App.jsx             # Main app with routing
├── main.jsx            # Entry point
└── index.css           # Global styles
```

### Making Changes

1. **Components**: Edit files in `src/components/`
2. **Pages**: Edit files in `src/pages/`
3. **API Logic**: Edit `src/services/api.js`
4. **Styles**: 
   - Global styles: `src/index.css`
   - Tailwind config: `tailwind.config.js`
   - Component styles: Use Tailwind classes

### Hot Module Replacement

Vite provides instant hot reload. Changes to your code will reflect immediately in the browser without losing state.

---

## 🚢 Production Deployment

### Building for Production

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Output**: The `dist/` directory contains optimized static files

3. **Test the build locally**:
   ```bash
   npm run preview
   ```

### Deployment Options

#### Option 1: Static Hosting (Netlify, Vercel, GitHub Pages)

1. Build the app: `npm run build`
2. Upload `dist/` folder to your hosting service
3. Configure environment variables in hosting dashboard
4. Set build command: `npm run build`
5. Set publish directory: `dist`

#### Option 2: Traditional Web Server (Nginx, Apache)

1. Build: `npm run build`
2. Copy `dist/` contents to web server directory
3. Configure server for SPA routing:

**Nginx** (`/etc/nginx/sites-available/game-reco`):
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/game-reco/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Apache** (`.htaccess` in dist folder):
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

#### Option 3: Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t game-reco-frontend .
docker run -p 80:80 game-reco-frontend
```

### Environment Variables in Production

Set production API URL:
```env
VITE_API_URL=https://api.your-domain.com
```

**Important**: Rebuild the app after changing environment variables.

---

## 🔍 Troubleshooting

### Issue: "Cannot find module" errors

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port 5173 already in use

**Solution 1**: Kill the process using the port
```bash
# Find process
lsof -i :5173
# Kill it
kill -9 <PID>
```

**Solution 2**: Use a different port in `vite.config.js`

### Issue: API requests failing (CORS errors)

**Symptoms**: Console shows CORS policy errors

**Solutions**:
1. Ensure backend has CORS enabled
2. Check backend is running: `curl http://localhost:3000/api/games/1`
3. Verify `VITE_API_URL` in `.env`
4. Use Vite proxy (already configured in `vite.config.js`)

### Issue: Blank page after build

**Causes**:
- Incorrect base path
- Server not configured for SPA routing

**Solutions**:
1. Add base path in `vite.config.js`:
   ```javascript
   export default defineConfig({
     base: '/your-subdirectory/',
   })
   ```

2. Configure server for SPA (see deployment section)

### Issue: Images not loading

**Solutions**:
1. Check image URLs in API responses
2. Verify CORS on image hosts
3. Use fallback images (already implemented)

### Issue: Slow build times

**Solutions**:
1. Clear Vite cache: `rm -rf .vite`
2. Update dependencies: `npm update`
3. Increase Node.js memory:
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm run build
   ```

### Issue: TypeScript errors (if using TypeScript)

This project uses JavaScript (JSX). If converting to TypeScript:
1. Rename `.jsx` files to `.tsx`
2. Install types: `npm install -D @types/react @types/react-dom`
3. Add `tsconfig.json`

---

## 📊 Performance Optimization

### Code Splitting

React Router already implements automatic code splitting by route.

### Image Optimization

Consider using:
- WebP format for images
- Lazy loading (implemented in components)
- CDN for game images

### Bundle Size

Check bundle size:
```bash
npm run build
```

Analyze bundle:
```bash
npm install -D rollup-plugin-visualizer
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] Form validation on /check
- [ ] API requests succeed
- [ ] Game cards display properly
- [ ] Game details page works
- [ ] Mobile responsive design
- [ ] Error handling works

### Browser Testing

Test in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [React Router Documentation](https://reactrouter.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)

---

## 💬 Support

For issues:
1. Check this troubleshooting guide
2. Review console errors in browser DevTools
3. Check backend API is working: `curl http://localhost:3000/api/games/1`
4. Review browser network tab for API request details

---

**Happy Development! 🎮**
