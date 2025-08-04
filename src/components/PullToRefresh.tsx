import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';
import { useHapticFeedback } from '@/hooks/use-haptic-feedback';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
  refreshThreshold?: number;
  maxPullDistance?: number;
  className?: string;
  disabled?: boolean;
}

export function PullToRefresh({
  children,
  onRefresh,
  refreshThreshold = 80,
  maxPullDistance = 120,
  className,
  disabled = false
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);
  
  const { impact } = useHapticFeedback();

  const isAtTop = useCallback(() => {
    if (!scrollableRef.current) return true;
    return scrollableRef.current.scrollTop <= 0;
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || !isAtTop()) return;
    
    startYRef.current = e.touches[0].clientY;
    currentYRef.current = startYRef.current;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || !isAtTop() || isRefreshing) return;
    
    currentYRef.current = e.touches[0].clientY;
    const deltaY = currentYRef.current - startYRef.current;
    
    if (deltaY > 0) {
      e.preventDefault();
      
      // Apply dampening effect
      const dampening = 0.6;
      const newPullDistance = Math.min(deltaY * dampening, maxPullDistance);
      
      setPullDistance(newPullDistance);
      
      const shouldRefresh = newPullDistance >= refreshThreshold;
      if (shouldRefresh !== canRefresh) {
        setCanRefresh(shouldRefresh);
        if (shouldRefresh) {
          impact('light');
        }
      }
    }
  };

  const handleTouchEnd = async () => {
    if (disabled || isRefreshing) return;
    
    if (canRefresh && pullDistance >= refreshThreshold) {
      setIsRefreshing(true);
      impact('medium');
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        setCanRefresh(false);
      }
    } else {
      setPullDistance(0);
      setCanRefresh(false);
    }
  };

  const refreshProgress = Math.min(pullDistance / refreshThreshold, 1);
  const iconRotation = isRefreshing ? 360 : refreshProgress * 180;
  const iconScale = 0.8 + (refreshProgress * 0.4);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 z-10",
          "bg-background/95 backdrop-blur-sm border-b border-border/50",
          pullDistance > 0 ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          height: `${Math.min(pullDistance, refreshThreshold)}px`,
          transform: `translateY(-${Math.max(0, refreshThreshold - pullDistance)}px)`
        }}
      >
        <div className="flex flex-col items-center gap-2 py-2">
          <RefreshCw
            className={cn(
              "transition-all duration-300",
              canRefresh ? 'text-primary' : 'text-muted-foreground',
              isRefreshing && 'animate-spin'
            )}
            style={{
              transform: `rotate(${iconRotation}deg) scale(${iconScale})`,
              fontSize: '20px'
            }}
          />
          <span className={cn(
            "text-xs font-medium transition-colors duration-200",
            canRefresh ? 'text-primary' : 'text-muted-foreground'
          )}>
            {isRefreshing 
              ? 'Refreshing...'
              : canRefresh 
                ? 'Release to refresh'
                : 'Pull to refresh'
            }
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        ref={scrollableRef}
        className={cn(
          "mobile-scroll transition-transform duration-200",
          isRefreshing && "pointer-events-none"
        )}
        style={{
          transform: `translateY(${pullDistance}px)`
        }}
      >
        {children}
      </div>
    </div>
  );
}