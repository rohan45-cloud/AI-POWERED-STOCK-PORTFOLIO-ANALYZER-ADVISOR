import express from "express";
import {
    getPortfolio,
    addHolding,
    updateHolding,
    deleteHolding,
    sellHolding,
    getTransactionHistory,
    getPerformanceHistory,
    refreshPrices,
} from "../controllers/holdingController.js";
import {
    createHoldingValidation,
    updateHoldingValidation,
    handleValidationErrors,
} from "../middleware/validators.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All portfolio routes require authentication
router.use(protect);

router.get("/", getPortfolio);
router.get("/performance", getPerformanceHistory);
router.get("/transactions", getTransactionHistory);
router.post("/refresh-prices", refreshPrices);
router.post("/holdings", createHoldingValidation, handleValidationErrors, addHolding);
router.patch("/holdings/:id", updateHoldingValidation, handleValidationErrors, updateHolding);
router.delete("/holdings/:id", deleteHolding);
router.post("/holdings/:id/sell", sellHolding);

export default router;