const axios = require('axios');
const querystring = require('querystring');
require('dotenv').config();

class AmadeusService {
    constructor() {
        this.baseURL = 'https://test.api.amadeus.com/v1';
        this.token = null;
        this.tokenExpiry = null;
    }

    async getToken() {
        try {
            const params = querystring.stringify({
                grant_type: 'client_credentials',
                client_id: process.env.AMADEUS_CLIENT_ID,
                client_secret: process.env.AMADEUS_CLIENT_SECRET
            });

            const response = await axios({
                method: 'post',
                url: 'https://test.api.amadeus.com/v1/security/oauth2/token',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: params
            });

            if (response.data && response.data.access_token) {
                this.token = response.data.access_token;
                this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
                return this.token;
            } else {
                throw new Error('Invalid token response');
            }
        } catch (error) {
            console.error('Amadeus token error:', error.response?.data || error.message);
            throw error;
        }
    }

    async searchHotels(params) {
        try {
            const token = await this.getToken();
            
            const response = await axios({
                method: 'get',
                url: `${this.baseURL}/reference-data/locations/hotels/by-city`,
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
            const token = await this.getToken();

            const response = await axios({
                method: 'get',
                url: `${this.baseURL}/shopping/hotel-offers`,
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
}

module.exports = new AmadeusService();