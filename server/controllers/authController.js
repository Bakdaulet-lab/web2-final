// server/controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/Users");
const { generateOTP, sendOTPEmail } = require("../middlewares/auth");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "RefreshSecret";

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
        await user.save();

        // Send OTP email
        await sendOTPEmail(user.email, otp);

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email',
            requiresOTP: true,
            userId: user._id
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during login'
        });
    }
};

exports.verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    console.log('Verifying OTP:', { userId, otp }); // Debug log

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: "User not found" 
      });
    }

    console.log('Stored OTP:', user.otp); // Debug log
    console.log('Received OTP:', otp); // Debug log
    console.log('OTP Expiry:', user.otpExpires); // Debug log

    // Make sure we're comparing strings
    const storedOTP = user.otp ? user.otp.toString() : null;
    const submittedOTP = otp ? otp.toString() : null;

    if (!storedOTP || !user.otpExpires) {
      return res.status(401).json({ 
        success: false,
        error: "No OTP request found" 
      });
    }

    if (Date.now() > user.otpExpires) {
      return res.status(401).json({ 
        success: false,
        error: "OTP has expired" 
      });
    }

    if (storedOTP !== submittedOTP) {
      console.log('OTP mismatch:', { stored: storedOTP, submitted: submittedOTP }); // Debug log
      return res.status(401).json({ 
        success: false,
        error: "Invalid OTP" 
      });
    }

    // Clear OTP after successful verification
    user.otp = null;
    user.otpExpires = null;

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Authentication successful",
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ 
      success: false,
      error: "Server error" 
    });
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