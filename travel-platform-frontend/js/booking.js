class BookingService {
    static async createBooking(bookingData) {
        try {
            return await ApiService.request('/bookings', {
                method: 'POST',
                body: JSON.stringify(bookingData)
            });
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    }

    static async getUserBookings() {
        try {
            return await ApiService.request('/bookings/user');
        } catch (error) {
            console.error('Error fetching user bookings:', error);
            throw error;
        }
    }

    static async updateBooking(bookingId, updates) {
        try {
            return await ApiService.request(`/bookings/${bookingId}`, {
                method: 'PUT',
                body: JSON.stringify(updates)
            });
        } catch (error) {
            console.error('Error updating booking:', error);
            throw error;
        }
    }

    static async cancelBooking(bookingId) {
        try {
            return await ApiService.request(`/bookings/${bookingId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error canceling booking:', error);
            throw error;
        }
    }
}