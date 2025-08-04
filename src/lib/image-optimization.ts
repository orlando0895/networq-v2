import React from 'react';

// Image optimization utilities for mobile performance
interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  lazy?: boolean;
}

export function getOptimizedImageUrl(
  src: string, 
  options: ImageOptimizationOptions = {}
): string {
  const { quality = 80, format = 'webp', width, height } = options;
  
  // If it's already a data URL or blob, return as-is
  if (src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }
  
  // For external URLs, we can't optimize directly
  if (src.startsWith('http') && !src.includes(window.location.hostname)) {
    return src;
  }
  
  // For unsplash images, use their optimization
  if (src.includes('unsplash.com')) {
    const url = new URL(src);
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    url.searchParams.set('q', quality.toString());
    url.searchParams.set('fm', format);
    url.searchParams.set('fit', 'crop');
    url.searchParams.set('auto', 'format');
    return url.toString();
  }
  
  return src;
}

// Preload critical images
export function preloadImage(src: string, options: ImageOptimizationOptions = {}) {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = getOptimizedImageUrl(src, options);
  document.head.appendChild(link);
}

// Intersection observer for lazy loading
export function useLazyImage(threshold = 0.1) {
  const [isVisible, setIsVisible] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { imgRef, isVisible };
}