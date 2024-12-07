import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
}

export function OptimizedImage({ className, ...props }: OptimizedImageProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        {...props}
        className="object-cover"
        quality={90}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}
