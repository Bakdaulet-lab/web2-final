class ApiClient {
    static BASE_URL = 'http://localhost:3000/api';

    static async fetchWithAuth(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };

        try {
            const response = await fetch(`${this.BASE_URL}${endpoint}`, {
                ...options,
                headers,
                credentials: 'include'
            });

            if (response.status === 401) {
                AuthService.logout();
                window.location.href = '/pages/login.html';
                throw new Error('Authentication required');
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'API request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // User related endpoints
    static async updateUserProfile(userId, data) {
        return this.fetchWithAuth(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async getUserProfile() {
        return this.fetchWithAuth('/profile');
    }

    // Search related endpoints
    static async searchDestinations(query) {
        return this.fetchWithAuth(`/search/destinations?q=${encodeURIComponent(query)}`);
    }

    static async getPopularDestinations() {
        return this.fetchWithAuth('/destinations/popular');
    }
}