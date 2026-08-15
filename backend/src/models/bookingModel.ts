import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  tour: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  price: number;
  startDate: Date;
  guests: number;
  paid: boolean;
  createdAt: Date;
}

const bookingSchema: Schema<IBooking> = new Schema(
  {
    tour: {
      type: Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Booking must belong to a Tour!']
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a User!']
    },
    price: {
      type: Number,
      required: [true, 'Booking must have a price.']
    },
    startDate: {
      type: Date,
      required: [true, 'Booking must have a start date.']
    },
    guests: {
      type: Number,
      default: 1,
      min: [1, 'Booking must have at least 1 guest.']
    },
    paid: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Populate tour and user automatically when executing find queries
bookingSchema.pre(/^find/, function (this: any, next: any) {
  this.populate('user', 'name email role').populate({
    path: 'tour',
    select: 'name imageCover duration price difficulty startLocation'
  });
  next();
});

const Booking = mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
