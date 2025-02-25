// models/Booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    hotelKey: {
        type: String,
        required: true
    },
    hotelName: {
        type: String,
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    guests: [{
        name: String,
        email: String,
        phone: String
    }],
    price: {
        amount: Number,
        currency: String,
        vendor: String
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled"],
        default: "confirmed"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Booking", bookingSchema);