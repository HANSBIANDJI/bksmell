'use client';

import Image from 'next/image';
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
  return (
    <Image
      src={src}
      alt={alt}
      className={cn('transition-all duration-300', className)}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      quality={90}
      priority
    />
  );
}
