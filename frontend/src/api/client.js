import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

// Adjunta el token guardado en localStorage a cada peticion.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('miudes_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el token expira o es invalido, el backend responde 401: limpiamos sesion.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('miudes_token');
      localStorage.removeItem('miudes_user');
    }
    return Promise.reject(error);
  }
);

export default api;
