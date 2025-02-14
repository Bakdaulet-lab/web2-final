class HotelService {
    static async searchHotels(params) {
        try {
            const response = await ApiService.request('/hotels/search', {
                method: 'GET',
                params: {
                    cityCode: params.city,
                    checkInDate: params.checkIn,
                    checkOutDate: params.checkOut,
                    adults: params.adults,
                    roomQuantity: params.rooms,
                    amenities: params.amenities?.join(','),
                    ratings: params.ratings,
                    currency: params.currency
                }
            });

            return response;
        } catch (error) {
            console.error('Hotel search error:', error);
            throw new Error(error.response?.data?.message || 'Failed to search hotels');
        }
    }

    static async bookHotel(bookingData) {
        try {
            const response = await ApiService.request('/hotels/book', {
                method: 'POST',
                body: JSON.stringify(bookingData)
            });
            return response;
        } catch (error) {
            console.error('Error booking hotel:', error);
            throw error;
        }
    }

    static getBestPrice(hotel) {
        if (!hotel.offers || hotel.offers.length === 0) return null;
        
        return hotel.offers.reduce((min, offer) => {
            const total = parseFloat(offer.price.total);
            return total < parseFloat(min.price.total) ? offer : min;
        }, hotel.offers[0]);
    }

    static formatPrice(price, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(price);
    }

    static async getCityCode(cityName) {
        try {
            const response = await ApiService.request('/hotels/city-code', {
                params: { city: cityName }
            });
            return response.cityCode;
        } catch (error) {
            console.error('Error getting city code:', error);
            throw error;
        }
    }
}