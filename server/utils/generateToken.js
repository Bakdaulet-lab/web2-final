const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || "fd3e1a6c2b5a9d8e7f6b4c3a1d2e9f8d7c6b5a4e3d2c1b0f9e8d7c6b5a4e3d2c";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "RefreshSecret";

class TokenManager {
    static generateAccessToken(user) {
        try {
            return jwt.sign(
                { 
                    userId: user._id, 
                    username: user.username,
                    tokenType: 'access'
                }, 
                JWT_SECRET, 
                { expiresIn: '1h' }
            );
        } catch (error) {
            console.error('Access token generation failed:', error);
            throw new Error('Failed to generate access token');
        }
    }

    static generateRefreshToken(user) {
        try {
            return jwt.sign(
                { 
                    userId: user._id,
                    tokenType: 'refresh'
                }, 
                JWT_REFRESH_SECRET, 
                { expiresIn: '7d' }
            );
        } catch (error) {
            console.error('Refresh token generation failed:', error);
            throw new Error('Failed to generate refresh token');
        }
    }

    static verifyAccessToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            console.error('Token verification error:', error);
            throw error;
        }
    }

    static verifyRefreshToken(token) {
        try {
            return jwt.verify(token, JWT_REFRESH_SECRET);
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new Error('Refresh token has expired');
            } else if (error instanceof jwt.JsonWebTokenError) {
                throw new Error('Invalid refresh token');
            }
            throw error;
        }
    }

    static isTokenExpired(token) {
        try {
            const decoded = jwt.decode(token);
            return decoded.exp * 1000 < Date.now();
        } catch {
            return true;
        }
    }

    static async handleTokenRefresh(user, oldRefreshToken) {
        try {
            // Verify old refresh token
            const decoded = this.verifyRefreshToken(oldRefreshToken);
            
            if (decoded.userId !== user._id.toString()) {
                throw new Error('Invalid refresh token');
            }
            
            // Generate new tokens
            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken(user);

            return { accessToken, refreshToken };
        } catch (error) {
            throw new Error('Failed to refresh tokens');
        }
    }
}

module.exports = TokenManager;