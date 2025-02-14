class FlightPage {
    constructor() {
        this.searchForm = document.getElementById('flightSearchForm');
        this.resultsSection = document.getElementById('flightResults');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.searchForm.addEventListener('submit', this.handleSearch.bind(this));
        
        // Add debounced autocomplete for origin/destination
        const originInput = document.getElementById('origin');
        const destinationInput = document.getElementById('destination');
        
        this.setupAutocomplete(originInput);
        this.setupAutocomplete(destinationInput);
    }

    setupAutocomplete(input) {
        let timeout;
        input.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => this.searchAirports(e.target.value, e.target), 300);
        });
    }

    async searchAirports(query, input) {
        if (query.length < 2) return;

        try {
            const airports = await ApiService.searchAirports(query);
            this.showAirportSuggestions(airports, input);
        } catch (error) {
            console.error('Error searching airports:', error);
        }
    }

    showAirportSuggestions(airports, input) {
        let suggestionsContainer = input.nextElementSibling;
        if (!suggestionsContainer || !suggestionsContainer.classList.contains('suggestions')) {
            suggestionsContainer = document.createElement('div');
            suggestionsContainer.className = 'suggestions';
            input.parentNode.insertBefore(suggestionsContainer, input.nextSibling);
        }

        suggestionsContainer.innerHTML = airports.map(airport => `
            <div class="suggestion" data-code="${airport.code}">
                ${airport.city} (${airport.code})
                <small>${airport.country}</small>
            </div>
        `).join('');

        suggestionsContainer.addEventListener('click', (e) => {
            const suggestion = e.target.closest('.suggestion');
            if (suggestion) {
                input.value = suggestion.textContent.trim();
                suggestionsContainer.innerHTML = '';
            }
        });
    }

    async handleSearch(e) {
        e.preventDefault();
        this.showLoading();

        const formData = {
            origin: document.getElementById('origin').value,
            destination: document.getElementById('destination').value,
            departureDate: document.getElementById('departureDate').value
        };

        const errors = ValidationService.validateForm(formData, {
            origin: ['required'],
            destination: ['required'],
            departureDate: ['required', 'date']
        });

        if (Object.keys(errors).length) {
            this.showErrors(errors);
            this.hideLoading();
            return;
        }

        try {
            const flights = await ApiService.searchFlights(formData);
            this.displayResults(flights);
        } catch (error) {
            console.error('Search error:', error);
            ToastService.error('Failed to search flights');
        } finally {
            this.hideLoading();
        }
    }

    showLoading() {
        this.resultsSection.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p class="loading-text">Searching flights...</p>
            </div>
        `;
    }

    hideLoading() {
        const spinner = this.resultsSection.querySelector('.loading-spinner');
        if (spinner) spinner.remove();
    }

    showErrors(errors) {
        for (const [field, fieldErrors] of Object.entries(errors)) {
            const input = document.getElementById(field);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = fieldErrors[0];
            input.parentNode.appendChild(errorDiv);
            input.classList.add('error');
        }
    }

    displayResults(flights) {
        if (!flights.length) {
            this.resultsSection.innerHTML = `
                <div class="no-results">
                    <h3>No Flights Found</h3>
                    <p>Try adjusting your search criteria</p>
                </div>
            `;
            return;
        }

        this.resultsSection.innerHTML = `
            <div class="flights-grid">
                ${flights.map(flight => this.createFlightCard(flight)).join('')}
            </div>
        `;
    }

    createFlightCard(flight) {
        return `
            <div class="flight-card card-hover">
                <div class="flight-header">
                    <h4>${flight.airline}</h4>
                    <p class="flight-number">Flight ${flight.flightNumber}</p>
                </div>
                <div class="flight-details">
                    <div class="flight-time">
                        <p class="time">${this.formatTime(flight.departureTime)}</p>
                        <p class="location">${flight.origin}</p>
                    </div>
                    <div class="flight-duration">
                        <p>${this.calculateDuration(flight.departureTime, flight.arrivalTime)}</p>
                        <div class="flight-line"></div>
                    </div>
                    <div class="flight-time">
                        <p class="time">${this.formatTime(flight.arrivalTime)}</p>
                        <p class="location">${flight.destination}</p>
                    </div>
                </div>
                <div class="flight-footer">
                    <p class="price">$${flight.price.toFixed(2)}</p>
                    <button class="btn" onclick="bookFlight('${flight._id}')">Book Now</button>
                </div>
            </div>
        `;
    }

    formatTime(dateString) {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    calculateDuration(departure, arrival) {
        const diff = new Date(arrival) - new Date(departure);
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    if (!AuthService.isAuthenticated()) {
        window.location.href = '/pages/login.html';
        return;
    }

    ToastService.init();
    new FlightPage();
});