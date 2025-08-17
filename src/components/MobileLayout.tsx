import React from 'react';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  noPadding?: boolean;
}

const MobileLayout = ({ children, className, header, noPadding = false }: MobileLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      {header && (
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          {header}
        </header>
      )}
      
      {/* Main Content */}
      <main className={cn(
        "flex-1 pb-safe-bottom",
        // Mobile-first padding
        noPadding ? "" : "px-4 py-4",
        // Add bottom padding for mobile navigation
        "pb-bottom-nav md:pb-bottom-nav-md",
        className
      )}>
        {children}
      </main>
    </div>
  );
};

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

const PageHeader = ({ title, subtitle, action, className }: PageHeaderProps) => {
  return (
    <div className={cn("px-4 py-6", className)}>
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-heading font-bold text-foreground truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-subtitle mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="ml-4 flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export { MobileLayout, PageHeader };