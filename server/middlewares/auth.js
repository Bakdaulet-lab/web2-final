// server/middlewares/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const TokenManager = require('../utils/generateToken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || "fd3e1a6c2b5a9d8e7f6b4c3a1d2e9f8d7c6b5a4e3d2c1b0f9e8d7c6b5a4e3d2c";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "RefreshSecret";

const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        // Use the same JWT_SECRET constant
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Token verification:', { decoded }); // Add debug log
        
        // Make sure to set both user and userId
        req.user = {
            userId: decoded.userId,
            username: decoded.username
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
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
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Login OTP',
        html: `
            <div style="padding: 20px; background-color: #f5f5f5;">
                <h2 style="color: #333;">Your OTP Code</h2>
                <p style="font-size: 16px;">Your verification code is:</p>
                <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
                <p style="color: #666;">This code will expire in 5 minutes.</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

const simpleAuthenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

module.exports = { authenticate, verifyRefreshToken, generateOTP, sendOTPEmail, simpleAuthenticate };
