import { useCallback } from 'react';

type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'impact' | 'notification';

interface HapticFeedbackOptions {
  enabled?: boolean;
}

export function useHapticFeedback(options: HapticFeedbackOptions = {}) {
  const { enabled = true } = options;

  const triggerHaptic = useCallback((type: HapticType = 'light') => {
    if (!enabled || typeof window === 'undefined') return;

    // Check if device supports haptic feedback
    if ('vibrate' in navigator) {
      let pattern: number | number[] = 0;

      switch (type) {
        case 'light':
          pattern = 10;
          break;
        case 'medium':
          pattern = 20;
          break;
        case 'heavy':
          pattern = 30;
          break;
        case 'selection':
          pattern = [5];
          break;
        case 'impact':
          pattern = [10, 10, 20];
          break;
        case 'notification':
          pattern = [10, 50, 10];
          break;
        default:
          pattern = 10;
      }

      navigator.vibrate(pattern);
    }

    // iOS Haptic Feedback (if available)
    if ('DeviceMotionEvent' in window && (window as any).DeviceMotionEvent.requestPermission) {
      // iOS devices with haptic feedback
      try {
        // This would require permission and proper iOS implementation
        // For now, we'll just use vibration fallback
      } catch (error) {
        // Silently fail on unsupported devices
      }
    }
  }, [enabled]);

  const impact = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    triggerHaptic(intensity);
  }, [triggerHaptic]);

  const selection = useCallback(() => {
    triggerHaptic('selection');
  }, [triggerHaptic]);

  const notification = useCallback((type: 'success' | 'warning' | 'error' = 'success') => {
    if (type === 'error') {
      triggerHaptic('heavy');
    } else {
      triggerHaptic('notification');
    }
  }, [triggerHaptic]);

  return {
    triggerHaptic,
    impact,
    selection,
    notification
  };
}