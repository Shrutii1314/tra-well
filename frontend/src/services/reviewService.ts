import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

export const getAllReviews = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/reviews`);
    return response.data.data.reviews;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

export const deleteReview = async (reviewId: string, token: string) => {
  try {
    await axios.delete(`${API_BASE_URL}/reviews/${reviewId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};
