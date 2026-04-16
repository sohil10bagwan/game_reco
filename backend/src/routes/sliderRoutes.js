import express from "express";
import {
  getAllSliders,
  getSliderById,
  createSlider,
  updateSlider,
  deleteSlider,
} from "../controllers/sliderController.js";
import { protect, adminOnly } from "../middleware/Authmiddleware.js";

const router = express.Router();

// Public routes
router.get("/getAllSliders", getAllSliders);
router.get("/getSlider/:id", getSliderById);

// Protected admin routes
router.post("/createSlider", protect, adminOnly, createSlider);
router.put("/updateSlider/:id", protect, adminOnly, updateSlider);
router.delete("/deleteSlider/:id", protect, adminOnly, deleteSlider);

export default router;