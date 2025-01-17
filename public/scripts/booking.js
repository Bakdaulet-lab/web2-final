// Mock excursions data
const excursions = [
    {
      id: 1,
      name: "City Tour",
      price: 50,
      duration: "3 hours",
      reviews: 4.5,
      image: "images/excursion1.jpg",
    },
    {
      id: 2,
      name: "Mountain Hike",
      price: 80,
      duration: "6 hours",
      reviews: 4.8,
      image: "images/excursion2.jpg",
    },
    {
      id: 3,
      name: "Boat Cruise",
      price: 120,
      duration: "4 hours",
      reviews: 4.7,
      image: "images/excursion3.jpg",
    },
  ];
  
  // Display excursions in the list
  function displayExcursions() {
    const excursionsList = document.getElementById("excursionsList");
    const excursionSelect = document.getElementById("excursion");
  
    excursions.forEach((excursion) => {
      // Add excursion to the list
      const excursionItem = document.createElement("div");
      excursionItem.className = "p-4 border border-gray-300 rounded-lg hover:bg-gray-50";
      excursionItem.innerHTML = `
        <img src="${excursion.image}" alt="${excursion.name}" class="w-full h-48 object-cover rounded-lg mb-4">
        <h3 class="text-xl font-semibold">${excursion.name}</h3>
        <p class="text-gray-600">Price: $${excursion.price}</p>
        <p class="text-gray-600">Duration: ${excursion.duration}</p>
        <p class="text-gray-600">Rating: ${excursion.reviews} ⭐</p>
      `;
      excursionsList.appendChild(excursionItem);
  
      // Add excursion to the booking form dropdown
      const option = document.createElement("option");
      option.value = excursion.id;
      option.textContent = `${excursion.name} - $${excursion.price}`;
      excursionSelect.appendChild(option);
    });
  }
  
  // Handle booking form submission
  document.getElementById("bookingForm").addEventListener("submit", (e) => {
    e.preventDefault();
  
    const excursionId = document.getElementById("excursion").value;
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const date = document.getElementById("date").value;
  
    // Find the selected excursion
    const selectedExcursion = excursions.find((excursion) => excursion.id == excursionId);
  
    if (selectedExcursion) {
      alert(
        `Booking Confirmed!\n\nExcursion: ${selectedExcursion.name}\nName: ${name}\nEmail: ${email}\nDate: ${date}`
      );
    } else {
      alert("Please select a valid excursion.");
    }
  });
  
  // Initialize the page
  displayExcursions();