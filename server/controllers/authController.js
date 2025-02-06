// server/controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/Users");
const { generateOTP, sendOTPEmail } = require("../middlewares/auth");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "RefreshSecret";

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Please provide both username and password." });
  }

  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
    await user.save();

    await sendOTPEmail(user.email, otp);

    res.status(200).json({ message: "OTP sent to email." });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

exports.verifyOTP = async (req, res) => {
  const { username, otp } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(401).json({ error: "Invalid or expired OTP." });
    }

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
    res.json({ accessToken });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token provided." });
  }

  try {
    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(403).json({ error: "Invalid refresh token." });
    }

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

exports.logout = async (req, res) => {
  try {
    const user = await User.findOne({ refreshToken: req.cookies.refreshToken });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully." });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};