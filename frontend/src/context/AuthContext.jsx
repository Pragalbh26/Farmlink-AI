import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { mockUsers } from '../api/mockData';
import { apiClient } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('agriconnect_token') || (apiClient.isMockMode ? 'demo_token_123' : null);
  });
  const [user, setUser] = useState(() => {
    if (apiClient.isMockMode) {
      try {
        return JSON.parse(localStorage.getItem('agriconnect_user')) || mockUsers[0];
      } catch {
        return mockUsers[0];
      }
    }
    return null;
  });
  const [isSessionLoading, setIsSessionLoading] = useState(() => Boolean(token && !apiClient.isMockMode));
  const validationRequest = useRef(0);

  useEffect(() => {
    const requestId = ++validationRequest.current;
    if (apiClient.isMockMode) {
      setIsSessionLoading(false);
      return () => { validationRequest.current += 1; };
    }
    if (!token) {
      setUser(null);
      setIsSessionLoading(false);
      return () => { validationRequest.current += 1; };
    }

    setIsSessionLoading(true);
    apiClient.request('/auth/profile').then((res) => {
      if (requestId === validationRequest.current) setUser(res.data);
    }).catch(() => {
      if (requestId === validationRequest.current) {
        setUser(null);
        setToken(null);
      }
    }).finally(() => {
      if (requestId === validationRequest.current) setIsSessionLoading(false);
    });
    return () => { validationRequest.current += 1; };
  }, [token]);

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
    validationRequest.current += 1;
    setIsSessionLoading(false);
    setUser(userData);
    setToken(userToken);
    if (userToken) localStorage.setItem('agriconnect_token', userToken);
  };

  const logout = () => {
    validationRequest.current += 1;
    setIsSessionLoading(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem('agriconnect_user');
    localStorage.removeItem('agriconnect_token');
  };

  const switchRole = (newRole) => {
    loginAs(newRole);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isSessionLoading, loginAs, loginUser, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
