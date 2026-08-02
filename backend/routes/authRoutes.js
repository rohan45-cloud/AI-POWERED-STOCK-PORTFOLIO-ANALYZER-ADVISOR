import express from "express";
import rateLimit from "express-rate-limit";
import {
    signup,
    login,
    logout,
    getMe,
} from "../controllers/authController.js";
import {
    signupValidation,
    loginValidation,
    handleValidationErrors,
} from "../middleware/validators.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Stricter rate limit on auth endpoints to slow down brute-force / credential-stuffing attempts
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: {
        success: false,
        message: "Too many attempts from this IP. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post("/signup", authLimiter, signupValidation, handleValidationErrors, signup);
router.post("/login", authLimiter, loginValidation, handleValidationErrors, login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

export default router;