import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

/**
 * Protects routes by verifying the JWT sent either as a Bearer token
 * in the Authorization header, or as an httpOnly cookie.
 * On success, attaches the authenticated user to req.user.
 */
export const protect = catchAsync(async(req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return next(
            new AppError("You are not logged in. Please log in to access this resource.", 401)
        );
    }

    // Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check the user still exists (handles deleted accounts with old valid tokens)
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError("The user belonging to this token no longer exists.", 401)
        );
    }

    // Check user didn't change password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError("Password was recently changed. Please log in again.", 401)
        );
    }

    req.user = currentUser;
    next();
});

/**
 * Restricts a route to specific roles, if/when role-based access is added later.
 * Usage: restrictTo('admin')
 */
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError("You do not have permission to perform this action.", 403)
            );
        }
        next();
    };
};