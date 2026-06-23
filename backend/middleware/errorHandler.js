import AppError from "../utils/AppError.js";

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate value for field "${field}": "${value}". Please use another value.`;
    return new AppError(message, 409);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data: ${errors.join(". ")}`;
    return new AppError(message, 400);
};

const handleJWTError = () =>
    new AppError("Invalid token. Please log in again.", 401);

const handleJWTExpiredError = () =>
    new AppError("Your session has expired. Please log in again.", 401);

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        success: false,
        status: err.status,
        message: err.message,
        stack: err.stack,
        error: err,
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send a clean message to the client
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            status: err.status,
            message: err.message,
        });
    }

    // Programming or unknown error: don't leak details
    console.error("UNEXPECTED ERROR:", err);
    return res.status(500).json({
        success: false,
        status: "error",
        message: "Something went wrong. Please try again later.",
    });
};

/**
 * Centralized Express error handler. Must be registered last, after all routes.
 */
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, res);
    } else {
        let error = Object.assign(
            Object.create(Object.getPrototypeOf(err)),
            err
        );
        error.message = err.message;

        if (error.name === "CastError") error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === "ValidationError")
            error = handleValidationErrorDB(error);
        if (error.name === "JsonWebTokenError") error = handleJWTError();
        if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
};

export default errorHandler;