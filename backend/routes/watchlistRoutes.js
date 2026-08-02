import express from "express";
import {
    getWatchlist,
    addToWatchlist,
    updateWatchlistItem,
    removeFromWatchlist,
} from "../controllers/watchlistController.js";
import {
    addWatchlistValidation,
    updateWatchlistValidation,
    handleValidationErrors,
} from "../middleware/validators.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getWatchlist);
router.post("/", addWatchlistValidation, handleValidationErrors, addToWatchlist);
router.patch("/:id", updateWatchlistValidation, handleValidationErrors, updateWatchlistItem);
router.delete("/:id", removeFromWatchlist);

export default router;