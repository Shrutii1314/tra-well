const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});

const tourSchema = new mongoose.Schema(
  {
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agency',
      required: [true, 'A tour package must belong to an agency']
    },
    title: {
      type: String,
      required: [true, 'Please provide tour package title'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      default: 'Trekking'
    },
    pickupLocation: {
      type: String,
      default: ''
    },
    duration: {
      type: Number,
      required: [true, 'Please specify duration in number of days']
    },
    price: {
      type: Number,
      required: [true, 'Please specify price per seat']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Please specify maximum group size capacity']
    },
    coverImage: {
      type: String,
      default: ''
    },
    gallery: {
      type: [String],
      default: []
    },
    inclusions: {
      type: [String],
      default: []
    },
    exclusions: {
      type: [String],
      default: []
    },
    itinerary: {
      type: [itinerarySchema],
      default: []
    },
    startDates: {
      type: [Date],
      default: []
    },
    status: {
      type: String,
      enum: ['active', 'draft', 'sold-out', 'cancelled'],
      default: 'active'
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

const Tour = mongoose.models.Tour || mongoose.model('Tour', tourSchema);
module.exports = Tour;
