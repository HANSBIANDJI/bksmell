'use client';

import { cn } from '@/lib/utils';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}

export function OptimizedImage({ src, alt, className, fill, width, height }: OptimizedImageProps) {
  const style = fill ? {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  } as const : undefined;

  return (
    <img
      src={src}
      alt={alt}
      className={cn('transition-all duration-300', className)}
      style={style}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      loading="lazy"
      decoding="async"
    />
  );
}
