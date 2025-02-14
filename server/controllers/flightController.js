// controllers/flightController.js
const Flight = require("../models/Flight");
const FlightBooking = require('../models/FlightBooking'); // Changed from Flight to FlightBooking
const User = require('../models/Users'); // Changed from User to Users
const { sendBookingConfirmation } = require('../utils/emailService');
const { authenticate } = require('../middlewares/auth'); // Update path

// Create a new flight
exports.createFlight = async (req, res) => {
  const { airline, flightNumber, origin, destination, departureTime, arrivalTime, price } = req.body;

  try {
    const newFlight = new Flight({
      airline,
      flightNumber,
      origin,
      destination,
      departureTime,
      arrivalTime,
      price,
    });

    await newFlight.save();
    res.status(201).json({ success: true, flight: newFlight });
  } catch (err) {
    console.error("Error creating flight:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get all flights
exports.getFlights = async (req, res) => {
    try {
        const { origin, destination, departureDate, passengers, priceRange, stops } = req.query;

        let query = {
            origin,
            destination,
            departureTime: { $gte: new Date(departureDate) },
            seats: { $gte: parseInt(passengers) }
        };

        if (stops !== 'any') {
            query.stops = parseInt(stops);
        }

        if (priceRange !== 'any') {
            const [min, max] = priceRange.split('-').map(Number);
            query.price = { $gte: min, $lte: max };
        }

        const flights = await Flight.find(query);

        res.status(200).json({
            success: true,
            flights
        });
    } catch (error) {
        console.error('Error fetching flights:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch flights'
        });
    }
};

// Update a flight
exports.updateFlight = async (req, res) => {
  const { flightId } = req.params;
  const updates = req.body;

  try {
    const updatedFlight = await Flight.findByIdAndUpdate(flightId, updates, { new: true });
    if (!updatedFlight) {
      return res.status(404).json({ success: false, error: "Flight not found" });
    }
    res.status(200).json({ success: true, flight: updatedFlight });
  } catch (err) {
    console.error("Error updating flight:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Delete a flight
exports.deleteFlight = async (req, res) => {
  const { flightId } = req.params;

  try {
    const flight = await Flight.findByIdAndDelete(flightId);
    if (!flight) {
      return res.status(404).json({ success: false, error: "Flight not found" });
    }
    res.status(200).json({ success: true, message: "Flight deleted" });
  } catch (err) {
    console.error("Error deleting flight:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.bookFlight = async (req, res) => {
    try {
        const {
            flightDetails,
            passengerDetails,
            paymentDetails
        } = req.body;

        // Validate flight availability
        const flight = await Flight.findById(flightDetails.flightId);
        if (!flight || flight.seats < 1) {
            return res.status(400).json({
                success: false,
                error: 'Flight not available'
            });
        }

        // Create booking record
        const booking = new FlightBooking({
            userId: req.user._id,
            flightDetails: {
                ...flightDetails,
                flightId: flight._id // Use MongoDB _id
            },
            passengerDetails,
            paymentDetails: {
                amount: paymentDetails.amount,
                tax: paymentDetails.tax,
                total: paymentDetails.total,
                cardLastFour: paymentDetails.cardNumber.slice(-4)
            },
            status: 'confirmed'
        });

        await booking.save();

        // Update flight seats
        flight.seats -= 1;
        await flight.save();

        // Send confirmation email
        try {
            await sendBookingConfirmation(passengerDetails.email, booking);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Continue with booking success even if email fails
        }

        res.status(200).json({
            success: true,
            message: 'Flight booked successfully',
            bookingId: booking._id
        });

    } catch (error) {
        console.error('Flight booking error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to book flight'
        });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await FlightBooking.find({ userId: req.user._id });
        res.status(200).json({
            success: true,
            bookings
        });
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch bookings'
        });
    }
};

