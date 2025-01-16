const express = require("express");
const {
  getHomePage,
  getSignPage,
  getLoginPage,
  getProfilePage,
  registerUser,
  loginUser,
  getProfile,
  getUsers,
  updateUser, 
  deleteUser,
  processBooking, 
  sendConfirmationEmail,
  generateItinerary, 
  
  processPayment 
} = require("./userController.js");



const {
  createItinerary,
  getUserItineraries,
  updateItinerary,
  deleteItinerary,
} = require("./controllers/itineraryController.js");

const {
  createBooking,
  getUserBookings,
  updateBooking,
  deleteBooking,
} = require("./controllers/bookingController.js");

const {
  createAttraction,
  getAttractions,
  addReview,
} = require("./controllers/attractionController.js");

const {
  createExcursion,
  getExcursions,
  updateExcursion,
  deleteExcursion,
} = require("./controllers/excursionController.js");

const {
  createFlight,
  getFlights,
  updateFlight,
  deleteFlight,
} = require("./controllers/flightController.js");

const {
  createAccommodation,
  getAccommodations,
  updateAccommodation,
  deleteAccommodation,
} = require("./controllers/accommodationController.js");


const authenticate = require("./middlewares/auth");
const paymentRoutes = require('./routes/paymentRoutes');


const router = express.Router();






router.get("/", getHomePage);
router.get("/sign", getSignPage);
router.get("/login", getLoginPage);


router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes (require JWT authentication)
router.get("/profile", authenticate, getProfile);
router.get("/users", authenticate, getUsers);
router.put("/users/:id", authenticate, updateUser);
router.delete("/users/:id", authenticate, deleteUser);



// Booking endpoint
router.post("/book", processBooking);

// Send confirmation email
router.post("/send-email", sendConfirmationEmail);


// Generate itinerary
router.post("/itinerary/generate", generateItinerary);

// Update itinerary
router.put("/itinerary/update", updateItinerary);

router.use('/payments', paymentRoutes);


// Itinerary routes
router.post("/itineraries", createItinerary);
router.get("/itineraries/:userId", getUserItineraries);
router.put("/itineraries/:itineraryId", updateItinerary);
router.delete("/itineraries/:itineraryId", deleteItinerary);

// Booking routes
router.post("/bookings", createBooking);
router.get("/bookings/:userId", getUserBookings);
router.put("/bookings/:bookingId", updateBooking);
router.delete("/bookings/:bookingId", deleteBooking);

// Attraction routes
router.post("/attractions", createAttraction);
router.get("/attractions", getAttractions);
router.post("/attractions/:attractionId/reviews", addReview);


// Excursion routes
router.post("/excursions", createExcursion);
router.get("/excursions", getExcursions);
router.put("/excursions/:excursionId", updateExcursion);
router.delete("/excursions/:excursionId", deleteExcursion);

// Flight routes
router.post("/flights", createFlight);
router.get("/flights", getFlights);
router.put("/flights/:flightId", updateFlight);
router.delete("/flights/:flightId", deleteFlight);

// Accommodation routes
router.post("/accommodations", createAccommodation);
router.get("/accommodations", getAccommodations);
router.put("/accommodations/:accommodationId", updateAccommodation);
router.delete("/accommodations/:accommodationId", deleteAccommodation);


module.exports = router;
