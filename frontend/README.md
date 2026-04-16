# Game Reco - Smart Game Recommendation Frontend

A modern, responsive React application that provides personalized game recommendations based on your PC specifications and gaming preferences.

![Game Reco](https://via.placeholder.com/1200x400/0a0a0f/8338ec?text=Game+Reco)

## ✨ Features

- **Smart Recommendations**: Get game suggestions based on your RAM, CPU, GPU, and genre preferences
- **Modern UI**: Cyberpunk-inspired design with smooth animations and responsive layout
- **Detailed Game Info**: View comprehensive game details including trailers, ratings, and system requirements
- **Real-time Search**: Instant feedback and results from the backend API
- **Mobile-Friendly**: Fully responsive design that works on all devices
- **Performance Optimized**: Built with Vite for lightning-fast development and production builds

## 🚀 Tech Stack

- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **Custom Fonts**: Orbitron & Rajdhani from Google Fonts

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Backend API** running on `http://localhost:3000`

## 🛠️ Installation

### 1. Clone or Download the Project

```bash
cd game-reco-frontend
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` to configure your backend API URL:
```
VITE_API_URL=http://localhost:3000
```

### 4. Start Development Server

Using npm:
```bash
npm run dev
```

Using yarn:
```bash
yarn dev
```

The application will be available at `http://localhost:5173`

## 📦 Build for Production

To create an optimized production build:

```bash
npm run build
```

or

```bash
yarn build
```

To preview the production build locally:

```bash
npm run preview
```

The built files will be in the `dist` directory.

## 🏗️ Project Structure

```
game-reco-frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable React components
│   │   ├── Navbar.jsx      # Navigation bar
│   │   ├── Footer.jsx      # Footer component
│   │   ├── PCSpecsForm.jsx # Form for entering PC specs
│   │   ├── GameCard.jsx    # Game card for list view
│   │   ├── GameList.jsx    # Grid of game cards
│   │   └── GameDetails.jsx # Detailed game view
│   ├── pages/              # Page components
│   │   ├── Home.jsx        # Landing page
│   │   ├── CheckSpecs.jsx  # PC specs form page
│   │   ├── Results.jsx     # Recommendations results page
│   │   └── GameDetailsPage.jsx # Individual game details page
│   ├── services/           # API services
│   │   └── api.js          # Axios API client
│   ├── context/            # React Context
│   │   └── RecommendationContext.jsx # State management
│   ├── App.jsx             # Main app component with routing
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles with Tailwind
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## 🎨 Key Components

### Navbar
- Fixed navigation bar with logo and links
- Active route highlighting
- Scroll-based styling changes

### PCSpecsForm
- Form validation for all fields
- Dynamic dropdown selections:
  - RAM: 4GB, 8GB, 16GB, 32GB
  - CPU Level: Low, Medium, High
  - GPU Level: Low, Medium, High
  - Genre: Action, Adventure, RPG, Strategy, FPS, Sports, Racing, Simulation, Horror, Puzzle
- Loading states during API calls
- Error handling and user feedback

### GameCard
- Displays game thumbnail, name, genre, and rating
- Hover effects and smooth transitions
- Click to navigate to detailed view

### GameDetails
- Comprehensive game information
- Embedded YouTube trailer (if available)
- System requirements display
- Responsive layout

## 🔌 API Integration

The app expects the following backend endpoints:

### POST `/api/recommend`
Request body:
```json
{
  "ram": 16,
  "cpuLevel": 2,
  "gpuLevel": 3,
  "genre": "Action"
}
```

Response:
```json
[
  {
    "id": 1,
    "name": "Game Title",
    "genre": "Action",
    "rating": 8.5,
    "image_url": "https://...",
    "description": "Game description",
    "trailer_url": "https://youtube.com/...",
    "min_ram": 8,
    "min_cpu_level": 2,
    "min_gpu_level": 2
  }
]
```

### GET `/api/games/:id`
Response:
```json
{
  "id": 1,
  "name": "Game Title",
  "genre": "Action",
  "rating": 8.5,
  "image_url": "https://...",
  "description": "Full game description",
  "trailer_url": "https://youtube.com/...",
  "min_ram": 8,
  "min_cpu_level": 2,
  "min_gpu_level": 2
}
```

## 🎯 Performance Level Mapping

The app uses numeric values for CPU/GPU levels:
- **Low** = 1
- **Medium** = 2
- **High** = 3

## 🎨 Design System

### Colors
- **Neon Pink**: `#ff006e` - Primary accent
- **Neon Cyan**: `#00f5ff` - Secondary accent
- **Neon Purple**: `#8338ec` - Tertiary accent
- **Neon Green**: `#06ffa5` - Success states
- **Dark Shades**: Various dark backgrounds

### Typography
- **Display Font**: Orbitron (headings, UI elements)
- **Body Font**: Rajdhani (body text, descriptions)

### Animations
- Fade in, slide up, glow pulse effects
- Hover transformations
- Smooth transitions throughout

## 🔧 Customization

### Change API URL
Edit `.env` file:
```
VITE_API_URL=https://your-api-domain.com
```

### Modify Genres
Edit `src/components/PCSpecsForm.jsx`:
```javascript
const genres = [
  'Your Genre 1',
  'Your Genre 2',
  // Add more genres
];
```

### Styling
- Colors: Edit `tailwind.config.js`
- Fonts: Update Google Fonts link in `index.html` and `tailwind.config.js`
- Custom styles: Modify `src/index.css`

## 🐛 Troubleshooting

### Port Already in Use
If port 5173 is busy, Vite will automatically try the next available port. You can also specify a port in `vite.config.js`:

```javascript
export default defineConfig({
  server: {
    port: 3001 // Your preferred port
  }
})
```

### API Connection Issues
1. Ensure backend is running on `http://localhost:3000`
2. Check CORS settings on backend
3. Verify `.env` file configuration
4. Check browser console for detailed errors

### Build Errors
1. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```
2. Clear Vite cache:
   ```bash
   rm -rf .vite
   ```

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👏 Acknowledgments

- Design inspiration from modern gaming interfaces
- Icons from Heroicons
- Fonts from Google Fonts

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Contact the development team
- Check the documentation

---

Built with ❤️ for gamers by gamers
