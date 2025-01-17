// controllers/flightController.js
const Flight = require("../models/Flight");

// Create a new flight
exports.createFlight = async (req, res) => {
  const { airline, flightNumber, origin, destination, departureTime, arrivalTime, price } = req.body;

  try {
    const newFlight = new Flight({
      airline,
      flightNumber,
      origin,
      destination,
      departureTime,
      arrivalTime,
      price,
    });

    await newFlight.save();
    res.status(201).json({ message: "Flight created successfully", flight: newFlight });
  } catch (err) {
    console.error("Error creating flight:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// Get all flights
exports.getFlights = async (req, res) => {
  try {
    const flights = await Flight.find();
    res.status(200).json({ flights });
  } catch (err) {
    console.error("Error fetching flights:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// Update a flight
exports.updateFlight = async (req, res) => {
  const { flightId } = req.params;
  const updates = req.body;

  try {
    const updatedFlight = await Flight.findByIdAndUpdate(flightId, updates, { new: true });
    res.status(200).json({ message: "Flight updated successfully", flight: updatedFlight });
  } catch (err) {
    console.error("Error updating flight:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// Delete a flight
exports.deleteFlight = async (req, res) => {
  const { flightId } = req.params;

  try {
    await Flight.findByIdAndDelete(flightId);
    res.status(200).json({ message: "Flight deleted successfully" });
  } catch (err) {
    console.error("Error deleting flight:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

