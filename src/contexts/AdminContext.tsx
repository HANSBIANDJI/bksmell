import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSlide, Perfume } from '@/types';

interface AdminContextType {
  isAuthenticated: boolean;
  loading: boolean;
  products: Perfume[];
  heroSlides: HeroSlide[];
  loginAdmin: (email: string, password: string) => Promise<void>;
  logoutAdmin: () => void;
  addProduct: (product: Omit<Perfume, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Perfume>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateHeroSlides: (slides: HeroSlide[]) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | null>(null);

interface AdminProviderProps {
  children: ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Perfume[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchHeroSlides();
    }
  }, [isAuthenticated]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchHeroSlides = async () => {
    try {
      const response = await fetch('/api/hero-slides');
      const data = await response.json();
      setHeroSlides(data);
    } catch (error) {
      console.error('Error fetching hero slides:', error);
    }
  };

  const loginAdmin = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const { token } = await response.json();
      localStorage.setItem('adminToken', token);
      setIsAuthenticated(true);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logoutAdmin = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    navigate('/admin/login');
  };

  const addProduct = async (product: Omit<Perfume, 'id'>) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        throw new Error('Failed to add product');
      }

      const newProduct = await response.json();
      setProducts((prev) => [...prev, newProduct]);
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, product: Partial<Perfume>) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      const updatedProduct = await response.json();
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? updatedProduct : p))
      );
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const updateHeroSlides = async (slides: HeroSlide[]) => {
    try {
      const response = await fetch('/api/hero-slides', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(slides),
      });

      if (!response.ok) {
        throw new Error('Failed to update hero slides');
      }

      setHeroSlides(slides);
    } catch (error) {
      console.error('Error updating hero slides:', error);
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    loading,
    products,
    heroSlides,
    loginAdmin,
    logoutAdmin,
    addProduct,
    updateProduct,
    deleteProduct,
    updateHeroSlides,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}