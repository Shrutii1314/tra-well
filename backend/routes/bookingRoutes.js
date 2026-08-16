const express = require('express');
const Booking = require('../models/Booking');
const Tour = require('../models/Tour');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   POST /api/v1/bookings
 * @desc    Protected ('user'), creates booking, validates seat availability on the Tour, updates available seats, and processes mock payment
 * @access  Private (Authenticated User)
 */
router.post('/', protect, async (req, res) => {
  try {
    const { tourId, startDate, seatsBooked, passengerDetails, emergencyContact } = req.body;

    // Validate required fields
    if (!tourId || !startDate || !seatsBooked) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide tourId, startDate, and seatsBooked.'
      });
    }

    // 1. Fetch target tour
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({
        status: 'fail',
        message: 'Tour package not found.'
      });
    }

    if (tour.status !== 'active') {
      return res.status(400).json({
        status: 'fail',
        message: `This tour package is currently ${tour.status} and not accepting new bookings.`
      });
    }

    // 2. Validate seat availability against tour maxGroupSize
    const existingBookings = await Booking.aggregate([
      { $match: { tour: tour._id, paymentStatus: { $ne: 'refunded' } } },
      { $group: { _id: null, totalSeatsBooked: { $sum: '$seatsBooked' } } }
    ]);

    const currentBookedSeats = existingBookings.length > 0 ? existingBookings[0].totalSeatsBooked : 0;
    const requestedSeats = Number(seatsBooked);

    if (currentBookedSeats + requestedSeats > tour.maxGroupSize) {
      const remainingSeats = Math.max(0, tour.maxGroupSize - currentBookedSeats);
      return res.status(400).json({
        status: 'fail',
        message: `Not enough seats available. Only ${remainingSeats} seat(s) left on this tour.`
      });
    }

    // 3. Calculate total price & mock transaction ID
    const totalPrice = tour.price * requestedSeats;
    const transactionId = `TXN-2026-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 4. Create Booking
    const newBooking = await Booking.create({
      tour: tour._id,
      user: req.user._id,
      agency: tour.agency,
      startDate: new Date(startDate),
      seatsBooked: requestedSeats,
      totalPrice,
      passengerDetails: passengerDetails || [],
      emergencyContact: emergencyContact || '',
      paymentStatus: 'paid',
      transactionId
    });

    // Update tour status if sold out
    if (currentBookedSeats + requestedSeats >= tour.maxGroupSize) {
      tour.status = 'sold-out';
      await tour.save();
    }

    res.status(201).json({
      status: 'success',
      message: 'Booking confirmed and payment processed successfully.',
      data: {
        booking: newBooking,
        ticket: {
          bookingRef: `TW-${newBooking._id.toString().slice(-6).toUpperCase()}`,
          transactionId,
          qrCodeData: `TRAWELL:REF=TW-${newBooking._id}:TXN=${transactionId}`
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/bookings/my-bookings
 * @desc    Protected ('user'), fetches traveler's trip history
 * @access  Private (Authenticated User)
 */
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('tour', 'title coverImage category duration pickupLocation price difficulty')
      .populate('agency', 'businessName logo phone email')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: {
        bookings
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
