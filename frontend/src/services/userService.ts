import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

export const getAllUsers = async (token: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data.users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const updateUserRole = async (userId: string, role: string, token: string) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/users/${userId}`,
      { role },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.data.user;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const updateAgencyStatus = async (userId: string, agencyStatus: 'approved' | 'rejected', token: string) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/users/${userId}`,
      { agencyStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.data.user;
  } catch (error) {
    console.error('Error updating agency status:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string, token: string) => {
  try {
    await axios.delete(`${API_BASE_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const makeMeAdmin = async (token: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/users/make-me-admin`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.data.user;
  } catch (error) {
    console.error('Error elevating account to admin:', error);
    throw error;
  }
};

