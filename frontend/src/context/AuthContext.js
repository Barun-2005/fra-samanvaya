import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch current user on mount
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/users/me');
      setUser(response.data);
    } catch (error) {
      // User not authenticated or session expired
      if (error.response?.status === 401) {
        setUser(null);
        // Only redirect to login if not already on login page
        if (router.pathname !== '/login' && router.pathname !== '/') {
          router.push('/login');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      
      if (response.data.requires2FA) {
        // Store username temporarily for 2FA step
        sessionStorage.setItem('tempUsername', username);
        return { requires2FA: true };
      }
      
      // Fetch user data after successful login
      await fetchUser();
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  const hasRole = (allowedRoles) => {
    if (!user || !user.roles) return false;
    return user.roles.some(role => allowedRoles.includes(role));
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    isAuthenticated,
    refetch: fetchUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
