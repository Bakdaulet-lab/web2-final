class AviationService {
    static API_KEY = '02a6ce2ddbad9a9f40d8b514e51da21e';
    static BASE_URL = 'https://api.aviationstack.com/v1';

    static async searchFlights(params) {
        try {
            const queryParams = new URLSearchParams({
                access_key: this.API_KEY,
                flight_status: 'scheduled',
                dep_iata: params.origin,
                arr_iata: params.destination,
                flight_date: params.departureDate,
                limit: 100
            });

            const response = await fetch(`${this.BASE_URL}/flights?${queryParams}`);
            if (!response.ok) {
                throw new Error('Failed to fetch flights');
            }

            const data = await response.json();

            // Transform API response to match your application's format
            return {
                success: true,
                flights: data.data.map(flight => ({
                    id: flight.flight.iata,
                    airline: flight.airline.name,
                    flightNumber: flight.flight.number,
                    origin: flight.departure.iata,
                    destination: flight.arrival.iata,
                    departureTime: flight.departure.scheduled,
                    arrivalTime: flight.arrival.scheduled,
                    price: this.generateRandomPrice(), // API doesn't provide prices
                    seats: Math.floor(Math.random() * 50) + 1, // API doesn't provide seat availability
                    class: 'Economy',
                    stops: 0,
                    terminal: flight.departure.terminal,
                    gate: flight.departure.gate,
                    status: flight.flight_status,
                    aircraft: flight.aircraft?.registration || 'N/A',
                    duration: this.calculateDuration(
                        flight.departure.scheduled,
                        flight.arrival.scheduled
                    )
                }))
            };
        } catch (error) {
            console.error('Aviation API Error:', error);
            throw error;
        }
    }

    static generateRandomPrice() {
        return Math.floor(Math.random() * (1000 - 200 + 1)) + 200;
    }

    static calculateDuration(departure, arrival) {
        const diff = new Date(arrival) - new Date(departure);
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    }
}