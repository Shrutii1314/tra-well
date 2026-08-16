import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  updateUserInContext: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for logged in user on mount (e.g., from cookie or localstorage)
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (credentials: any) => {
    try {
      const res = await axios.post('http://localhost:5000/api/v1/users/login', credentials);
      if (res.data.status === 'success') {
        const { token: userToken, data: { user: userData } } = res.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      }
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const signup = async (userData: any) => {
    try {
      const res = await axios.post('http://localhost:5000/api/v1/users/signup', userData);
      if (res.data.status === 'success') {
        const { token: userToken, data: { user: newUser } } = res.data;
        setUser(newUser);
        setToken(userToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('token', userToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      }
    } catch (err) {
      console.error('Signup error:', err);
      throw err;
    }
  };

  const updateUserInContext = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, signup, logout, updateUserInContext }}>
      {children}
    </AuthContext.Provider>
  );

};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
