import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import { sendTokenResponse } from "../utils/jwt.js";

/**
 * @route   POST /api/v1/auth/signup
 * @access  Public
 */
export const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, riskTolerance } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("An account with this email already exists.", 409));
  }

  const user = await User.create({
    name,
    email,
    password,
    riskTolerance: riskTolerance || "moderate",
  });

  sendTokenResponse(user, 201, res);
});

/**
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // password has `select: false` in the schema, so explicitly request it here
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Incorrect email or password.", 401));
  }

  user.lastLoginAt = Date.now();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

/**
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = (req, res) => {
  res.cookie("token", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "Logged out successfully." });
};

/**
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = catchAsync(async (req, res, next) => {
  // req.user is set by the `protect` middleware
  res.status(200).json({
    success: true,
    user: req.user,
  });
});
