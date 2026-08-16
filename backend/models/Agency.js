const mongoose = require('mongoose');

const agencySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'An agency must belong to a user account']
    },
    businessName: {
      type: String,
      required: [true, 'Please provide the agency business name'],
      trim: true
    },
    licenseNumber: {
      type: String,
      required: [true, 'Please provide official business license/registration number'],
      trim: true
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'declined'],
      default: 'pending'
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    logo: {
      type: String,
      default: 'default-logo.jpg'
    },
    coverImage: {
      type: String,
      default: 'default-cover.jpg'
    },
    bio: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Agency = mongoose.models.Agency || mongoose.model('Agency', agencySchema);
module.exports = Agency;
