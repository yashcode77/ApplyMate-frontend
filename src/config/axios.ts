import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8082/api/';

// Add an interceptor to include the token in requests
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default axios;