// controllers/excursionController.js
const Excursion = require("../models/Excursion");

// Create a new excursion
exports.createExcursion = async (req, res) => {
  const { name, description, location, price, duration, images } = req.body;

  try {
    const newExcursion = new Excursion({
      name,
      description,
      location,
      price,
      duration,
      images,
    });

    await newExcursion.save();
    res.status(201).json({ message: "Excursion created successfully", excursion: newExcursion });
  } catch (err) {
    console.error("Error creating excursion:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// Get all excursions
exports.getExcursions = async (req, res) => {
  try {
    const excursions = await Excursion.find();
    res.status(200).json({ excursions });
  } catch (err) {
    console.error("Error fetching excursions:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// Update an excursion
exports.updateExcursion = async (req, res) => {
  const { excursionId } = req.params;
  const updates = req.body;

  try {
    const updatedExcursion = await Excursion.findByIdAndUpdate(excursionId, updates, { new: true });
    res.status(200).json({ message: "Excursion updated successfully", excursion: updatedExcursion });
  } catch (err) {
    console.error("Error updating excursion:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// Delete an excursion
exports.deleteExcursion = async (req, res) => {
  const { excursionId } = req.params;

  try {
    await Excursion.findByIdAndDelete(excursionId);
    res.status(200).json({ message: "Excursion deleted successfully" });
  } catch (err) {
    console.error("Error deleting excursion:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

