import React from 'react';

interface DecorativeImageProps {
  src: string;
  alt: string;
  className?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  size?: 'sm' | 'md' | 'lg';
}

export const DecorativeImage: React.FC<DecorativeImageProps> = ({
  src,
  alt,
  className = '',
  position,
  size = 'md'
}) => {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
  };

  const sizeClasses = {
    'sm': 'w-24 h-24',
    'md': 'w-32 h-32',
    'lg': 'w-40 h-40'
  };

  return (
    <div 
      className={`
        absolute ${positionClasses[position]} ${sizeClasses[size]}
        opacity-20 blur-[1px] mix-blend-screen
        hidden lg:block
        animate-fade-in
        ${className}
      `}
      style={{ zIndex: -1 }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover rounded-lg"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
};