import { body, validationResult } from "express-validator";
import AppError from "../utils/AppError.js";

/**
 * Runs after the validation chains below and converts express-validator's
 * error array into our AppError format.
 */
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const message = errors
            .array()
            .map((e) => e.msg)
            .join(". ");
        return next(new AppError(message, 400));
    }
    next();
};

export const signupValidation = [
    body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
    body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
    body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
];

export const loginValidation = [
    body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
];

export const createHoldingValidation = [
    body("symbol")
    .trim()
    .notEmpty()
    .withMessage("Stock symbol is required")
    .isLength({ max: 10 })
    .withMessage("Symbol looks too long")
    .matches(/^[A-Za-z.]+$/)
    .withMessage("Symbol should only contain letters"),
    body("quantity")
    .isFloat({ gt: 0 })
    .withMessage("Quantity must be a number greater than 0"),
    body("avgBuyPrice")
    .isFloat({ min: 0 })
    .withMessage("Average buy price must be a non-negative number"),
    body("currentPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Current price must be a non-negative number"),
    body("companyName").optional().trim().isLength({ max: 100 }),
    body("sector").optional().trim().isLength({ max: 50 }),
    body("purchaseDate").optional().isISO8601().withMessage("Invalid date format"),
    body("notes").optional().trim().isLength({ max: 500 }),
];

export const updateHoldingValidation = [
    body("quantity")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Quantity must be a number greater than 0"),
    body("avgBuyPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Average buy price must be a non-negative number"),
    body("currentPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Current price must be a non-negative number"),
    body("companyName").optional().trim().isLength({ max: 100 }),
    body("sector").optional().trim().isLength({ max: 50 }),
    body("notes").optional().trim().isLength({ max: 500 }),
];

export const addWatchlistValidation = [
    body("symbol")
    .trim()
    .notEmpty()
    .withMessage("Stock symbol is required")
    .isLength({ max: 10 })
    .withMessage("Symbol looks too long")
    .matches(/^[A-Za-z.]+$/)
    .withMessage("Symbol should only contain letters"),
    body("companyName").optional().trim().isLength({ max: 100 }),
    body("note").optional().trim().isLength({ max: 300 }),
    body("targetPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Target price must be a non-negative number"),
    body("alertDirection")
    .optional()
    .isIn(["above", "below"])
    .withMessage("Alert direction must be 'above' or 'below'"),
];

export const updateWatchlistValidation = [
    body("companyName").optional().trim().isLength({ max: 100 }),
    body("note").optional().trim().isLength({ max: 300 }),
    body("targetPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Target price must be a non-negative number"),
    body("alertDirection")
    .optional()
    .isIn(["above", "below"])
    .withMessage("Alert direction must be 'above' or 'below'"),
    body("alertEnabled")
    .optional()
    .isBoolean()
    .withMessage("alertEnabled must be true or false"),
];