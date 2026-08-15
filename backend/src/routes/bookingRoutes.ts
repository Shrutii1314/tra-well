import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBooking,
  updateBooking,
  deleteBooking
} from '../controllers/bookingController';
import { protect, restrictTo } from '../controllers/authController';

const router = Router();

// Protect all booking routes
router.use(protect);

router.get('/my-bookings', getMyBookings);

router.route('/')
  .post(createBooking)
  .get(restrictTo('admin', 'lead-guide'), getAllBookings);

router.route('/:id')
  .get(getBooking)
  .patch(restrictTo('admin'), updateBooking)
  .delete(deleteBooking);

export default router;
