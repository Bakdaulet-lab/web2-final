class AuthService {
    static getToken() {
        return localStorage.getItem('token');
    }

    static setToken(token) {
        if (token) {
            localStorage.setItem('token', token.trim());
        }
    }

    static removeToken() {
        localStorage.removeItem('token');
    }

    static isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000;
        } catch (error) {
            console.error('Token validation error:', error);
            this.removeToken();
            return false;
        }
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

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    static logout() {
        this.removeToken();
        window.location.href = '/pages/login.html';
    }
}