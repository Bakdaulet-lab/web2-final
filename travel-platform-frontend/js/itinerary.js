class ItineraryService {
    static async createItinerary(itineraryData) {
        try {
            return await ApiService.request('/itineraries', {
                method: 'POST',
                body: JSON.stringify(itineraryData)
            });
        } catch (error) {
            console.error('Error creating itinerary:', error);
            throw error;
        }
    }

    static async updateItinerary(itineraryId, updates) {
        try {
            return await ApiService.request(`/itineraries/${itineraryId}`, {
                method: 'PUT',
                body: JSON.stringify(updates)
            });
        } catch (error) {
            console.error('Error updating itinerary:', error);
            throw error;
        }
    }

    static async deleteItinerary(itineraryId) {
        try {
            return await ApiService.request(`/itineraries/${itineraryId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error deleting itinerary:', error);
            throw error;
        }
    }

    static async getUserItineraries() {
        try {
            return await ApiService.request('/itineraries/user');
        } catch (error) {
            console.error('Error fetching user itineraries:', error);
            throw error;
        }
    }
}