// controllers/bookingController.js
const Booking = require("../models/Booking");

// Create a new booking
exports.createBooking = async (req, res) => {
  const { userId, excursionId, flightId, accommodationId } = req.body;

  try {
    const newBooking = new Booking({
      userId,
      excursionId,
      flightId,
      accommodationId,
    });

    await newBooking.save();
    res.status(201).json({ message: "Booking created successfully", booking: newBooking });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// Get all bookings for a user
exports.getUserBookings = async (req, res) => {
  const { userId } = req.params;

  try {
    const bookings = await Booking.find({ userId }).populate("excursionId flightId accommodationId");
    res.status(200).json({ bookings });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
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


