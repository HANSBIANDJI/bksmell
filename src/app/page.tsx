'use client';

import { useRouter } from 'next/navigation';
import { HeroCarousel } from '@/components/HeroCarousel';
import { Categories } from '@/components/Categories';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { Newsletter } from '@/components/Newsletter';

export default function Home() {
  const router = useRouter();

  const handleDiscoverClick = () => {
    router.push('/parfums');
  };

  return (
    <main>
      <HeroCarousel onDiscoverClick={handleDiscoverClick} />
      <Categories onDiscoverClick={handleDiscoverClick} />
      <FeaturedProducts onDiscoverClick={handleDiscoverClick} />
      <Newsletter />
    </main>
  );
}
