// controllers/itineraryController.js
const Itinerary = require("../models/Itinerary");

// Create a new itinerary
exports.createItinerary = async (req, res) => {
  const { userId, destination, startDate, endDate, activities } = req.body;

  try {
    const newItinerary = new Itinerary({
      userId,
      destination,
      startDate,
      endDate,
      activities,
    });

    await newItinerary.save();
    res.status(201).json({ message: "Itinerary created successfully", itinerary: newItinerary });
  } catch (err) {
    console.error("Error creating itinerary:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// Get all itineraries for a user
exports.getUserItineraries = async (req, res) => {
  const { userId } = req.params;

  try {
    const itineraries = await Itinerary.find({ userId });
    res.status(200).json({ itineraries });
  } catch (err) {
    console.error("Error fetching itineraries:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// Update an itinerary
exports.updateItinerary = async (req, res) => {
  const { itineraryId } = req.params;
  const updates = req.body;

  try {
    const updatedItinerary = await Itinerary.findByIdAndUpdate(itineraryId, updates, { new: true });
    res.status(200).json({ message: "Itinerary updated successfully", itinerary: updatedItinerary });
  } catch (err) {
    console.error("Error updating itinerary:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// Delete an itinerary
exports.deleteItinerary = async (req, res) => {
  const { itineraryId } = req.params;

  try {
    await Itinerary.findByIdAndDelete(itineraryId);
    res.status(200).json({ message: "Itinerary deleted successfully" });
  } catch (err) {
    console.error("Error deleting itinerary:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

