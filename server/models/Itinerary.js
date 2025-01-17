// models/Itinerary.js
const mongoose = require("mongoose");

const itinerarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  activities: [{
    name: String,
    description: String,
    date: Date,
  }],
});

const Itinerary = mongoose.model("Itinerary", itinerarySchema);

module.exports = Itinerary;