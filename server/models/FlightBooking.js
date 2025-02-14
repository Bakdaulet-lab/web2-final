const mongoose = require('mongoose');

const flightBookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    flightDetails: {
        flightId: String,
        airline: String,
        flightNumber: String,
        origin: String,
        destination: String,
        departureTime: Date,
        arrivalTime: Date,
        class: String,
        price: Number
    },
    passengerDetails: {
        name: String,
        email: String,
        phone: String
    },
    paymentDetails: {
        amount: Number,
        tax: Number,
        total: Number,
        cardLastFour: String
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['confirmed', 'pending', 'cancelled'],
        default: 'confirmed'
    }
});

module.exports = mongoose.model('FlightBooking', flightBookingSchema);