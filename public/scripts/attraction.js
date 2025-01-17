let map;

// Initialize the map
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 0, lng: 0 },
    zoom: 2,
  });
}

// Show the selected attraction on the map
function showMap(lat, lng) {
  const position = { lat, lng };
  map.setCenter(position);
  map.setZoom(15);

  new google.maps.Marker({
    position,
    map,
    title: "Attraction Location",
  });
}