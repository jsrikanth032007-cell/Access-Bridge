import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('accessbridge_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Load user details if token exists
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
          setProfile(response.data.profile);
        }
      } catch (error) {
        console.warn('Failed to restore user session:', error.message);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      const { token: receivedToken, user: receivedUser, profile: receivedProfile } = response.data;
      localStorage.setItem('accessbridge_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      setProfile(receivedProfile);
      return response.data;
    }
  };

  const register = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    if (response.data.success) {
      const { token: receivedToken, user: receivedUser, profile: receivedProfile } = response.data;
      localStorage.setItem('accessbridge_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      setProfile(receivedProfile);
      return response.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessbridge_token');
    localStorage.removeItem('accessbridge_user');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const updateProfileLocally = (newProfile) => {
    setProfile(newProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfileLocally,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

