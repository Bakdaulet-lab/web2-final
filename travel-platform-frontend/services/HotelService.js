class HotelService {
    static async searchHotels(params) {
        try {
            const queryString = new URLSearchParams({
                locationKey: params.locationKey,
                checkIn: params.checkIn,
                checkOut: params.checkOut,
                rooms: params.rooms || 1,
                adults: params.adults || 2,
                sortBy: params.sortBy || 'best_value',
                limit: params.limit || 30,
                offset: params.offset || 0
            }).toString();

            const response = await fetch(`http://localhost:3000/api/hotels/search?${queryString}`, {
                headers: {
                    'Authorization': `Bearer ${AuthService.getAccessToken()}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to search hotels');
            }

            return data;
        } catch (error) {
            console.error('Hotel search error:', error);
            throw error;
        }
    }

    static async bookHotel(bookingData) {
        try {
            const response = await fetch('http://localhost:3000/api/hotels/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AuthService.getAccessToken()}`
                },
                body: JSON.stringify(bookingData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Booking failed');
            }

            return data;
        } catch (error) {
            console.error('Error booking hotel:', error);
            throw error;
        }
    }

    static getBestPrice(hotel) {
        if (!hotel.rates || hotel.rates.length === 0) return null;
        
        return hotel.rates.reduce((min, rate) => {
            return rate.rate < min.rate ? rate : min;
        }, hotel.rates[0]);
    }

    static formatPrice(price, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(price);
    }
}

window.HotelService = HotelService;