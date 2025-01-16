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
  updateItinerary,
  processPayment 
} = require("./userController");
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

module.exports = router;
