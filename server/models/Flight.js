const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema({
    airline: {
        type: String,
        required: true,
    },
    flightNumber: {
        type: String,
        required: true,
        unique: true,
    },
    origin: {
        type: String,
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
    departureTime: {
        type: Date,
        required: true,
    },
    arrivalTime: {
        type: Date,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    seats: {
        type: Number,
        default: 180,
    },
    class: {
        type: String,
        enum: ["Economy", "Business", "First"],
        default: "Economy",
    },
});

const Flight = mongoose.model("Flight", flightSchema);

// Create a function to seed sample data
function seedSampleFlight() {
    const sampleFlights = [
        {
            airline: "Air Astana",
            flightNumber: "KC931",
            origin: "ALA",
            destination: "NQZ",
            departureTime: new Date("2025-03-03T08:30:00"),
            arrivalTime: new Date("2025-03-03T10:45:00"),
            price: 450,
            seats: 180,
            class: "Economy"
        },
        {
            airline: "Air Astana",
            flightNumber: "KC932",
            origin: "NQZ",
            destination: "ALA",
            departureTime: new Date("2025-03-03T12:30:00"),
            arrivalTime: new Date("2025-03-03T14:45:00"),
            price: 480,
            seats: 180,
            class: "Economy"
        }
    ];

    return Promise.all(sampleFlights.map(flight => 
        new Flight(flight).save()
            .catch(err => {
                if (err.code !== 11000) {
                    console.error('Error saving flight:', err);
                }
            })
    ));
}

module.exports = {
    Flight,
    seedSampleFlight
};

