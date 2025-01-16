// models/Accommodation.js
const mongoose = require("mongoose");

const accommodationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["Hotel", "Hostel", "Apartment", "Villa"],
    required: true,
  },
  pricePerNight: {
    type: Number,
    required: true,
  },
  amenities: [{
    type: String,
  }],
  images: [{
    type: String,
  }],
});

const Accommodation = mongoose.model("Accommodation", accommodationSchema);

module.exports = Accommodation;