import { Router } from 'express';
import { createTour, getAllTours, getTour, updateTour, deleteTour } from '../controllers/tourController';
import { protect } from '../controllers/authController';
import reviewRouter from './reviewRoutes'; // ◀️ 1. Import it
import { getToursWithin, getDistances} from '../controllers/tourController';

const router = Router();

// ◀️ 2. MUST BE MOUNTED HERE (Before any /:id routes!)
router.use('/:tourId/reviews', reviewRouter);

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(getToursWithin);

// Your regular routes below
router.route('/').get(getAllTours);
router.route('/distances/:latlng/unit/:unit').get(getDistances);
// Standard routes
router.route('/')
  .get(getAllTours)
  .post(protect, createTour);

router.route('/:id')
  .get(getTour)
  .patch(protect, updateTour)
  .delete(protect, deleteTour);

export default router;