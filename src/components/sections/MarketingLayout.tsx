import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Footer } from './Footer';
import { MarketingNavBar } from './MarketingNavBar';

export function MarketingLayout({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn('winwin-root relative', className)} id={id}>
      <MarketingNavBar />
      {children}
      <Footer />
    </div>
  );
}
