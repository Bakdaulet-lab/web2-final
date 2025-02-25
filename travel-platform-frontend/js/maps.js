let map;
let service;
let infowindow;
let markers = [];
let currentLocation;
let activeFilter = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!AuthService.isAuthenticated()) {
        window.location.href = '/pages/login.html';
        return;
    }
    initMap();
    setupFilterButtons();
});

function initMap() {
    const defaultCenter = { lat: 43.238949, lng: 76.889709 }; // Almaty coordinates

    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultCenter,
        zoom: 13,
        styles: [
            {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
            }
        ]
    });

    infowindow = new google.maps.InfoWindow();
    service = new google.maps.places.PlacesService(map);

    // Get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(currentLocation);
                searchNearby();
            },
            () => {
                console.error('Geolocation failed');
            }
        );
    }

    setupSearch();
}

// Add this new function to set up filter buttons
function setupFilterButtons() {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const type = button.dataset.type;
            
            // Toggle active state
            if (activeFilter === type) {
                activeFilter = null;
                button.classList.remove('active');
                searchNearby(); // Reset to default search
            } else {
                activeFilter = type;
                buttons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                filterPlaces(type);
            }
        });
    });
}

function setupSearch() {
    const searchBox = new google.maps.places.SearchBox(
        document.getElementById('searchInput')
    );

    map.addListener('bounds_changed', () => {
        searchBox.setBounds(map.getBounds());
    });

    searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();
        if (places.length === 0) return;
        showPlacesOnMap(places);
    });
}

// Update searchNearby function
async function searchNearby() {
    const searchInput = document.getElementById('searchInput').value;
    const radiusValue = document.getElementById('radiusFilter')?.value || 2000;
    const isOpenNow = document.getElementById('openNow')?.checked;

    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay?.classList.remove('hidden');

    try {
        if (!currentLocation) {
            throw new Error('Location not available. Please enable location services.');
        }

        const searchParams = {
            query: searchInput || 'tourist attractions',
            location: `${currentLocation.lat},${currentLocation.lng}`,
            radius: radiusValue,
            opennow: isOpenNow || undefined,
            type: activeFilter || undefined
        };

        const response = await PlacesService.textSearch(searchParams);
        
        clearMarkers();

        if (!response.results || response.results.length === 0) {
            document.getElementById('placeDetails').innerHTML = `
                <div class="no-results">
                    <p>No places found matching your criteria.</p>
                </div>
            `;
            return;
        }

        // Filter results if rating filter is active
        const ratingFilter = document.getElementById('ratingFilter')?.value;
        let filteredResults = response.results;
        if (ratingFilter) {
            filteredResults = response.results.filter(place => place.rating >= parseFloat(ratingFilter));
        }

        if (filteredResults.length === 0) {
            document.getElementById('placeDetails').innerHTML = `
                <div class="no-results">
                    <p>No places match your rating criteria.</p>
                </div>
            `;
            return;
        }

        showPlacesOnMap(filteredResults);

    } catch (error) {
        console.error('Search error:', error);
        document.getElementById('placeDetails').innerHTML = `
            <div class="error-state">
                <p>Error searching places: ${error.message}</p>
                <button class="btn btn-primary" onclick="searchNearby()">Try Again</button>
            </div>
        `;
    } finally {
        loadingOverlay?.classList.add('hidden');
    }
}

function showPlacesOnMap(places) {
    const bounds = new google.maps.LatLngBounds();

    places.forEach(place => {
        if (!place.geometry || !place.geometry.location) return;

        const marker = new google.maps.Marker({
            map,
            title: place.name,
            position: place.geometry.location,
            animation: google.maps.Animation.DROP
        });

        markers.push(marker);
        bounds.extend(place.geometry.location);

        marker.addListener('click', () => {
            showPlaceDetails(place);
        });
    });

    map.fitBounds(bounds);
}

