/**
 * Wraps an async controller function so any rejected promise / thrown error
 * is automatically passed to Express's error-handling middleware via next().
 * Avoids writing try-catch in every single controller.
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

export default catchAsync;