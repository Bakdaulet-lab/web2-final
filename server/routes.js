const express = require("express");
const router = express.Router();
const userController = require("./userController.js");
const authenticate = require("./middlewares/auth").authenticate;
const { validateRegister, validateLogin } = require("./middlewares/validation");
const paymentRoutes = require('./routes/paymentRoutes');
const path = require('path');
const amadeusService = require('./services/amadeusService');

// Import controllers
const itineraryController = require("./controllers/itineraryController.js");
const bookingController = require("./controllers/bookingController.js");
const attractionController = require("./controllers/attractionController.js");
const excursionController = require("./controllers/excursionController.js");
const flightController = require("./controllers/flightController.js");
const accommodationController = require("./controllers/accommodationController.js");
const authController = require('./controllers/authController');

// Basic routes
router.get("/", userController.getHomePage);
router.get("/sign", userController.getSignPage);
router.get("/login", userController.getLoginPage);
router.get("/profile", authenticate, userController.getProfilePage);

// Auth routes
router.post("/register", validateRegister, userController.registerUser);
router.post("/login", validateLogin, userController.loginUser);
router.post('/auth/login', authController.login);
router.post('/auth/verify-otp', authController.verifyOTP);

// User routes
router.get("/profile", authenticate, userController.getProfile);
router.get("/users", authenticate, userController.getUsers);
router.put("/users/:id", authenticate, userController.updateUser);
router.delete("/users/:id", authenticate, userController.deleteUser);

// Payment routes
router.use('/payments', paymentRoutes);

// Itinerary routes
router.post("/itineraries", authenticate, itineraryController.createItinerary);
router.get("/itineraries", authenticate, itineraryController.getUserItineraries);
router.put("/itineraries/:itineraryId", authenticate, itineraryController.updateItinerary);
router.delete("/itineraries/:itineraryId", authenticate, itineraryController.deleteItinerary);

// Booking routes
router.post("/bookings", authenticate, bookingController.createBooking);
router.get("/bookings", authenticate, bookingController.getUserBookings);
router.put("/bookings/:bookingId", authenticate, bookingController.updateBooking);
router.delete("/bookings/:bookingId", authenticate, bookingController.deleteBooking);

// Attraction routes
router.post("/attractions", authenticate, attractionController.createAttraction);
router.get("/attractions", attractionController.getAttractions);
router.post("/attractions/:attractionId/reviews", authenticate, attractionController.addReview);

// Excursion routes
router.post("/excursions", authenticate, excursionController.createExcursion);
router.get("/excursions", excursionController.getExcursions);
router.put("/excursions/:excursionId", authenticate, excursionController.updateExcursion);
router.delete("/excursions/:excursionId", authenticate, excursionController.deleteExcursion);

// Flight routes
router.post("/flights", authenticate, flightController.createFlight);
router.get("/flights", authenticate, flightController.getFlights); // Add authenticate middleware
router.put("/flights/:flightId", authenticate, flightController.updateFlight);
router.delete("/flights/:flightId", authenticate, flightController.deleteFlight);
router.post('/flights/book', authenticate, flightController.bookFlight);
router.get('/flights/bookings', authenticate, flightController.getUserBookings);

// Accommodation routes
router.post("/accommodations", authenticate, accommodationController.createAccommodation);
router.get("/accommodations", accommodationController.getAccommodations);
router.put("/accommodations/:accommodationId", authenticate, accommodationController.updateAccommodation);
router.delete("/accommodations/:accommodationId", authenticate, accommodationController.deleteAccommodation);

// Booking processing routes
router.post("/book", authenticate, userController.processBooking);
router.post("/send-email", authenticate, userController.sendConfirmationEmail);
router.post("/itinerary/generate", authenticate, userController.generateItinerary);
router.put("/itinerary/update", authenticate, userController.updateItinerary);

// Hotel search and booking routes
router.get("/hotels/search", authenticate, accommodationController.searchHotels);
router.post('/hotels/book', authenticate, accommodationController.bookHotel);

// Test routes
router.post("/test-email", async (req, res) => {
    try {
        await sendOTPEmail(process.env.EMAIL_USER, "123456");
        res.status(200).json({ message: "Test email sent successfully" });
    } catch (error) {
        console.error("Test email failed:", error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/test-amadeus', async (req, res) => {
    try {
        const token = await amadeusService.getToken();
        res.json({ 
            success: true, 
            token 
        });
    } catch (error) {
        console.error('Amadeus test error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to get Amadeus token' 
        });
    }
});

module.exports = router;


