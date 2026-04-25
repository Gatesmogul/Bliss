import axios from 'axios';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';

// Define the shape of our User for Type Safety
interface User {
  _id: string;
  fullName: string;
  email: string;
  isEmailVerified: boolean;
  profileImage?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /**
   * Initialize Auth State
   * Checks SecureStore for an existing token and fetches profile
   */
  const initAuth = useCallback(async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('userToken');
      if (storedToken) {
        setToken(storedToken);
        // Set global axios header for all subsequent requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/profile`);
        setUser(response.data);
      }
    } catch (error) {
      console.error("Auth Initialization Failed:", error);
      await logout(); // Clear corrupt/expired session
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  /**
   * Login Handler
   * Saves token securely and updates state
   */
  const login = async (userData: User, authToken: string) => {
    try {
      await SecureStore.setItemAsync('userToken', authToken);
      setToken(authToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      router.replace('/(tabs)'); // Redirect to home feed
    } catch (error) {
      console.error("Login Storage Error:", error);
    }
  };

  /**
   * Logout Handler
   * Wipes session and redirects to Welcome screen
   */
  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
      router.replace('/welcome');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
  };
};