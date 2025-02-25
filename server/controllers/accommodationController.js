const axios = require('axios');
const Accommodation = require("../models/Accommodation");
const Booking = require("../models/Booking");
const amadeusService = require('../services/amadeusService');
const xoteloService = require('../services/xoteloService');

// Create a new accommodation
exports.createAccommodation = async (req, res) => {
  const { name, location, type, pricePerNight, amenities, images } = req.body;

  try {
    const newAccommodation = new Accommodation({
      name,
      location,
      type,
      pricePerNight,
      amenities,
      images,
    });

    await newAccommodation.save();
    res.status(201).json({ message: "Accommodation created successfully", accommodation: newAccommodation });
  } catch (err) {
    console.error("Error creating accommodation:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// Get all accommodations
exports.getAccommodations = async (req, res) => {
  try {
    const accommodations = await Accommodation.find();
    res.status(200).json({ accommodations });
  } catch (err) {
    console.error("Error fetching accommodations:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// Update an accommodation
exports.updateAccommodation = async (req, res) => {
  const { accommodationId } = req.params;
  const updates = req.body;

  try {
    const updatedAccommodation = await Accommodation.findByIdAndUpdate(accommodationId, updates, { new: true });
    res.status(200).json({ message: "Accommodation updated successfully", accommodation: updatedAccommodation });
  } catch (err) {
    console.error("Error updating accommodation:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// Delete an accommodation
exports.deleteAccommodation = async (req, res) => {
  const { accommodationId } = req.params;

  try {
    await Accommodation.findByIdAndDelete(accommodationId);
    res.status(200).json({ message: "Accommodation deleted successfully" });
  } catch (err) {
    console.error("Error deleting accommodation:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// Search hotels using external API
exports.searchHotels = async (req, res) => {
    try {
        const { 
            locationKey,
            checkIn,
            checkOut,
            rooms = 1,
            adults = 1,
            sortBy = 'best_value',
            limit = 30,
            offset = 0
        } = req.query;

        // Get hotels list
        const hotelsList = await xoteloService.getHotelsList(locationKey, limit, offset, sortBy);

        // Get rates for each hotel
        const hotelsWithRates = await Promise.all(
            hotelsList.result.list.map(async (hotel) => {
                try {
                    const ratesData = await xoteloService.getHotelRates(
                        hotel.key,
                        checkIn,
                        checkOut,
                        rooms,
                        adults
                    );
                    return {
                        ...hotel,
                        rates: ratesData.result.rates
                    };
                } catch (error) {
                    console.error(`Failed to fetch rates for hotel ${hotel.key}:`, error);
                    return {
                        ...hotel,
                        rates: []
                    };
                }
            })
        );

        res.json({
            success: true,
            hotels: hotelsWithRates,
            total: hotelsList.result.total_count
        });

    } catch (error) {
        console.error('Hotel search error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search hotels'
        });
    }
};

// Get hotel price heatmap
exports.getHotelPriceHeatmap = async (req, res) => {
    try {
        const { hotelKey, checkOut } = req.query;
        const heatmapData = await xoteloService.getHotelHeatmap(hotelKey, checkOut);
        
        res.json({
            success: true,
            heatmap: heatmapData.result.heatmap
        });
    } catch (error) {
        console.error('Heatmap fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch price heatmap'
        });
    }
};

// Book a hotel
exports.bookHotel = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: "Authentication required"
            });
        }

        const {
            hotelKey,
            hotelName,
            checkIn,
            checkOut,
            guests,
            price
        } = req.body;

        const booking = new Booking({
            userId: req.user.userId,
            hotelKey,
            hotelName,
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
            guests,
            price,
            status: 'confirmed'
        });

        await booking.save();

        res.status(200).json({
            success: true,
            message: "Booking confirmed successfully",
            booking: {
                id: booking._id,
                hotelName: booking.hotelName,
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                price: booking.price
            }
        });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process booking'
        });
    }
};

