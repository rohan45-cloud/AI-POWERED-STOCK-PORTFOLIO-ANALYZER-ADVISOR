import jwt from "jsonwebtoken";

/**
 * Generates a signed JWT for a given user ID.
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Sends the JWT to the client as an httpOnly cookie AND in the JSON body.
 * httpOnly cookie protects against XSS reading the token via JS.
 * Returning it in the body too makes the API usable for mobile clients / Postman.
 */
export const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieExpiresInDays = Number(process.env.JWT_COOKIE_EXPIRES_IN) || 7;

  const cookieOptions = {
    expires: new Date(
      Date.now() + cookieExpiresInDays * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res.cookie("token", token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token,
    user,
  });
};
