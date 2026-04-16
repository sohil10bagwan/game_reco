import app from './src/app.js';
import connectDB from './src/config/Db.js';
import dotenv from 'dotenv';

// Load environment variables (needed for local development)
dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});