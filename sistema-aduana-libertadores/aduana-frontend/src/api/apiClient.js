import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Interceptor de REQUEST: adjunta el token JWT ────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aduana_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Interceptor de RESPONSE: manejo centralizado de errores ────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (!response) {
      toast.error('Error de conexión. Verifique su red.');
      return Promise.reject(error);
    }

    switch (response.status) {
      case 401:
        localStorage.removeItem('aduana_token');
        localStorage.removeItem('aduana_user');
        toast.error('Sesión expirada. Inicie sesión nuevamente.');
        window.location.href = '/login';
        break;
      case 403:
        toast.error('No tiene permisos para realizar esta acción.');
        break;
      case 404:
        toast.error(response.data?.mensaje || 'Recurso no encontrado.');
        break;
      case 422:
        toast.error(response.data?.mensaje || 'Error de validación de reglas de negocio.');
        break;
      case 500:
        toast.error('Error interno del servidor. Contacte al administrador.');
        break;
      default:
        toast.error(response.data?.mensaje || 'Error inesperado.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
