// controllers/attractionController.js
const Attraction = require("../models/Attraction");

// Create a new attraction
exports.createAttraction = async (req, res) => {
  const { name, description, location, images } = req.body;

  try {
    const newAttraction = new Attraction({
      name,
      description,
      location,
      images,
    });

    await newAttraction.save();
    res.status(201).json({ message: "Attraction created successfully", attraction: newAttraction });
  } catch (err) {
    console.error("Error creating attraction:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// Get all attractions
exports.getAttractions = async (req, res) => {
  try {
    const attractions = await Attraction.find();
    res.status(200).json({ attractions });
  } catch (err) {
    console.error("Error fetching attractions:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// Add a review to an attraction
exports.addReview = async (req, res) => {
  const { attractionId } = req.params;
  const { userId, rating, comment } = req.body;

  try {
    const attraction = await Attraction.findById(attractionId);
    if (!attraction) {
      return res.status(404).json({ error: "Attraction not found." });
    }

    attraction.reviews.push({ userId, rating, comment });
    await attraction.save();

    res.status(200).json({ message: "Review added successfully", attraction });
  } catch (err) {
    console.error("Error adding review:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

