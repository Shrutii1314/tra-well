const express = require('express');
const Agency = require('../models/Agency');
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');
const { protect, restrictTo, requireApprovedAgency } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   POST /api/v1/agency/onboard
 * @desc    Creates an Agency profile (sets status to 'pending')
 * @access  Private (Authenticated User/Agency)
 */
router.post('/onboard', protect, async (req, res) => {
  try {
    const { businessName, licenseNumber, bio, website, phone, address, logo, coverImage } = req.body;

    // Check if agency profile already exists for this user
    let agency = await Agency.findOne({ user: req.user._id });

    if (agency) {
      agency.businessName = businessName || agency.businessName;
      agency.licenseNumber = licenseNumber || agency.licenseNumber;
      agency.bio = bio || agency.bio;
      agency.website = website || agency.website;
      agency.phone = phone || agency.phone;
      agency.address = address || agency.address;
      agency.logo = logo || agency.logo;
      agency.coverImage = coverImage || agency.coverImage;
      agency.verificationStatus = 'pending'; // Reset status for re-verification
      await agency.save();
    } else {
      agency = await Agency.create({
        user: req.user._id,
        businessName,
        licenseNumber,
        bio,
        website,
        phone,
        address,
        logo,
        coverImage,
        verificationStatus: 'pending'
      });
    }

    // Update user role to 'agency'
    req.user.role = 'agency';
    await req.user.save({ validateBeforeSave: false });

    res.status(201).json({
      status: 'success',
      message: 'Agency profile submitted successfully. Application is pending Admin verification.',
      data: {
        agency
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
 * @route   POST /api/v1/agency/tours
 * @desc    Protected ('agency' + 'approved'), creates new tour package
 * @access  Private (Approved Agencies & Admins)
 */
router.post('/tours', protect, restrictTo('agency', 'admin'), requireApprovedAgency, async (req, res) => {
  try {
    // Find linked Agency ID
    let agencyId = req.agency ? req.agency._id : null;

    if (!agencyId) {
      const foundAgency = await Agency.findOne({ user: req.user._id });
      if (foundAgency) agencyId = foundAgency._id;
    }

    const {
      title,
      description,
      category,
      pickupLocation,
      duration,
      price,
      maxGroupSize,
      coverImage,
      gallery,
      inclusions,
      exclusions,
      itinerary,
      startDates
    } = req.body;

    const newTour = await Tour.create({
      agency: agencyId,
      title,
      description,
      category,
      pickupLocation,
      duration,
      price,
      maxGroupSize,
      coverImage,
      gallery,
      inclusions,
      exclusions,
      itinerary,
      startDates
    });

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
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
 * @route   GET /api/v1/agency/tours
 * @desc    Fetch all tours created by logged-in agency
 * @access  Private (Agencies & Admins)
 */
router.get('/tours', protect, restrictTo('agency', 'admin'), async (req, res) => {
  try {
    const agency = await Agency.findOne({ user: req.user._id });
    if (!agency && req.user.role !== 'admin') {
      return res.status(404).json({
        status: 'fail',
        message: 'No registered Agency profile found for this account.'
      });
    }

    const filter = agency ? { agency: agency._id } : {};
    const tours = await Tour.find(filter).populate('agency', 'businessName licenseNumber verified');

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/agency/bookings
 * @desc    Fetch all traveler candidate rosters across tours hosted by this agency
 * @access  Private (Agencies & Admins)
 */
router.get('/bookings', protect, restrictTo('agency', 'admin'), async (req, res) => {
  try {
    const agency = await Agency.findOne({ user: req.user._id });
    if (!agency && req.user.role !== 'admin') {
      return res.status(404).json({
        status: 'fail',
        message: 'No registered Agency profile found for this account.'
      });
    }

    const filter = agency ? { agency: agency._id } : {};
    const bookings = await Booking.find(filter)
      .populate('user', 'name email phone avatar')
      .populate('tour', 'title category duration price pickupLocation');

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
