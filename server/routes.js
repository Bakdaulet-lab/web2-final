const express = require("express");
const router = express.Router();
const userController = require("./userController.js");
const authenticate = require("./middlewares/auth").authenticate;
const { validateRegister, validateLogin } = require("./middlewares/validation");
const paymentRoutes = require('./routes/paymentRoutes');
const path = require('path');
const amadeusService = require('./services/amadeusService');


// Import controllers
const bookingController = require("./controllers/bookingController.js");
const attractionController = require("./controllers/attractionController.js");
const flightController = require("./controllers/flightController.js");
const accommodationController = require("./controllers/accommodationController.js");
const authController = require('./controllers/authController');
const { login, verifyOTP, refreshToken, logout } = require("./controllers/authController");

// Basic routes
router.get("/", userController.getHomePage);
router.get("/sign", userController.getSignPage);
router.get("/login", userController.getLoginPage);
router.get("/profile", authenticate, userController.getProfilePage);

// Auth routes
router.post('/auth/login', login);
router.post('/auth/verify-otp', verifyOTP);
router.post('/auth/refresh', refreshToken);
router.post('/auth/logout', authenticate, logout);
// Update the registration route
router.post('/auth/register', validateRegister, userController.registerUser);

// User routes
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateUser);
router.get('/users', authenticate, userController.getUsers);
router.put('/users/:id', authenticate, userController.updateUser);
router.delete('/users/:id', authenticate, userController.deleteUser);

// Payment routes
router.use('/payments', authenticate, paymentRoutes);

// Itinerary routes

// Booking routes
router.post('/bookings', authenticate, bookingController.createBooking);
router.get('/bookings', authenticate, bookingController.getUserBookings);
router.put('/bookings/:bookingId', authenticate, bookingController.updateBooking);
router.delete('/bookings/:bookingId', authenticate, bookingController.deleteBooking);

// Attraction routes
router.post('/attractions', authenticate, attractionController.createAttraction);
router.get('/attractions', attractionController.getAttractions);
router.post('/attractions/:attractionId/reviews', authenticate, attractionController.addReview);

// Flight routes
router.get('/flights', authenticate, flightController.getFlights);
router.post('/flights', authenticate, flightController.createFlight);
router.put('/flights/:flightId', authenticate, flightController.updateFlight);
router.delete('/flights/:flightId', authenticate, flightController.deleteFlight);
router.post('/flights/book', authenticate, flightController.bookFlight);
router.get('/flights/bookings', authenticate, flightController.getUserBookings);

// Accommodation routes
router.get('/hotels/search', authenticate, accommodationController.searchHotels);
router.post('/hotels/book', authenticate, accommodationController.bookHotel);
router.get('/hotels/heatmap', accommodationController.getHotelPriceHeatmap);


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
        res.json({ success: true, token });
    } catch (error) {
        console.error('Test Amadeus error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;











