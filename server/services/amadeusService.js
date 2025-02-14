const axios = require('axios');
require('dotenv').config();

class AmadeusService {
    constructor() {
        this.baseURL = 'https://test.api.amadeus.com';
        this.token = null;
        this.tokenExpiry = null;
    }

    async ensureValidToken() {
        if (!this.token || !this.tokenExpiry || Date.now() >= this.tokenExpiry) {
            await this.getToken();
        }
        return this.token;
    }

    async getToken() {
        try {
            // Create form data properly
            const formData = new URLSearchParams();
            formData.append('grant_type', 'client_credentials');
            formData.append('client_id', process.env.AMADEUS_CLIENT_ID);
            formData.append('client_secret', process.env.AMADEUS_CLIENT_SECRET);

            const response = await axios({
                method: 'POST',
                url: `${this.baseURL}/v1/security/oauth2/token`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: formData
            });

            console.log('Token response:', response.data); // Debug log

            if (response.data && response.data.access_token) {
                this.token = response.data.access_token;
                this.tokenExpiry = Date.now() + ((response.data.expires_in - 60) * 1000); // Expire 1 minute early
                return this.token;
            } else {
                throw new Error('Invalid token response');
            }
        } catch (error) {
            console.error('Amadeus token error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        }
    }

    async searchHotels(params) {
        try {
            const token = await this.ensureValidToken();
            
            const response = await axios({
                method: 'get',
                url: `${this.baseURL}/v1/reference-data/locations/hotels/by-city`,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    cityCode: params.cityCode,
                    radius: params.radius || 5,
                    radiusUnit: 'KM',
                    hotelSource: 'ALL',
                    ratings: params.ratings,
                    amenities: params.amenities
                }
            });

            return response.data;
        } catch (error) {
            console.error('Hotel search error:', error.response?.data || error.message);
            throw error;
        }
    }

    async getHotelOffers(params) {
        try {
            const token = await this.ensureValidToken();

            const response = await axios({
                method: 'get',
                url: `${this.baseURL}/v1/shopping/hotel-offers`,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    hotelIds: params.hotelIds,
                    adults: params.adults,
                    checkInDate: params.checkInDate,
                    checkOutDate: params.checkOutDate,
                    roomQuantity: params.rooms,
                    currency: params.currency || 'USD'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Hotel offers error:', error.response?.data || error.message);
            throw error;
        }
    }

    async bookHotel(bookingData) {
        try {
            const token = await this.ensureValidToken();

            const response = await axios({
                method: 'POST',
                url: `${this.baseURL}/v1/booking/hotel-bookings`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    data: bookingData
                }
            });

            return response.data;
        } catch (error) {
            console.error('Booking error:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = new AmadeusService();