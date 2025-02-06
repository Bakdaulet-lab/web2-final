// server/middlewares/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const JWT_SECRET = process.env.JWT_SECRET || "Bakdaulet";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "RefreshSecret";

const authenticate = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

const verifyRefreshToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      throw new Error("Invalid refresh token");
    }
    return user;
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It expires in 5 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { authenticate, verifyRefreshToken, generateOTP, sendOTPEmail };
