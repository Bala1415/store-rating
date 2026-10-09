import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing session on application initial load
  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const response = await authApi.getMe();
      if (response.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      // 401 or network error - user is not authenticated
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(credentials) {
    const response = await authApi.login(credentials);
    const loggedInUser = response.data.user;
    setUser(loggedInUser);
    return loggedInUser;
  }

  async function signup(userData) {
    const response = await authApi.signup(userData);
    const signedUpUser = response.data.user;
    setUser(signedUpUser);
    return signedUpUser;
  }

  async function logout() {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }

  async function changePassword(oldPassword, newPassword) {
    const response = await authApi.changePassword({ oldPassword, newPassword });
    return response.data;
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    changePassword,
    checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
