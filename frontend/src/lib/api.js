import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://fra-samanvaya.onrender.com/api' : '/api'),
  withCredentials: true,
});

export default api;
