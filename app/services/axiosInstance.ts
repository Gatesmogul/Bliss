import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

/**
 * Define the AuthState interface to fix the 'unknown' type errors.
 * This should match the properties defined in your authStore.ts
 */
interface AuthState {
  token: string | null;
  logout: () => void; // Changed from signout to logout to match standard naming
  isHydrated: boolean;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:10000/api;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, 
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * REQUEST INTERCEPTOR
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Explicitly cast getState as AuthState to resolve 'unknown' type error
    const state = useAuthStore.getState() as AuthState;
    const token = state.token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      console.warn('Session expired. Performing cleanup...');
      
      const state = useAuthStore.getState() as AuthState;
      
      // Ensure the function exists before calling to prevent runtime crashes
      if (typeof state.logout === 'function') {
        state.logout();
      }
    }

    // Professional Error Logging
    if (error.response) {
      // Server-side error
      console.error(`[API Error ${error.response.status}]:`, error.response.data);
    } else if (error.request) {
      // Network/Connectivity error
      console.error('[API Network Error]: No response from server. Check your connection.');
    } else {
      // Logic/Configuration error
      console.error('[API Config Error]:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
