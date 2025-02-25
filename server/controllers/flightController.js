// controllers/flightController.js
const { Flight } = require("../models/Flight");
const FlightBooking = require('../models/FlightBooking');
const User = require('../models/Users');
const { sendBookingConfirmation } = require('../utils/emailService');
const { authenticate } = require('../middlewares/auth');
const fetch = require('node-fetch');

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

        // Basic query conditions
        let query = {};

        // Add filters only if they are provided
        if (origin) query.origin = origin;
        if (destination) query.destination = destination;
        if (departureDate) {
            query.departureTime = { 
                $gte: new Date(departureDate),
                $lt: new Date(new Date(departureDate).setDate(new Date(departureDate).getDate() + 1))
            };
        }
        if (passengers) {
            query.seats = { $gte: parseInt(passengers) || 1 };
        }

        // Make sure we have some flights in the database
        const flights = await Flight.find(query).sort({ departureTime: 1 });

        // Add debug logging
        console.log('Search Query:', query);
        console.log('Found Flights:', flights);

        res.status(200).json({
            success: true,
            flights: flights,
            meta: {
                total: flights.length,
                filters: {
                    origin,
                    destination,
                    departureDate,
                    passengers: parseInt(passengers) || 1
                }
            }
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

        // Check authentication
        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        // Find flight by flightNumber
        const flight = await Flight.findOne({ flightNumber: flightDetails.flightNumber });
        if (!flight || flight.seats < 1) {
            return res.status(400).json({
                success: false,
                error: 'Flight not available'
            });
        }

        // Create booking record
        const booking = new FlightBooking({
            userId: req.user.userId, // Get userId from authenticated user
            flightDetails: {
                flightId: flight._id,
                airline: flight.airline,
                flightNumber: flight.flightNumber,
                origin: flight.origin,
                destination: flight.destination,
                departureTime: flight.departureTime,
                arrivalTime: flight.arrivalTime,
                class: flight.class,
                price: flight.price
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

        // Send booking confirmation email
        try {
            await sendBookingConfirmation(passengerDetails.email, booking);
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            // Continue with booking process even if email fails
        }

        res.status(200).json({
            success: true,
            message: 'Flight booked successfully',
            booking: booking
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

// Modify searchFlights to use proper async/await handling
exports.searchFlights = async (req, res) => {
    try {
        const { origin, destination, departureDate, passengers } = req.query;

        if (!origin || !destination || !departureDate) {
            return res.status(400).json({
                success: false,
                error: 'Missing required search parameters'
            });
        }

        const API_KEY = '02a6ce2ddbad9a9f40d8b514e51da21e'; // Your Aviation Stack API key
        const url = `http://api.aviationstack.com/v1/flights?access_key=${API_KEY}&dep_iata=${origin}&arr_iata=${destination}&flight_date=${departureDate}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Failed to fetch flights');
        }

        let flights = [];
        if (data.data && Array.isArray(data.data)) {
            flights = data.data.map(flight => ({
                flightNumber: flight.flight?.number || 'N/A',
                airline: flight.airline?.name || 'N/A',
                origin: flight.departure?.iata || origin,
                destination: flight.arrival?.iata || destination,
                departureTime: flight.departure?.scheduled || departureDate,
                arrivalTime: flight.arrival?.scheduled,
                price: Math.floor(Math.random() * (1000 - 200) + 200),
                seats: Math.floor(Math.random() * 50) + 1,
                aircraft: flight.aircraft?.registration || 'N/A',
                terminal: flight.departure?.terminal || 'TBD',
                gate: flight.departure?.gate || 'TBD'
            }));
        }

        return res.status(200).json({
            success: true,
            flights,
            meta: {
                total: flights.length,
                origin,
                destination,
                departureDate,
                passengers: parseInt(passengers) || 1
            }
        });

    } catch (error) {
        console.error('Flight search error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to search flights',
            message: error.message
        });
    }
};

