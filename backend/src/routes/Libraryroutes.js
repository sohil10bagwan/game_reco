import express from 'express';
import { protect } from '../middleware/Authmiddleware.js';
import {
  getMyLibrary,
  addBookmark,
  removeBookmark,
  addFavorite,
  removeFavorite,
} from '../controllers/Librarycontroller.js';

const router = express.Router();

router.get('/me', protect, getMyLibrary);
router.post('/bookmarks/:gameId', protect, addBookmark);
router.delete('/bookmarks/:gameId', protect, removeBookmark);
router.post('/favorites/:gameId', protect, addFavorite);
router.delete('/favorites/:gameId', protect, removeFavorite);

export default router;

