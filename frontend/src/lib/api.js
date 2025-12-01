import axios from 'axios';

const api = axios.create({
  baseURL: 'https://fra-samanvaya.onrender.com/api',
  withCredentials: true,
});

export default api;
