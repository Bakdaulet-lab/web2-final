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
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }

            const queryParams = new URLSearchParams({
                origin: params.origin,
                destination: params.destination,
                departureDate: params.departureDate,
                passengers: params.passengers,
                priceRange: params.priceRange,
                stops: params.stops
            });

            const response = await fetch(`${ApiService.BASE_URL}/flights?${queryParams}`, {
                method: 'GET',
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
            console.error('Error searching flights:', error);
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