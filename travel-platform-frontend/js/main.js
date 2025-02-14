document.addEventListener('DOMContentLoaded', () => {
    // Initialize authentication state
    AuthService.updateAuthUI();

    // Load features if on home page
    const featuresSection = document.getElementById('featuresSection');
    if (featuresSection) {
        loadFeatures();
    }

    // Setup event listeners
    setupEventListeners();
});

async function loadFeatures() {
    try {
        const [attractions, excursions] = await Promise.all([
            ApiService.getAttractions(),
            ApiService.getExcursions()
        ]);

        const featuresSection = document.getElementById('featuresSection');
        featuresSection.innerHTML = `
            <h2>Popular Attractions</h2>
            <div class="attractions-grid">
                ${attractions.map(attraction => `
                    <div class="attraction-card">
                        <img src="${attraction.images[0]}" alt="${attraction.name}">
                        <h3>${attraction.name}</h3>
                        <p>${attraction.description}</p>
                    </div>
                `).join('')}
            </div>

            <h2>Featured Excursions</h2>
            <div class="excursions-grid">
                ${excursions.map(excursion => `
                    <div class="excursion-card">
                        <img src="${excursion.images[0]}" alt="${excursion.name}">
                        <h3>${excursion.name}</h3>
                        <p>${excursion.description}</p>
                        <p class="price">$${excursion.price}</p>
                        <button class="btn book-btn" data-id="${excursion._id}">Book Now</button>
                    </div>
                `).join('')}
            </div>
        `;

        // Add event listeners to booking buttons
        document.querySelectorAll('.book-btn').forEach(btn => {
            btn.addEventListener('click', handleBooking);
        });
    } catch (error) {
        console.error('Error loading features:', error);
    }
}

function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            AuthService.logout();
        });
    }

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.querySelector('.nav-menu').classList.toggle('active');
        });
    }
}

async function handleBooking(e) {
    if (!AuthService.isAuthenticated()) {
        window.location.href = '/pages/login.html';
        return;
    }

    const excursionId = e.target.dataset.id;
    try {
        const booking = await ApiService.createBooking({
            excursionId,
            date: new Date().toISOString()
        });

        alert('Booking successful!');
    } catch (error) {
        console.error('Booking failed:', error);
        alert('Failed to book excursion. Please try again.');
    }
}