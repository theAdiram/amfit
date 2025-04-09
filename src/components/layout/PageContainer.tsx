
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

const PageContainer = ({ children, className }: PageContainerProps) => {
  const isMobile = useIsMobile();
  
  return (
    <main className={cn(
      'container mx-auto px-4 py-6 pb-24 md:py-8 md:pb-8 md:pt-24',
      className
    )}>
      {children}
    </main>
  );
};

export default PageContainer;
