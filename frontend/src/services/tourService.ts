import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

// ──────────────────────────────────────────────
// 🗺️  TOUR CRUD
// ──────────────────────────────────────────────

export const getTours = async (queryParams?: Record<string, string>) => {
  try {
    const params = new URLSearchParams(queryParams).toString();
    const url = params
      ? `${API_BASE_URL}/tours?${params}`
      : `${API_BASE_URL}/tours`;
    const response = await axios.get(url);
    return response.data.data.tours;
  } catch (error) {
    console.error('Error fetching tours:', error);
    throw error;
  }
};

export const getTour = async (id: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tours/${id}`);
    return response.data.data.tour;
  } catch (error) {
    console.error('Error fetching tour:', error);
    throw error;
  }
};

export const createTour = async (tourData: any) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/tours`, tourData);
    return response.data.data.tour;
  } catch (error) {
    console.error('Error creating tour:', error);
    throw error;
  }
};

export const updateTour = async (id: string, tourData: any) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/tours/${id}`, tourData);
    return response.data.data.tour;
  } catch (error) {
    console.error('Error updating tour:', error);
    throw error;
  }
};

export const deleteTour = async (id: string) => {
  try {
    await axios.delete(`${API_BASE_URL}/tours/${id}`);
  } catch (error) {
    console.error('Error deleting tour:', error);
    throw error;
  }
};

export const getToursWithin = async (
  distance: number,
  center: string,
  unit: string
) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/tours/tours-within/${distance}/center/${center}/unit/${unit}`
    );
    return response.data.data.data || response.data.data.tours;
  } catch (error) {
    console.error('Error fetching tours within:', error);
    throw error;
  }
};

// ──────────────────────────────────────────────
// ⭐  REVIEWS
// ──────────────────────────────────────────────

export const getReviewsForTour = async (tourId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tours/${tourId}/reviews`);
    return response.data.data.reviews;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

export const createReview = async (
  tourId: string,
  reviewData: { review: string; rating: number }
) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/tours/${tourId}/reviews`, reviewData);
    return response.data.data.review;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const deleteReview = async (reviewId: string) => {
  try {
    await axios.delete(`${API_BASE_URL}/reviews/${reviewId}`);
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};
