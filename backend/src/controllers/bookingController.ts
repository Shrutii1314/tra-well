import { Response } from 'express';
import Booking from '../models/bookingModel';
import Tour from '../models/tourModel';

// 🎟️ CREATE BOOKING: Book a tour experience
export const createBooking = async (req: any, res: Response): Promise<void> => {
  try {
    const { tourId, startDate, guests } = req.body;
    const guestCount = Number(guests) || 1;

    if (!tourId) {
      res.status(400).json({ status: 'fail', message: 'Tour ID is required to create a booking.' });
      return;
    }

    const tour = await Tour.findById(tourId);
    if (!tour) {
      res.status(404).json({ status: 'fail', message: 'No tour found with that ID.' });
      return;
    }

    const totalPrice = (tour.price - (tour.priceDiscount || 0)) * guestCount;

    const booking = await Booking.create({
      tour: tourId,
      user: req.user.id,
      price: totalPrice,
      startDate: startDate ? new Date(startDate) : new Date(),
      guests: guestCount,
      paid: true
    });

    res.status(201).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (err: any) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// 📋 GET MY BOOKINGS: Fetch bookings for currently logged-in user
export const getMyBookings = async (req: any, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: {
        bookings
      }
    });
  } catch (err: any) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// 👑 GET ALL BOOKINGS: Admin route to fetch all platform bookings
export const getAllBookings = async (req: any, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: {
        bookings
      }
    });
  } catch (err: any) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// 🔍 GET ONE BOOKING
export const getBooking = async (req: any, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404).json({ status: 'fail', message: 'No booking found with that ID.' });
      return;
    }

    // Check ownership or admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ status: 'fail', message: 'You do not have permission to view this booking.' });
      return;
    }

    res.status(200).json({ status: 'success', data: { booking } });
  } catch (err: any) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// ✏️ UPDATE BOOKING (e.g. paid status or guest count)
export const updateBooking = async (req: any, res: Response): Promise<void> => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedBooking) {
      res.status(404).json({ status: 'fail', message: 'No booking found with that ID.' });
      return;
    }

    res.status(200).json({ status: 'success', data: { booking: updatedBooking } });
  } catch (err: any) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// 🗑️ DELETE / CANCEL BOOKING
export const deleteBooking = async (req: any, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404).json({ status: 'fail', message: 'No booking found with that ID.' });
      return;
    }

    // Allow user who made booking or admin to cancel
    const bookingUserId = (booking.user as any)._id ? (booking.user as any)._id.toString() : booking.user.toString();
    if (bookingUserId !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ status: 'fail', message: 'You can only cancel your own bookings.' });
      return;
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.status(204).json({ status: 'success', data: null });
  } catch (err: any) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
