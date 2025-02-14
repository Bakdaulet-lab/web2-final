async function handleFlightSearch(e) {
    e.preventDefault();
    const searchButton = e.target.querySelector('button[type="submit"]');
    searchButton.disabled = true;

    try {
        if (!AuthService.isAuthenticated()) {
            window.location.href = '/pages/login.html';
            return;
        }

        const searchParams = {
            origin: document.getElementById('origin').value,
            destination: document.getElementById('destination').value,
            departureDate: document.getElementById('departureDate').value,
            passengers: document.getElementById('passengers').value,
            priceRange: document.getElementById('priceRange').value,
            stops: document.getElementById('stops').value
        };

        const response = await FlightService.searchFlights(searchParams);
        
        if (response.success) {
            displayFlights(response.flights);
        } else {
            throw new Error(response.error);
        }
    } catch (error) {
        console.error('Search error:', error);
        ToastService.error(error.message || 'Failed to search flights');
        document.getElementById('flightResults').innerHTML = `
            <div class="error-state">
                <p>Unable to complete your search at this time.</p>
                <button class="btn btn-secondary" onclick="retrySearch()">Try Again</button>
            </div>
        `;
    } finally {
        searchButton.disabled = false;
    }
}