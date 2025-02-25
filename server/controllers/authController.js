// server/controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/Users");
const { generateOTP, sendOTPEmail } = require("../middlewares/auth");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");
const TokenManager = require('../utils/generateToken');

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
        console.log('Login attempt:', { username, userFound: !!user });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const isValidPassword = await user.comparePassword(password);
        console.log('Password validation:', { isValid: isValidPassword });

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
        await user.save();

        // Send OTP via email
        await sendOTPEmail(user.email, otp);

        res.json({
            success: true,
            requiresOTP: true,
            userId: user._id,
            message: 'OTP has been sent to your email'
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
};

exports.verifyOTP = async (req, res) => {
    const { userId, otp } = req.body;
    console.log('Verifying OTP:', { userId, otp }); // Debug log

    try {
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                error: "User not found" 
            });
        }

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
            return res.status(401).json({ 
                success: false,
                error: "Invalid OTP" 
            });
        }

        // Clear OTP after successful verification
        user.otp = null;
        user.otpExpires = null;

        // Generate new tokens
        const accessToken = TokenManager.generateAccessToken(user);
        const refreshToken = TokenManager.generateRefreshToken(user);

        // Save refresh token
        await user.addRefreshToken(refreshToken);
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
            error: "Server error during OTP verification" 
        });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({ 
                success: false, 
                error: 'Refresh token is required' 
            });
        }

        const user = await User.findOne({ 
            'refreshTokens.token': refreshToken 
        });

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid refresh token' 
            });
        }

        // Verify refresh token
        try {
            const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
            if (decoded.userId !== user._id.toString()) {
                throw new Error('Invalid refresh token');
            }
        } catch (error) {
            await user.removeRefreshToken(refreshToken);
            await user.save();
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired refresh token'
            });
        }

        // Generate new tokens
        const accessToken = TokenManager.generateAccessToken(user);
        const newRefreshToken = TokenManager.generateRefreshToken(user);

        // Update tokens in database
        await user.removeRefreshToken(refreshToken);
        await user.addRefreshToken(newRefreshToken);

        res.json({
            success: true,
            accessToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({ 
            success: false, 
            error: 'Token refresh failed' 
        });
    }
};

exports.logout = async (req, res) => {
    try {
        // Get refresh token from request body
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token is required'
            });
        }

        // Find user and remove the refresh token
        const user = await User.findOne({ 'refreshTokens.token': refreshToken });
        if (user) {
            await user.removeRefreshToken(refreshToken);
            await user.save();
        }

        res.json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
            success: false,
            error: "Server error during logout"
        });
    }
};