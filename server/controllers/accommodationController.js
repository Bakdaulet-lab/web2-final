const axios = require('axios');
const Accommodation = require("../models/Accommodation");
const Booking = require("../models/Booking");
const amadeusService = require('../services/amadeusService');

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
            cityCode, 
            checkInDate, 
            checkOutDate, 
            adults = 2,
            roomQuantity = 1,
            amenities,
            ratings,
            currency = 'USD'
        } = req.query;

        if (!cityCode || !checkInDate || !checkOutDate) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters'
            });
        }

        // Validate dates
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        
        if (checkIn >= checkOut) {
            return res.status(400).json({
                success: false,
                error: 'Check-out date must be after check-in date'
            });
        }

        // First ensure we have a valid token
        await amadeusService.ensureValidToken();

        // Get hotels
        const hotelsResponse = await amadeusService.searchHotels({
            cityCode,
            radius: 5,
            radiusUnit: 'KM',
            ratings,
            amenities: amenities ? amenities.split(',') : undefined,
            hotelSource: 'ALL'
        });

        if (!hotelsResponse.data || !hotelsResponse.data.length) {
            return res.status(200).json({
                success: true,
                hotels: []
            });
        }

        // Get hotel offers
        const offers = await amadeusService.getHotelOffers({
            hotelIds: hotelsResponse.data.map(h => h.hotelId).join(','),
            adults: parseInt(adults),
            checkInDate,
            checkOutDate,
            roomQuantity: parseInt(roomQuantity),
            currency
        });

        // Format response
        const hotels = hotelsResponse.data.map(hotel => {
            const hotelOffers = offers.data.find(o => o.hotel.hotelId === hotel.hotelId);
            return {
                id: hotel.hotelId,
                name: hotel.name,
                location: {
                    cityCode: hotel.cityCode,
                    latitude: hotel.geoCode?.latitude,
                    longitude: hotel.geoCode?.longitude
                },
                rating: hotel.rating,
                amenities: hotel.amenities,
                offers: hotelOffers?.offers || []
            };
        });

        res.status(200).json({
            success: true,
            hotels
        });

    } catch (error) {
        console.error('Hotel search error:', error.response?.data || error);
        res.status(500).json({
            success: false,
            error: 'Failed to search hotels'
        });
    }
};

// Book a hotel
exports.bookHotel = async (req, res) => {
    const { hotelId, checkIn, checkOut, guests, vendor, price, tax } = req.body;
    const userId = req.user._id;

    try {
        const booking = new Booking({
            userId,
            hotelId,
            checkIn,
            checkOut,
            guests,
            vendor,
            price,
            tax,
            status: 'confirmed',
            type: 'hotel'
        });

        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Hotel booked successfully',
            booking
        });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to book hotel'
        });
    }
};

