import React from 'react';

interface AppIconProps {
  className?: string;
  size?: number;
}

export const AppIcon: React.FC<AppIconProps> = ({ className = "", size = 24 }) => {
  return (
    <img 
      src="/icons/icon-512x512.png"
      alt="Simple Budget"
      width={size}
      height={size}
      className={`rounded ${className}`}
    />
  );
}; 