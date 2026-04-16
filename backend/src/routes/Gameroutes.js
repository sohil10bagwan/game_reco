import express from 'express';
const router = express.Router();
import { addGame, getAllGames, getGameById, updateGame, deleteGame } from '../controllers/Gamecontroller.js';
import { protect, adminOnly } from '../middleware/Authmiddleware.js';
import { gameValidationRules, validateId } from '../middleware/validationMiddleware.js';


router.get('/getAllGames', getAllGames);
router.get('/getGame/:id', getGameById);
router.post('/addGame', protect, adminOnly, addGame);
router.put('/updateGame/:id', protect, adminOnly, updateGame);
router.delete('/deleteGame/:id', protect, adminOnly, deleteGame);

export default router;