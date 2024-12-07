import { createContext, useContext, useState, useEffect } from 'react';

interface FavoritesContextType {
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  addToFavorites: (id: string) => void;
  removeFromFavorites: (id: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Charger les favoris au démarrage
  useEffect(() => {
    const deviceId = localStorage.getItem('deviceId') || 
      `device_${Math.random().toString(36).substring(2)}`;
    
    if (!localStorage.getItem('deviceId')) {
      localStorage.setItem('deviceId', deviceId);
    }

    const savedFavorites = localStorage.getItem(`favorites_${deviceId}`);
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Sauvegarder les favoris à chaque modification
  useEffect(() => {
    const deviceId = localStorage.getItem('deviceId');
    if (deviceId) {
      localStorage.setItem(`favorites_${deviceId}`, JSON.stringify(favorites));
    }
  }, [favorites]);

  const isFavorite = (id: string) => favorites.includes(id);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const addToFavorites = (id: string) => {
    if (!favorites.includes(id)) {
      setFavorites([...favorites, id]);
    }
  };

  const removeFromFavorites = (id: string) => {
    setFavorites(favorites.filter((item) => item !== id));
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        addToFavorites,
        removeFromFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}