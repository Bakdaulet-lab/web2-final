//userController.js
const fs = require("fs");
const path = require("path");
const User = require("./models/Users.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const axios = require("axios");


const JWT_SECRET = "fd3e1a6c2b5a9d8e7f6b4c3a1d2e9f8d7c6b5a4e3d2c1b0f9e8d7c6b5a4e3d2c";

if (!JWT_SECRET) {
  console.error("JWT_SECRET is not defined in the environment variables.");
  process.exit(1); // Exit if the secret is not defined
}


exports.getHomePage = (req, res) => {
  res.sendFile(path.join(__dirname, "../travel-platform-frontend", "index.html"));
};

exports.getSignPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../travel-platform-frontend/pages", "register.html"));
};

exports.getLoginPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../travel-platform-frontend/pages", "Login.html"));
};

exports.getProfilePage = (req, res) => {
  res.sendFile(path.join(__dirname, "../travel-platform-frontend/pages", "profile.html"));
};



exports.registerUser = async (req, res) => {
    try {
        const { username, password, email, age } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({ error: "Please provide all required fields." });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            return res.status(409).json({ 
                error: "User already exists with this email or username." 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            username,
            password: hashedPassword,
            email,
            age: age || null
        });

        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id, username: user.username }, 
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send response
        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            error: "An error occurred during registration." 
        });
    }
};



exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Please provide both username and password." });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: "1h"
    });

    // Send response with token and user data
    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      message: "Login successful"
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error. Please try again later." });
  }
};



// Process booking
exports.processBooking = async (req, res) => {
  const { userId, excursionId, flightId, accommodationId } = req.body;

  // Save booking to database (pseudo-code)
  const booking = await saveBookingToDatabase(userId, excursionId, flightId, accommodationId);

  res.status(200).json({ message: "Booking successful", booking });
};

// Send confirmation email
exports.sendConfirmationEmail = async (req, res) => {
  const { email, bookingDetails } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Booking Confirmation",
    text: `Your booking details: ${JSON.stringify(bookingDetails)}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ error: "Failed to send email" });
    }
    res.status(200).json({ message: "Email sent", info });
  });
};



exports.generateItinerary = async (req, res) => {
  const { userId, preferences } = req.body;

  // Generate itinerary based on preferences (pseudo-code)
  const itinerary = await generateItineraryFromPreferences(userId, preferences);

  res.status(200).json({ itinerary });
};

exports.updateItinerary = async (req, res) => {
  const { itineraryId, updates } = req.body;

  // Update itinerary in database (pseudo-code)
  const updatedItinerary = await updateItineraryInDatabase(itineraryId, updates);

  res.status(200).json({ updatedItinerary });
};



// Fetch flights
exports.fetchFlights = async (req, res) => {
  const { origin, destination, date } = req.query;

  if (!origin || !destination || !date) {
    return res.status(400).json({ error: "dest origin and date required" });
  }

  try {
    const response = await axios.get(`https://opensky-network.org/api/states/all`, {
      params: { origin, destination, date },
      headers: { Authorization: `JWT ${process.env.JWT_SECRET}` },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching flights:", error.message);
    res.status(500).json({ error: "Failed to fetch flights" });
  }
};

// Fetch hotels
exports.fetchHotels = async (req, res) => {
  const { location, checkIn, checkOut } = req.query;

  if (!location || !checkIn || !checkOut) {
    return res.status(400).json({ error: "Location, check-in, and check-out dates are required" });
  }

  try {
    const response = await axios.get(`https://api.makcorps.com/free/${location}`, {
      params: { checkIn, checkOut },
      headers: { Authorization: `JWT ${process.env.JWT_SECRET}` },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching hotels:", error.message);
    res.status(500).json({ error: "Failed to fetch hotels" });
  }
};






// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

exports.getUsers = (req, res) => {
  const users = readUsers(); 
  res.status(200).json(users); 
};

exports.updateUser = async (req, res) => {
  const { id } = req.params; // Get the user's ID from the URL
  const { username, email, age } = req.body; // Get the new data from the request body

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username, email, age },
      { new: true, runValidators: true } // Return the updated document and validate updates
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({ message: "User updated successfully.", updatedUser });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params; // Get the user's ID from the URL

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({ message: "User deleted successfully.", deletedUser });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

