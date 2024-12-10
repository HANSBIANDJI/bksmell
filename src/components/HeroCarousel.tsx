'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/contexts/AdminContext';
import { HeroSlide } from '@/types';

interface HeroCarouselProps {
  onDiscoverClick: () => void;
}

export function HeroCarousel({ onDiscoverClick }: HeroCarouselProps) {
  const { heroSlides } = useAdmin();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const activeSlides = (heroSlides || []).filter((slide: HeroSlide) => slide.active).sort((a, b) => a.order - b.order);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (activeSlides.length === 0) return;
    if (!isPlaying) return;

    const currentMedia = activeSlides[currentSlide];
    if (currentMedia.mediaType === 'video' && videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error('Error playing video:', error);
      });
      return;
    }

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeSlides, currentSlide, isPlaying]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(error => {
          console.error('Error playing video:', error);
        });
      }
    }
  };

  if (activeSlides.length === 0) {
    return null;
  }

  const currentMedia = activeSlides[currentSlide];

  return (
    <div className="relative h-[500px] md:h-[600px] lg:h-[700px]">
      <div className="absolute inset-0">
        {currentMedia.mediaType === 'video' ? (
          <video
            ref={videoRef}
            src={currentMedia.mediaUrl}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
          />
        ) : (
          <OptimizedImage
            src={currentMedia.mediaUrl}
            alt={currentMedia.title}
            className="object-cover"
            fill
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4">
          {currentMedia.title}
        </h1>
        <p className="text-lg md:text-xl text-center mb-8 max-w-2xl">
          {currentMedia.description}
        </p>
        <button
          onClick={onDiscoverClick}
          className="px-8 py-3 bg-white text-black rounded-full hover:bg-gray-100 transition-colors"
        >
          {currentMedia.buttonText}
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {activeSlides.map((_, index) => (
          <button
            key={index}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            )}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <button
        onClick={handlePrevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={handleNextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <button
        onClick={togglePlayPause}
        className="absolute bottom-4 right-4 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
        aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
      >
        {isPlaying ? (
          <Pause className="w-6 h-6" />
        ) : (
          <Play className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}