import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
      toast({
        variant: "destructive",
        title: "Session expirée",
        description: "Veuillez vous reconnecter"
      });
    } else if (!error.response) {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur"
      });
    } else {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue"
      });
    }
    return Promise.reject(error);
  }
);

export default api;