async function showPlaceDetails(place) {
    const placeDetails = document.getElementById('placeDetails');
    placeDetails.innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';

    try {
        const details = await PlacesService.getPlaceDetails(place.place_id);
        
        const priceLevel = '💰'.repeat(details.price_level || 0);
        const placeTypes = details.types
            ?.filter(type => !['establishment', 'point_of_interest'].includes(type))
            .map(type => type.replace(/_/g, ' '))
            .slice(0, 3)
            .join(', ');

        placeDetails.innerHTML = `
            <div class="place-details-container">
                <h3>${details.name}</h3>
                
                ${details.photos ? `
                    <div class="photo-gallery">
                        ${details.photos.slice(0, 3).map(photo => `
                            <img src="${PlacesService.getPhotoUrl(photo.photo_reference)}" 
                                 class="place-photo" 
                                 alt="${details.name}"
                                 onclick="showFullImage(this.src)">
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="place-info">
                    <p class="place-type">${placeTypes}</p>
                    
                    ${details.rating ? `
                        <div class="rating-container">
                            <span class="rating">${details.rating}</span>
                            <span class="stars">${'⭐'.repeat(Math.round(details.rating))}</span>
                            <span class="review-count">(${details.reviews?.length || 0} reviews)</span>
                            ${priceLevel ? `<span class="price-level">${priceLevel}</span>` : ''}
                        </div>
                    ` : ''}
                    
                    <div class="contact-info">
                        <p><i class="fas fa-map-marker-alt"></i> ${details.formatted_address}</p>
                        ${details.formatted_phone_number ? 
                            `<p><i class="fas fa-phone"></i> ${details.formatted_phone_number}</p>` : ''}
                        ${details.website ? 
                            `<p><i class="fas fa-globe"></i> <a href="${details.website}" target="_blank">Visit Website</a></p>` : ''}
                    </div>
                    
                    ${details.opening_hours ? `
                        <div class="opening-hours">
                            <h4>Opening Hours</h4>
                            <p class="open-status ${details.opening_hours.open_now ? 'open' : 'closed'}">
                                ${details.opening_hours.open_now ? 'Open Now' : 'Closed'}
                            </p>
                            <div class="hours-list">
                                ${details.opening_hours.weekday_text?.map(day => `
                                    <p>${day}</p>
                                `).join('') || ''}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${details.reviews ? `
                        <div class="reviews-section">
                            <h4>Recent Reviews</h4>
                            ${details.reviews.slice(0, 3).map(review => `
                                <div class="review-card">
                                    <div class="review-header">
                                        <img src="${review.profile_photo_url}" alt="Reviewer" class="reviewer-photo">
                                        <div class="reviewer-info">
                                            <strong>${review.author_name}</strong>
                                            <span class="review-date">${new Date(review.time * 1000).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div class="review-rating">${'⭐'.repeat(review.rating)}</div>
                                    <p class="review-text">${review.text}</p>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    } catch (error) {
        placeDetails.innerHTML = `
            <div class="error-state">
                <p>Error loading place details: ${error.message}</p>
                <button class="btn btn-primary" onclick="showPlaceDetails('${place.place_id}')">Try Again</button>
            </div>
        `;
    }
}

// Add this helper function for full-size image viewing
function showFullImage(src) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <img src="${src}" alt="Full size image">
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.close').onclick = () => {
        modal.remove();
    };
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

// Update filterPlaces function
function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

// Update filterPlaces function
async function filterPlaces(type) {
    if (!currentLocation) {
        ToastService.error('Location not available. Please enable location services.');
        return;
    }

    document.getElementById('loadingOverlay').classList.remove('hidden');

    try {
        const searchParams = {
            type: type,
            location: `${currentLocation.lat},${currentLocation.lng}`,
            radius: document.getElementById('radiusFilter').value,
            opennow: document.getElementById('openNow').checked || undefined
        };

        const response = await PlacesService.textSearch(searchParams);

        if (response.status === 'OK') {
            clearMarkers();

            let results = response.results;
            const ratingFilter = document.getElementById('ratingFilter').value;
            
            if (ratingFilter) {
                results = results.filter(place => place.rating >= parseInt(ratingFilter));
            }

            if (results.length === 0) {
                document.getElementById('placeDetails').innerHTML = `
                    <div class="no-results">
                        <p>No ${type.replace('_', ' ')} found nearby matching your criteria.</p>
                    </div>
                `;
            } else {
                showPlacesOnMap(results);
                document.getElementById('placeDetails').innerHTML = `
                    <h3>Nearby ${type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}</h3>
                    <p>Found ${results.length} places</p>
                    <div class="places-list">
                        ${results.map(place => createPlaceListItem(place)).join('')}
                    </div>
                `;
            }
        } else {
            throw new Error(response.error_message || 'Failed to fetch places');
        }
    } catch (error) {
        ToastService.error('Error filtering places: ' + error.message);
    } finally {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }
}

// Helper function to create place list items
function createPlaceListItem(place) {
    return `
        <div class="place-item" onclick="showPlaceDetails('${place.place_id}')">
            <div class="place-item-content">
                ${place.photos ? `
                    <img src="https://maps.gomaps.pro/maps/api/place/photo?maxwidth=100&photoreference=${place.photos[0].photo_reference}&key=${PlacesService.API_KEY}" 
                         alt="${place.name}" 
                         class="place-thumbnail">
                ` : ''}
                <div class="place-info">
                    <h4>${place.name}</h4>
                    <div class="place-meta">
                        ${place.rating ? `
                            <span class="rating">
                                ${place.rating} ⭐ (${place.user_ratings_total})
                            </span>
                        ` : ''}
                        ${place.vicinity ? `
                            <span class="vicinity">${place.vicinity}</span>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}