import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useSwipeGesture } from '@/hooks/use-swipe-gesture';
import { useHapticFeedback } from '@/hooks/use-haptic-feedback';

interface SwipeAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  color?: 'destructive' | 'warning' | 'success' | 'primary';
  onAction: () => void;
}

interface SwipeableItemProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
  threshold?: number;
  className?: string;
  hapticFeedback?: boolean;
}

export function SwipeableItem({
  children,
  leftActions = [],
  rightActions = [],
  onSwipeStart,
  onSwipeEnd,
  threshold = 80,
  className,
  hapticFeedback = true
}: SwipeableItemProps) {
  const [swipePosition, setSwipePosition] = useState(0);
  const [isSwipingLeft, setIsSwipingLeft] = useState(false);
  const [isSwipingRight, setIsSwipingRight] = useState(false);
  const [revealedActions, setRevealedActions] = useState<'left' | 'right' | null>(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const itemRef = useRef<HTMLDivElement>(null);
  
  const { impact } = useHapticFeedback({ enabled: hapticFeedback });

  const resetPosition = () => {
    setSwipePosition(0);
    setIsSwipingLeft(false);
    setIsSwipingRight(false);
    setRevealedActions(null);
    onSwipeEnd?.();
  };

  const swipeGesture = useSwipeGesture({
    onSwipeLeft: () => {
      if (rightActions.length > 0) {
        setRevealedActions('right');
        setSwipePosition(-threshold);
        impact('light');
      }
    },
    onSwipeRight: () => {
      if (leftActions.length > 0) {
        setRevealedActions('left');
        setSwipePosition(threshold);
        impact('light');
      } else {
        resetPosition();
      }
    },
    threshold: threshold * 0.6,
    velocity: 0.2
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = startXRef.current;
    onSwipeStart?.();
    swipeGesture.onTouchStart(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentXRef.current = e.touches[0].clientX;
    const deltaX = currentXRef.current - startXRef.current;
    
    // Only allow swipe if there are actions in that direction
    if (deltaX > 0 && leftActions.length === 0) return;
    if (deltaX < 0 && rightActions.length === 0) return;
    
    // Dampen the movement for better feel
    const dampening = 0.6;
    const newPosition = deltaX * dampening;
    
    // Limit the swipe distance
    const maxSwipe = threshold * 1.5;
    const limitedPosition = Math.max(-maxSwipe, Math.min(maxSwipe, newPosition));
    
    setSwipePosition(limitedPosition);
    setIsSwipingLeft(limitedPosition < -10);
    setIsSwipingRight(limitedPosition > 10);
    
    swipeGesture.onTouchMove(e);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = currentXRef.current - startXRef.current;
    const absDeltatX = Math.abs(deltaX);
    
    if (absDeltatX < threshold) {
      resetPosition();
    } else {
      // Snap to action position
      if (deltaX > 0 && leftActions.length > 0) {
        setSwipePosition(threshold);
        setRevealedActions('left');
        impact('medium');
      } else if (deltaX < 0 && rightActions.length > 0) {
        setSwipePosition(-threshold);
        setRevealedActions('right');
        impact('medium');
      } else {
        resetPosition();
      }
    }
    
    setIsSwipingLeft(false);
    setIsSwipingRight(false);
    swipeGesture.onTouchEnd(e);
  };

  const handleActionClick = (action: SwipeAction) => {
    impact('heavy');
    action.onAction();
    resetPosition();
  };

  const getActionColorClass = (color?: string) => {
    switch (color) {
      case 'destructive':
        return 'bg-destructive text-destructive-foreground';
      case 'warning':
        return 'bg-yellow-500 text-yellow-50';
      case 'success':
        return 'bg-green-500 text-green-50';
      case 'primary':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div 
      ref={itemRef}
      className={cn("relative overflow-hidden swipe-indicator", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Left Actions */}
      {leftActions.length > 0 && (
        <div className="absolute left-0 top-0 h-full flex items-center z-10">
          {leftActions.map((action, index) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={cn(
                "h-full px-4 flex items-center justify-center min-w-[80px] touch-target haptic-enabled",
                getActionColorClass(action.color),
                "transform transition-transform duration-200",
                revealedActions === 'left' ? 'translate-x-0' : '-translate-x-full'
              )}
              style={{
                transform: `translateX(${Math.max(0, swipePosition - threshold)}px)`
              }}
            >
              <div className="flex flex-col items-center gap-1">
                {action.icon && <div className="text-lg">{action.icon}</div>}
                <span className="text-xs font-medium">{action.label}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Right Actions */}
      {rightActions.length > 0 && (
        <div className="absolute right-0 top-0 h-full flex items-center z-10">
          {rightActions.map((action, index) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={cn(
                "h-full px-4 flex items-center justify-center min-w-[80px] touch-target haptic-enabled",
                getActionColorClass(action.color),
                "transform transition-transform duration-200",
                revealedActions === 'right' ? 'translate-x-0' : 'translate-x-full'
              )}
              style={{
                transform: `translateX(${Math.min(0, swipePosition + threshold)}px)`
              }}
            >
              <div className="flex flex-col items-center gap-1">
                {action.icon && <div className="text-lg">{action.icon}</div>}
                <span className="text-xs font-medium">{action.label}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div
        className={cn(
          "relative z-20 bg-background transition-transform duration-200 touch-smooth",
          isSwipingLeft && "shadow-lg",
          isSwipingRight && "shadow-lg"
        )}
        style={{
          transform: `translateX(${swipePosition}px)`
        }}
      >
        {children}
      </div>

      {/* Click outside to reset */}
      {revealedActions && (
        <div
          className="fixed inset-0 z-0"
          onClick={resetPosition}
          onTouchStart={resetPosition}
        />
      )}
    </div>
  );
}