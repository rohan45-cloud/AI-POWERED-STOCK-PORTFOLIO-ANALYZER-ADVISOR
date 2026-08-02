import express from "express";
import {
    getQuote,
    getProfile,
    getCandles,
    getNews,
    getBatchQuotes,
    getStockDetail,
} from "../controllers/stockController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

// IMPORTANT: /quotes (batch) must be registered before /quote/:symbol
// so Express doesn't treat "quotes" as a :symbol value on the singular route.
router.get("/quotes", getBatchQuotes);
router.get("/quote/:symbol", getQuote);
router.get("/profile/:symbol", getProfile);
router.get("/candles/:symbol", getCandles);
router.get("/news/:symbol", getNews);
router.get("/detail/:symbol", getStockDetail);

export default router;