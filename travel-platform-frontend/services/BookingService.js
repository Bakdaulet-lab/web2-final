class BookingService {
    static async getUserBookings() {
        try {
            const response = await ApiService.getUserBookings();
            if (!response.success) {
                throw new Error(response.error || 'Failed to fetch bookings');
            }
            return response.bookings;
        } catch (error) {
            console.error('Error fetching bookings:', error);
            throw error;
        }
    }

    static async createBooking(bookingData) {
        try {
            const response = await ApiService.createBooking(bookingData);
            if (!response.success) {
                throw new Error(response.error || 'Failed to create booking');
            }
            return response.booking;
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    }
}