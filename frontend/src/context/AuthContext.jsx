import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers } from '../api/mockData';
import { apiClient } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('agriconnect_user');
    return saved ? JSON.parse(saved) : (apiClient.isMockMode ? mockUsers[0] : null);
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('agriconnect_token') || (apiClient.isMockMode ? 'demo_token_123' : null);
  });

  useEffect(() => {
    if (!token || apiClient.isMockMode) return;
    apiClient.request('/auth/profile').then((res) => {
      if (res.success) setUser(res.data);
    }).catch(() => {
      setUser(null);
      setToken(null);
    });
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('agriconnect_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('agriconnect_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem('agriconnect_token', token);
    else localStorage.removeItem('agriconnect_token');
  }, [token]);

  const loginAs = (role) => {
    if (!apiClient.isMockMode) return;
    const matched = mockUsers.find(u => u.role === role) || mockUsers[0];
    setUser(matched);
    setToken(`demo_token_${role}_${Date.now()}`);
  };

  const loginUser = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    if (userToken) localStorage.setItem('agriconnect_token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('agriconnect_user');
    localStorage.removeItem('agriconnect_token');
  };

  const switchRole = (newRole) => {
    loginAs(newRole);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, loginAs, loginUser, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
