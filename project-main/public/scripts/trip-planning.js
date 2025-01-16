// Google Maps API Key (replace with your own)
const GOOGLE_MAPS_API_KEY = "AlzaSyO8IHiUlDUSdrBHiOSWRrZdpiqQvan6afi";

// Mock attractions data
const attractions = [
  { name: "Eiffel Tower", lat: 48.8584, lng: 2.2945, budget: "medium", duration: "1-3", interest: "luxury" },
  { name: "Louvre Museum", lat: 48.8606, lng: 2.3376, budget: "high", duration: "4-7", interest: "family-friendly" },
  { name: "Notre-Dame Cathedral", lat: 48.853, lng: 2.3499, budget: "low", duration: "1-3", interest: "adventure" },
];

// Initialize Google Map
function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 48.8566, lng: 2.3522 }, // Default to Paris
    zoom: 12,
  });

  // Add markers for attractions
  attractions.forEach((attraction) => {
    new google.maps.Marker({
      position: { lat: attraction.lat, lng: attraction.lng },
      map,
      title: attraction.name,
    });
  });
}

// Display attractions in the list
function displayAttractions(filteredAttractions) {
  const attractionsList = document.getElementById("attractionsList");
  attractionsList.innerHTML = ""; // Clear previous results

  filteredAttractions.forEach((attraction) => {
    const attractionItem = document.createElement("div");
    attractionItem.className = "p-4 border border-gray-300 rounded-lg hover:bg-gray-50";
    attractionItem.innerHTML = `
      <h3 class="text-xl font-semibold">${attraction.name}</h3>
      <p class="text-gray-600">Lat: ${attraction.lat}, Lng: ${attraction.lng}</p>
    `;
    attractionsList.appendChild(attractionItem);
  });
}

// Handle search and filters
document.getElementById("searchBtn").addEventListener("click", () => {
  const destination = document.getElementById("destination").value.toLowerCase();
  const budget = document.getElementById("budget").value;
  const duration = document.getElementById("duration").value;
  const interest = document.getElementById("interest").value;

  // Filter attractions
  const filteredAttractions = attractions.filter((attraction) => {
    return (
      attraction.name.toLowerCase().includes(destination) &&
      (budget === "" || attraction.budget === budget) &&
      (duration === "" || attraction.duration === duration) &&
      (interest === "" || attraction.interest === interest)
    );
  });

  // Display filtered attractions
  displayAttractions(filteredAttractions);
});

// Initialize the map when the page loads
window.initMap = initMap;