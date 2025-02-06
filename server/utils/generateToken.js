// server/utils/generateToken.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "Bakdaulet";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "RefreshSecret";

exports.generateAccessToken = (user) => {
  return jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, {
    expiresIn: "1h",
  });
};

exports.generateRefreshToken = (user) => {
  return jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};