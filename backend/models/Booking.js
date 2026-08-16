const mongoose = require('mongoose');

const passengerDetailSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    default: 'Unspecified'
  },
  phone: {
    type: String,
    default: ''
  }
});

const bookingSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Booking must belong to a Tour']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a User']
    },
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agency'
    },
    startDate: {
      type: Date,
      required: [true, 'Booking must specify departure start date']
    },
    seatsBooked: {
      type: Number,
      required: [true, 'Please specify number of seats booked'],
      default: 1
    },
    totalPrice: {
      type: Number,
      required: [true, 'Booking must have total price']
    },
    passengerDetails: {
      type: [passengerDetailSchema],
      default: []
    },
    emergencyContact: {
      type: String,
      default: ''
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    },
    transactionId: {
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

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
module.exports = Booking;
