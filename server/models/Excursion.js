// models/Excursion.js
const mongoose = require("mongoose");

const excursionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  images: [{
    type: String,
  }],
});

const Excursion = mongoose.model("Excursion", excursionSchema);

module.exports = Excursion;