class FlightService {
    static async searchFlights(searchParams) {
        try {
            const response = await ApiService.request('/flights', {
                method: 'GET',
                params: searchParams
            });

            if (!response.success) {
                throw new Error(response.error || 'Failed to fetch flights');
            }

            return response;
        } catch (error) {
            console.error('Flight search error:', error);
            throw error;
        }
    }

    static async bookFlight(bookingData) {
        try {
            const response = await ApiService.request('/flights/book', {
                method: 'POST',
                body: JSON.stringify(bookingData)
            });

            if (!response.success) {
                throw new Error(response.error || 'Failed to book flight');
            }

            return response;
        } catch (error) {
            console.error('Flight booking error:', error);
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

class FlightUI {
    constructor() {
        this.searchForm = document.getElementById('flightSearchForm');
        this.resultsSection = document.getElementById('flightResults');
        this.bookingModal = document.getElementById('bookingModal');
        this.selectedFlight = null;

        this.init();
    }

    init() {
        if (!AuthService.isAuthenticated()) {
            window.location.href = '/pages/login.html';
            return;
        }
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.searchForm.addEventListener('submit', this.handleSearch.bind(this));
        document.getElementById('bookingForm').addEventListener('submit', this.handleBooking.bind(this));

        // Close modal handlers
        const closeBtn = this.bookingModal.querySelector('.close');
        closeBtn.onclick = () => this.bookingModal.style.display = 'none';
        window.onclick = (e) => {
            if (e.target === this.bookingModal) {
                this.bookingModal.style.display = 'none';
            }
        };
    }

    async handleSearch(e) {
        e.preventDefault();
        const searchButton = e.target.querySelector('button[type="submit"]');
        searchButton.disabled = true;

        try {
            const searchParams = {
                origin: document.getElementById('origin').value,
                destination: document.getElementById('destination').value,
                departureDate: document.getElementById('departureDate').value,
                passengers: document.getElementById('passengers').value,
                priceRange: document.getElementById('priceRange').value,
                stops: document.getElementById('stops').value
            };

            const response = await FlightService.searchFlights(searchParams);
            this.displayResults(response.flights);
        } catch (error) {
            console.error('Search error:', error);
            ToastService.error(error.message);
            this.showError();
        } finally {
            searchButton.disabled = false;
        }
    }

    displayResults(flights) {
        if (!flights?.length) {
            this.resultsSection.innerHTML = '<div class="no-results">No flights found matching your criteria.</div>';
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
            <div class="flight-card">
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
                        ${flight.stops ? `<span class="stops">${flight.stops} stop${flight.stops > 1 ? 's' : ''}</span>` : ''}
                    </div>
                    <div class="flight-time">
                        <p class="time">${this.formatTime(flight.arrivalTime)}</p>
                        <p class="location">${flight.destination}</p>
                    </div>
                </div>
                <div class="flight-footer">
                    <div class="price-info">
                        <p class="price">${FlightService.formatPrice(flight.price)}</p>
                        <p class="seats">${flight.seats} seats left</p>
                    </div>
                    <button class="btn btn-primary" onclick="flightUI.showBookingModal(${JSON.stringify(flight)})">
                        Book Now
                    </button>
                </div>
            </div>
        `;
    }

    showBookingModal(flight) {
        this.selectedFlight = flight;
        const taxAmount = Math.round(flight.price * 0.1);
        const totalAmount = flight.price + taxAmount;

        document.getElementById('selectedFlightInfo').innerHTML = `
            <div class="flight-summary">
                <h4>${flight.airline} - Flight ${flight.flightNumber}</h4>
                <p>${flight.origin} → ${flight.destination}</p>
                <p>Departure: ${new Date(flight.departureTime).toLocaleString()}</p>
                <p>Class: ${flight.class}</p>
            </div>
        `;

        document.getElementById('ticketPrice').textContent = FlightService.formatPrice(flight.price);
        document.getElementById('taxAmount').textContent = FlightService.formatPrice(taxAmount);
        document.getElementById('totalAmount').textContent = FlightService.formatPrice(totalAmount);

        this.bookingModal.style.display = 'block';
    }

    async handleBooking(e) {
        e.preventDefault();
        const form = e.target;
        const bookingButton = form.querySelector('button[type="submit"]');
        bookingButton.disabled = true;

        try {
            const bookingData = this.getBookingData();
            const errors = this.validateBookingData(bookingData);

            if (Object.keys(errors).length > 0) {
                this.showFormErrors(errors);
                throw new Error('Please fill in all required fields correctly');
            }

            const response = await FlightService.bookFlight(bookingData);
            ToastService.success('Flight booked successfully!');
            this.bookingModal.style.display = 'none';
        } catch (error) {
            console.error('Booking error:', error);
            ToastService.error(error.message);
        } finally {
            bookingButton.disabled = false;
        }
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

    showError() {
        this.resultsSection.innerHTML = `
            <div class="error-state">
                <p>Unable to complete your search at this time.</p>
                <button class="btn btn-secondary" onclick="window.location.reload()">Try Again</button>
            </div>
        `;
    }
}

// Initialize the page
const flightUI = new FlightUI();