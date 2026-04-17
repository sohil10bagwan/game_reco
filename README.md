# 🎮 Game Recommender — Full Stack App

A **production-grade Game Recommendation System** that suggests PC games based on user hardware specifications.

Built using **Node.js, Express, MongoDB, React, and Tailwind CSS**.

---

## 🚀 Features

* 🔐 JWT Authentication (User & Admin roles)
* 🎯 Hardware-based Game Recommendation Engine
* 🧠 AI-powered Game Discovery
* ⚡ Caching for fast repeated queries
* 🎮 Game Catalog (CRUD with filters & sorting)
* ❤️ User Library (Bookmarks & Favorites)
* 🖼️ Admin Slider/Banner Management
* 🌐 External API Integration

---

## 🏗️ Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT Authentication

### Frontend

* React 18
* Vite
* Tailwind CSS
* Axios
* React Router v6

---

## 📂 Project Structure

```bash
game-recommender/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── middleware/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── context/
│   └── vite.config.js
```

---

## 🔁 How It Works

1. User enters PC specs (RAM, CPU, GPU)
2. Backend analyzes performance tier
3. Matches games using scoring algorithm (0–100)
4. Fetches external data (if needed)
5. Returns optimized recommendations

---

## 📡 API Endpoints

### Auth

* `POST /api/auth/register`
* `POST /api/auth/login`

### Games

* `GET /api/games`
* `POST /api/games`
* `PUT /api/games/:id`
* `DELETE /api/games/:id`

### Recommendations

* `POST /api/recommendations`

### Library

* `GET /api/library`
* `POST /api/library/bookmark`
* `POST /api/library/favorite`

---

## ⚙️ Installation

### 1. Clone Repo

```bash
git clone https://github.com/your-username/game-recommender.git
cd game-recommender
```

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

Create `.env` files:

### Backend

```env
PORT=3000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
```

### Frontend

```env
VITE_API_URL=http://localhost:3000
```

---

## 🎯 Performance Mapping

| Level  | Value |
| ------ | ----- |
| Low    | 1     |
| Medium | 2     |
| High   | 3     |

---

## 🧠 Recommendation Engine

* Compares user specs with game requirements
* Assigns score (0–100)
* Filters incompatible games
* Sorts best matches
* Uses caching for performance

---

## 📱 Screens

* Home Page
* PC Specs Input
* Recommendations Page
* Game Details Page

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first.

---

## 📄 License

MIT License

---

## ⭐ Show Your Support

If you like this project, give it a ⭐ on GitHub!
