import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  ...props
}: OptimizedImageProps) {
  return (
    <div className={cn('relative overflow-hidden')}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${fill ? 'object-cover w-full h-full' : ''}`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...props}
      />
    </div>
  );
}
