'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
  gradient: string;
}

const categories: Category[] = [
  {
    id: 1,
    name: 'Pour Elle',
    description: 'Des fragrances délicates et envoûtantes',
    image: '/images/categories/women.jpg',
    gradient: 'from-pink-500/50 to-purple-500/50',
  },
  {
    id: 2,
    name: 'Pour Lui',
    description: 'Des parfums au caractère unique',
    image: '/images/categories/men.jpg',
    gradient: 'from-blue-500/50 to-indigo-500/50',
  },
  {
    id: 3,
    name: 'Unisexe',
    description: 'Des créations sans frontières',
    image: '/images/categories/unisex.jpg',
    gradient: 'from-green-500/50 to-teal-500/50',
  }
];

export function Categories({ onDiscoverClick }: { onDiscoverClick: () => void }) {
  return (
    <section className="py-8 sm:py-12 md:py-16">
      <div className="container mx-auto px-4">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center"
        >
          Nos Catégories
        </motion.h2>
        <div className="grid gap-2 sm:gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="relative h-[200px] sm:h-[250px]">
                <OptimizedImage
                  src={category.image}
                  alt={category.name}
                  className="object-cover"
                  fill
                />
              </div>
              <div 
                className={`absolute inset-0 bg-gradient-to-b ${category.gradient}`}
                style={{ backdropFilter: 'blur(4px)' }}
              />
              <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4 md:p-6 text-white">
                <div className="transform transition-transform group-hover:-translate-y-2">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm sm:text-base mb-2 sm:mb-3 md:mb-4 opacity-90">
                    {category.description}
                  </p>
                  <Button 
                    variant="outline" 
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border-white/40 text-white text-sm sm:text-base"
                    onClick={onDiscoverClick}
                  >
                    Découvrir
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}