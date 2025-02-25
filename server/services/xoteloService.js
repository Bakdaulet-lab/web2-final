const axios = require('axios');

class XoteloService {
    constructor() {
        this.baseURL = 'https://data.xotelo.com/api';
    }

    async getHotelRates(hotelKey, checkIn, checkOut, rooms = 1, adults = 1) {
        try {
            const response = await axios.get(`${this.baseURL}/rates`, {
                params: {
                    hotel_key: hotelKey,
                    chk_in: checkIn,
                    chk_out: checkOut,
                    rooms,
                    adults
                }
            });
            return response.data;
        } catch (error) {
            console.error('Xotelo API Error:', error);
            throw new Error('Failed to fetch hotel rates');
        }
    }

    async getHotelHeatmap(hotelKey, checkOut) {
        try {
            const response = await axios.get(`${this.baseURL}/heatmap`, {
                params: {
                    hotel_key: hotelKey,
                    chk_out: checkOut
                }
            });
            return response.data;
        } catch (error) {
            console.error('Xotelo API Error:', error);
            throw new Error('Failed to fetch hotel heatmap');
        }
    }

    async getHotelsList(locationKey, limit = 30, offset = 0, sortBy = 'best_value') {
        try {
            const response = await axios.get(`${this.baseURL}/list`, {
                params: {
                    location_key: locationKey,
                    limit,
                    offset,
                    sort: sortBy
                }
            });
            return response.data;
        } catch (error) {
            console.error('Xotelo API Error:', error);
            throw new Error('Failed to fetch hotels list');
        }
    }
}

module.exports = new XoteloService();