import express from 'express';
import cors from 'cors';

import authRoutes from './routes/Authroutes.js';
import gameRoutes from './routes/Gameroutes.js';
import recommendationRoutes from './routes/Recommendationroutes.js';
import sliderRoutes from './routes/sliderRoutes.js';
import externalGamesRoutes from './routes/ExternalGamesRoutes.js';
import libraryRoutes from './routes/Libraryroutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'Game Reco Backend API' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/slider', sliderRoutes);
app.use('/api/external', externalGamesRoutes);
app.use('/api/library', libraryRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

export default app;