// controllers/bookingController.js
const Booking = require("../models/Booking");
const mongoose = require('mongoose');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated"
      });
    }

    const bookingData = {
      userId: req.user._id,
      ...req.body
    };

    const newBooking = new Booking(bookingData);
    await newBooking.save();

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: newBooking
    });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({
      success: false,
      error: "Failed to create booking"
    });
  }
};

// Get all bookings for a user
exports.getUserBookings = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated"
      });
    }

    const bookings = await Booking.find({ userId: req.user._id })
      .populate("excursionId flightId accommodationId")
      .sort({ bookingDate: -1 });

    res.status(200).json({ 
      success: true,
      bookings 
    });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch bookings" 
    });
  }
};

// Update a booking
exports.updateBooking = async (req, res) => {
  const { bookingId } = req.params;
  const updates = req.body;

  try {
    const updatedBooking = await Booking.findByIdAndUpdate(bookingId, updates, { new: true });
    res.status(200).json({ message: "Booking updated successfully", booking: updatedBooking });
  } catch (err) {
    console.error("Error updating booking:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
  const { bookingId } = req.params;

  try {
    await Booking.findByIdAndDelete(bookingId);
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error("Error deleting booking:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};


