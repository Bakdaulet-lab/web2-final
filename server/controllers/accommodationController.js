// controllers/accommodationController.js
const Accommodation = require("../models/Accommodation");

// Create a new accommodation
exports.createAccommodation = async (req, res) => {
  const { name, location, type, pricePerNight, amenities, images } = req.body;

  try {
    const newAccommodation = new Accommodation({
      name,
      location,
      type,
      pricePerNight,
      amenities,
      images,
    });

    await newAccommodation.save();
    res.status(201).json({ message: "Accommodation created successfully", accommodation: newAccommodation });
  } catch (err) {
    console.error("Error creating accommodation:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// Get all accommodations
exports.getAccommodations = async (req, res) => {
  try {
    const accommodations = await Accommodation.find();
    res.status(200).json({ accommodations });
  } catch (err) {
    console.error("Error fetching accommodations:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// Update an accommodation
exports.updateAccommodation = async (req, res) => {
  const { accommodationId } = req.params;
  const updates = req.body;

  try {
    const updatedAccommodation = await Accommodation.findByIdAndUpdate(accommodationId, updates, { new: true });
    res.status(200).json({ message: "Accommodation updated successfully", accommodation: updatedAccommodation });
  } catch (err) {
    console.error("Error updating accommodation:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// Delete an accommodation
exports.deleteAccommodation = async (req, res) => {
  const { accommodationId } = req.params;

  try {
    await Accommodation.findByIdAndDelete(accommodationId);
    res.status(200).json({ message: "Accommodation deleted successfully" });
  } catch (err) {
    console.error("Error deleting accommodation:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

