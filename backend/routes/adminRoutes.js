const express = require('express');
const Agency = require('../models/Agency');
const User = require('../models/User');
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect & restrictTo('admin') to all admin routes
router.use(protect, restrictTo('admin'));

/**
 * @route   GET /api/v1/admin/agencies/pending
 * @desc    Fetch all agencies awaiting verification
 * @access  Private (Admin Only)
 */
router.get('/agencies/pending', async (req, res) => {
  try {
    const pendingAgencies = await Agency.find({ verificationStatus: 'pending' }).populate('user', 'name email phone avatar');

    res.status(200).json({
      status: 'success',
      results: pendingAgencies.length,
      data: {
        agencies: pendingAgencies
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
 * @route   PATCH /api/v1/admin/agencies/:id/approve
 * @desc    Update agency status to 'approved'
 * @access  Private (Admin Only)
 */
router.patch('/agencies/:id/approve', async (req, res) => {
  try {
    const agency = await Agency.findById(req.params.id);
    if (!agency) {
      return res.status(404).json({
        status: 'fail',
        message: 'No agency found with that ID.'
      });
    }

    agency.verificationStatus = 'approved';
    agency.rejectionReason = '';
    await agency.save();

    // Ensure associated user has role 'agency'
    await User.findByIdAndUpdate(agency.user, { role: 'agency' });

    res.status(200).json({
      status: 'success',
      message: `Agency "${agency.businessName}" approved successfully.`,
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
 * @route   PATCH /api/v1/admin/agencies/:id/decline
 * @desc    Update agency status to 'declined' with reason
 * @access  Private (Admin Only)
 */
router.patch('/agencies/:id/decline', async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const agency = await Agency.findById(req.params.id);
    if (!agency) {
      return res.status(404).json({
        status: 'fail',
        message: 'No agency found with that ID.'
      });
    }

    agency.verificationStatus = 'declined';
    agency.rejectionReason = rejectionReason || 'Application details did not meet platform safety and license compliance guidelines.';
    await agency.save();

    res.status(200).json({
      status: 'success',
      message: `Agency "${agency.businessName}" application declined.`,
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
 * @route   GET /api/v1/admin/stats
 * @desc    Aggregate system metrics (Total Revenue, Active Tours, Agency counts)
 * @access  Private (Admin Only)
 */
router.get('/stats', async (req, res) => {
  try {
    // 1. Total Revenue from Paid Bookings
    const revenueAggregate = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueAggregate.length > 0 ? revenueAggregate[0].totalRevenue : 0;
    const platformCommission = Math.round(totalRevenue * 0.1); // 10% platform cut

    // 2. Active Tours Count
    const activeToursCount = await Tour.countDocuments({ status: 'active' });

    // 3. Agency Counts
    const approvedAgenciesCount = await Agency.countDocuments({ verificationStatus: 'approved' });
    const pendingAgenciesCount = await Agency.countDocuments({ verificationStatus: 'pending' });

    // 4. Total Traveler Bookings
    const totalBookingsCount = await Booking.countDocuments();

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalRevenue,
          platformCommission,
          activeToursCount,
          approvedAgenciesCount,
          pendingAgenciesCount,
          totalBookingsCount
        }
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
