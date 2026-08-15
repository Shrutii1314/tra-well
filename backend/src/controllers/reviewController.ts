import { Request, Response } from 'express';
import Review from '../models/reviewModel';

// 📝 CREATE REVIEW: Post a new review on a tour
export const createReview = async (req: any, res: Response): Promise<void> => {
  try {
    // Nested Routes support: If tour or user ID aren't in the body, grab them from the URL parameters/session
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;

    const newReview = await Review.create({
      review: req.body.review,
      rating: req.body.rating,
      tour: req.body.tour,
      user: req.body.user
    });

    res.status(201).json({
      status: 'success',
      data: {
        review: newReview
      }
    });
  } catch (err: any) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// 📋 GET ALL REVIEWS: Fetch reviews (can filter by a specific tour if tourId is present in URL)
export const getAllReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const reviews = await Review.find(filter);

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews
      }
    });
  } catch (err: any) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// 🔍 GET ONE REVIEW
export const getReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404).json({ status: 'fail', message: 'No review found with that ID' });
      return;
    }

    res.status(200).json({ status: 'success', data: { review } });
  } catch (err: any) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// ✏️ UPDATE REVIEW
export const updateReview = async (req: any, res: Response): Promise<void> => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404).json({ status: 'fail', message: 'No review found with that ID' });
      return;
    }

    // Only allow the author or admin to update
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ status: 'fail', message: 'You can only edit your own reviews.' });
      return;
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      { review: req.body.review, rating: req.body.rating },
      { new: true, runValidators: true }
    );

    res.status(200).json({ status: 'success', data: { review: updatedReview } });
  } catch (err: any) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// 🗑️ DELETE REVIEW
export const deleteReview = async (req: any, res: Response): Promise<void> => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404).json({ status: 'fail', message: 'No review found with that ID' });
      return;
    }

    // Only allow the author or admin to delete
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ status: 'fail', message: 'You can only delete your own reviews.' });
      return;
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(204).json({ status: 'success', data: null });
  } catch (err: any) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};