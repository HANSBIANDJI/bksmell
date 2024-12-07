import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { OptimizedImage } from './OptimizedImage';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';

interface PerfumeCardProps {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  description: string;
}

export function PerfumeCard({
  id,
  name,
  brand,
  price,
  image,
  description,
}: PerfumeCardProps) {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  return (
    <Card className="group relative overflow-hidden">
      <div className="absolute right-2 top-2 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-white/80 hover:bg-white"
          onClick={() => toggleFavorite(id)}
        >
          <Heart
            className={`h-5 w-5 ${
              isFavorite(id) ? 'fill-red-500 text-red-500' : 'text-gray-500'
            }`}
          />
        </Button>
      </div>

      <div className="aspect-square overflow-hidden">
        <OptimizedImage
          src={image}
          alt={name}
          width={400}
          height={400}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-4">
        <div className="mb-2 text-sm text-gray-500">{brand}</div>
        <h3 className="mb-2 text-lg font-semibold">{name}</h3>
        <p className="mb-4 line-clamp-2 text-sm text-gray-600">{description}</p>
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold">
            {price.toLocaleString()} FCFA
          </div>
          <Button onClick={() => addToCart(id)} size="sm">
            Ajouter
          </Button>
        </div>
      </div>
    </Card>
  );
}