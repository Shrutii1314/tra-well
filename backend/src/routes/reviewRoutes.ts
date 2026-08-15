import { Router } from 'express';
import { getAllReviews, createReview, getReview, updateReview, deleteReview } from '../controllers/reviewController';
import { protect } from '../controllers/authController';

// mergeParams allows us to access parameters passed from other routers (like tourId)
const router = Router({ mergeParams: true });

router.route('/')
  .get(getAllReviews)
  .post(protect, createReview);

router.route('/:id')
  .get(getReview)
  .patch(protect, updateReview)
  .delete(protect, deleteReview);

export default router;