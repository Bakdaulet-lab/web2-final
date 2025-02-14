class ApiService {
    static BASE_URL = 'http://localhost:3000/api';

    static async request(endpoint, options = {}) {
        try {
            const token = AuthService.getToken();
            
            const headers = {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            };

            const response = await fetch(`${this.BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    ...headers,
                    ...options.headers
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Auth endpoints
    static async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    static async verifyOTP(data) {
        try {
            const response = await fetch(`${this.BASE_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: data.userId,
                    otp: data.otp.toString()
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'OTP verification failed');
            }

            return result;
        } catch (error) {
            console.error('OTP verification error:', error);
            throw error;
        }
    }

    static async register(userData) {
        try {
            const response = await fetch(`${this.BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Registration failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    // Attractions endpoints
    static async getAttractions() {
        return this.request('/attractions');
    }

    // Excursions endpoints
    static async getExcursions() {
        return this.request('/excursions');
    }

    // Bookings endpoints
    static async createBooking(bookingData) {
        return this.request('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
    }

    static async getUserBookings() {
        return this.request('/bookings');
    }

    // Payment endpoints
    static async checkWalletBalance() {
        return this.request('/payments/balance');
    }

    static async sendPayment(paymentData) {
        return this.request('/payments/send', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    }

    static async getTransactionHistory() {
        return this.request('/payments/transactions');
    }

    // Add itinerary endpoints
    static async getUserItineraries() {
        return this.request('/itineraries');
    }

    static async createItinerary(itineraryData) {
        return this.request('/itineraries', {
            method: 'POST',
            body: JSON.stringify(itineraryData)
        });
    }

    static async updateItinerary(itineraryId, updates) {
        return this.request(`/itineraries/${itineraryId}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }

    // Add accommodation endpoints
    static async getAccommodations() {
        return this.request('/accommodations');
    }

    static async bookAccommodation(accommodationData) {
        return this.request('/bookings', {
            method: 'POST',
            body: JSON.stringify({
                type: 'accommodation',
                ...accommodationData
            })
        });
    }

    // Add flight endpoints
    static async searchFlights(params) {
        try {
            const queryString = new URLSearchParams(params).toString();
            return await this.request(`/flights?${queryString}`);
        } catch (error) {
            console.error('Flight search error:', error);
            throw error;
        }
    }

    static async bookFlight(flightData) {
        return this.request('/bookings', {
            method: 'POST',
            body: JSON.stringify({
                type: 'flight',
                ...flightData
            })
        });
    }
}