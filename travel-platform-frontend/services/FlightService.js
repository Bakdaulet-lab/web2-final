class FlightService {
    static async bookFlight(bookingData) {
        try {
            const response = await ApiService.request('/flights/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AuthService.getToken()}`
                },
                body: JSON.stringify(bookingData)
            });

            if (!response.success) {
                throw new Error(response.error || 'Failed to book flight');
            }

            return response;
        } catch (error) {
            console.error('Error booking flight:', error);
            throw error;
        }
    }

    static async getUserFlightBookings() {
        try {
            const response = await ApiService.request('/flights/bookings', {
                headers: {
                    'Authorization': `Bearer ${AuthService.getToken()}`
                }
            });
            return response;
        } catch (error) {
            console.error('Error fetching flight bookings:', error);
            throw error;
        }
    }

    static async searchFlights(params) {
        try {
            const queryString = new URLSearchParams({
                origin: params.origin,
                destination: params.destination,
                departureDate: params.departureDate,
                passengers: params.passengers || 1,
                priceRange: params.priceRange,
                stops: params.stops
            }).toString();

            // Try to refresh token if expired
            const token = await AuthService.getValidToken();

            const response = await fetch(`http://localhost:3000/api/flights?${queryString}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch flights');
            }

            return data;
        } catch (error) {
            console.error('Flight search error:', error);
            throw error;
        }
    }

    static formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }
}