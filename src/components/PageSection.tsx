'use client';

import { cn } from '@/lib/utils';

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageSection({ children, className = '' }: PageSectionProps): React.JSX.Element {
  return (
    <section className={cn('py-12 md:py-16 lg:py-20', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}