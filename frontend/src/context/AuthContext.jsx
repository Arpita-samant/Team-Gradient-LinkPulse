import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('linkpulse_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        // Pre-fill with default Arpita demo session for quick testing if no token yet
        try {
          const res = await authAPI.login({ email: 'arpita@example.com', password: 'password123' });
          if (res.token) {
            localStorage.setItem('linkpulse_token', res.token);
            setToken(res.token);
            setUser(res.user);
          }
        } catch (e) {
          console.warn('Initial session bootstrap:', e.message);
        }
        setLoading(false);
        return;
      }

      try {
        const res = await authAPI.getMe();
        if (res.user) {
          setUser(res.user);
        }
      } catch (err) {
        console.warn('Token validation failed, resetting:', err.message);
        localStorage.removeItem('linkpulse_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.token) {
      localStorage.setItem('linkpulse_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    if (res.token) {
      localStorage.setItem('linkpulse_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('linkpulse_token');
    setToken(null);
    setUser(null);
  };

  const switchDemoRole = async (roleType) => {
    if (roleType === 'admin') {
      await login('admin@linkpulse.com', 'admin123');
    } else {
      await login('arpita@example.com', 'password123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        switchDemoRole,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
