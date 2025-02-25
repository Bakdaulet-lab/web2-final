class AuthService {
    static getToken() {
        return localStorage.getItem('token');
    }

    static setToken(token) {
        if (token) {
            localStorage.setItem('token', token.trim());
        }
    }

    static getAccessToken() {
        return localStorage.getItem('accessToken');
    }

    static getRefreshToken() {
        return localStorage.getItem('refreshToken');
    }

    static setTokens(accessToken, refreshToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    }

    static clearTokens() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }

    static isTokenExpired(token) {
        if (!token) return true;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 <= Date.now();
        } catch {
            return true;
        }
    }

    static async getValidToken() {
        const accessToken = this.getAccessToken();
        
        if (!accessToken || this.isTokenExpired(accessToken)) {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            try {
                const response = await fetch('http://localhost:3000/api/auth/refresh', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ refreshToken })
                });

                const data = await response.json();
                if (!response.ok) {
                    this.clearTokens();
                    window.location.href = '/pages/login.html';
                    throw new Error('Session expired');
                }

                this.setTokens(data.accessToken, data.refreshToken);
                return data.accessToken;
            } catch (error) {
                this.clearTokens();
                window.location.href = '/pages/login.html';
                throw error;
            }
        }

        return accessToken;
    }

    static isAuthenticated() {
        const token = this.getAccessToken();
        return token && !this.isTokenExpired(token);
    }

    static async login(credentials) {
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            if (data.success) {
                this.setTokens(data.accessToken, data.refreshToken);
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    static async verifyOTP(userId, otp) {
        try {
            const response = await fetch('http://localhost:3000/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, otp })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'OTP verification failed');
            }

            if (data.success) {
                this.setTokens(data.token, data.refreshToken);
            }

            return data;
        } catch (error) {
            console.error('OTP verification error:', error);
            throw error;
        }
    }
}

// Make AuthService available globally
window.AuthService = AuthService;

// Remove the export statement since we're using script tags