import axios from 'axios';
import { auth } from '../firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api-pathfinder-rndr.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  async (config) => {
    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error("Error fetching Firebase token", error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
