const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const TokenManager = require('../utils/generateToken'); // Add this import

const refreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 7 * 24 * 60 * 60 // Automatically delete after 7 days
    }
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    age: {
        type: Number
    },
    otp: String,
    otpExpires: Date,
    refreshTokens: [refreshTokenSchema],
    emailNotifications: {
        type: Boolean,
        default: true
    },
    pushNotifications: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Add timestamps for better tracking
});

// Clean up expired tokens
userSchema.methods.cleanupTokens = async function() {
    try {
        this.refreshTokens = this.refreshTokens.filter(token => 
            !TokenManager.isTokenExpired(token.token)
        );
        await this.save();
    } catch (error) {
        console.error('Token cleanup error:', error);
        throw error;
    }
};

// Add new refresh token with cleanup
userSchema.methods.addRefreshToken = async function(token) {
    try {
        await this.cleanupTokens(); // Clean up expired tokens first
        this.refreshTokens.push({ token });
        await this.save();
    } catch (error) {
        console.error('Add token error:', error);
        throw error;
    }
};

// Remove specific refresh token
userSchema.methods.removeRefreshToken = async function(token) {
    try {
        this.refreshTokens = this.refreshTokens.filter(t => t.token !== token);
        await this.save();
    } catch (error) {
        console.error('Remove token error:', error);
        throw error;
    }
};

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        console.log('Password comparison:', {
            candidatePassword,
            hashedPassword: this.password,
            isMatch
        });
        return isMatch;
    } catch (error) {
        console.error('Password comparison error:', error);
        throw error;
    }
};

// Add a method to validate refresh token
userSchema.methods.hasValidRefreshToken = function(token) {
    return this.refreshTokens.some(t => 
        t.token === token && !TokenManager.isTokenExpired(t.token)
    );
};

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        try {
            const salt = await bcrypt.genSalt(10); // Use consistent salt rounds
            this.password = await bcrypt.hash(this.password, salt);
        } catch (error) {
            return next(error);
        }
    }
    next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
