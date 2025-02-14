// models/Booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  excursionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Excursion"
  },
  flightId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Flight"
  },
  accommodationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Accommodation"
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending"
  }
});

module.exports = mongoose.model("Booking", bookingSchema);