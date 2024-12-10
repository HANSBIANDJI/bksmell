'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { HeroSlide } from '@/types';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  active: boolean;
  isOnSale?: boolean;
  discount?: number;
  brand?: string;
  image?: string;
}

interface AdminContextType {
  isAdmin: boolean;
  login: (password: string) => Promise<void>;
  logout: () => void;
  featuredProducts: Product[];
  heroSlides: HeroSlide[];
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  login: async () => {},
  logout: () => {},
  featuredProducts: [],
  heroSlides: [],
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const storedIsAdmin = localStorage.getItem('isAdmin');
    if (storedIsAdmin === 'true') {
      setIsAdmin(true);
    }

    // Mock featured products data
    setFeaturedProducts([
      {
        id: '1',
        name: 'Rose Élégante',
        description: 'Une fragrance florale délicate',
        price: 89.99,
        imageUrl: '/images/products/rose-elegante.jpg',
        active: true,
      },
      {
        id: '2',
        name: 'Ocean Breeze',
        description: 'Un parfum frais et marin',
        price: 79.99,
        imageUrl: '/images/products/ocean-breeze.jpg',
        active: true,
      },
      {
        id: '3',
        name: 'Bois Mystique',
        description: 'Notes boisées envoûtantes',
        price: 99.99,
        imageUrl: '/images/products/bois-mystique.jpg',
        active: true,
      },
    ]);

    // Mock hero slides data
    setHeroSlides([
      {
        id: '1',
        title: 'Collection Été',
        description: 'Découvrez nos fragrances estivales',
        mediaUrl: '/images/hero/summer-collection.jpg',
        mediaType: 'image',
        active: true,
        order: 1,
        buttonText: 'Découvrir',
        buttonLink: '/collections/summer',
      },
      {
        id: '2',
        title: 'Nouveautés',
        description: 'Les dernières créations de nos parfumeurs',
        mediaUrl: '/images/hero/new-arrivals.jpg',
        mediaType: 'image',
        active: true,
        order: 2,
        buttonText: 'Explorer',
        buttonLink: '/new-arrivals',
      },
      {
        id: '3',
        title: 'Collection Exclusive',
        description: 'Des parfums d\'exception',
        mediaUrl: '/images/hero/exclusive.mp4',
        mediaType: 'video',
        active: true,
        order: 3,
        buttonText: 'Voir la collection',
        buttonLink: '/collections/exclusive',
      },
    ]);
  }, []);

  const login = async (password: string) => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      router.push('/admin/dashboard');
      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue dans votre espace administrateur',
      });
    } else {
      toast({
        title: 'Erreur de connexion',
        description: 'Mot de passe incorrect',
        variant: 'destructive',
      });
    }
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
    router.push('/admin/login');
    toast({
      title: 'Déconnexion',
      description: 'Vous avez été déconnecté avec succès',
    });
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout, featuredProducts, heroSlides }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};