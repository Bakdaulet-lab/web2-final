class PlacesService {
    static API_KEY = 'AlzaSyh2IRdJl8kCsIQfSIyMAAPu4Wg6CrJu7sN';
    static BASE_URL = 'https://maps.gomaps.pro/maps/api';

    static async textSearch(params) {
        try {
            const queryParams = new URLSearchParams({
                key: this.API_KEY,
                language: 'en',
                ...params
            });

            const response = await fetch(`${this.BASE_URL}/place/textsearch/json?${queryParams}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'ZERO_RESULTS') {
                return { status: 'OK', results: [] };
            }
            
            if (data.status !== 'OK') {
                throw new Error(data.error_message || 'Places API returned an error');
            }

            return data;
        } catch (error) {
            console.error('Places API Error:', error);
            throw error;
        }
    }

    static async getPhotoUrl(photoReference, maxWidth = 400) {
        return `${this.BASE_URL}/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${this.API_KEY}`;
    }

    static async getPlaceDetails(placeId) {
        try {
            const queryParams = new URLSearchParams({
                key: this.API_KEY,
                place_id: placeId,
                language: 'en',
                fields: 'name,formatted_address,photos,rating,reviews,website,formatted_phone_number,opening_hours,price_level,types'
            });

            const response = await fetch(`${this.BASE_URL}/place/details/json?${queryParams}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.status !== 'OK') {
                throw new Error(data.error_message || 'Failed to get place details');
            }

            return data.result;
        } catch (error) {
            console.error('Place Details API Error:', error);
            throw error;
        }
    }
}