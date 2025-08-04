import { useEffect, useState } from 'react';

interface KeyboardAwareOptions {
  adjustment?: number;
  enabled?: boolean;
}

export function useKeyboardAware(options: KeyboardAwareOptions = {}) {
  const { adjustment = 0, enabled = true } = options;
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let initialViewportHeight = window.visualViewport?.height ?? window.innerHeight;
    let currentViewportHeight = initialViewportHeight;

    const handleViewportChange = () => {
      if (!window.visualViewport) return;

      const newHeight = window.visualViewport.height;
      const heightDifference = initialViewportHeight - newHeight;
      
      // Keyboard is considered open if viewport shrinks by more than 150px
      const keyboardOpen = heightDifference > 150;
      
      setIsKeyboardOpen(keyboardOpen);
      setKeyboardHeight(keyboardOpen ? heightDifference + adjustment : 0);
      currentViewportHeight = newHeight;
    };

    const handleResize = () => {
      // Update initial height when window is resized (orientation change)
      setTimeout(() => {
        initialViewportHeight = window.visualViewport?.height ?? window.innerHeight;
        currentViewportHeight = initialViewportHeight;
        setIsKeyboardOpen(false);
        setKeyboardHeight(0);
      }, 100);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    } else {
      // Fallback for browsers without visualViewport support
      window.addEventListener('resize', handleViewportChange);
    }

    window.addEventListener('orientationchange', handleResize);

    // Initial check
    handleViewportChange();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      } else {
        window.removeEventListener('resize', handleViewportChange);
      }
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [adjustment, enabled]);

  return {
    isKeyboardOpen,
    keyboardHeight,
    viewportStyle: isKeyboardOpen ? {
      paddingBottom: `${keyboardHeight}px`,
      transition: 'padding-bottom 0.3s ease-out'
    } : {}
  };
}