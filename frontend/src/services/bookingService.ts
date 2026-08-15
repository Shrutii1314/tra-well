import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

export interface CreateBookingData {
  tourId: string;
  startDate?: string;
  guests?: number;
}

export const createBooking = async (data: CreateBookingData, token: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/bookings`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data.booking;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const getMyBookings = async (token: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bookings/my-bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data.bookings;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
};

export const getAllBookings = async (token: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data.bookings;
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    throw error;
  }
};

export const cancelBooking = async (bookingId: string, token: string) => {
  try {
    await axios.delete(`${API_BASE_URL}/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};
