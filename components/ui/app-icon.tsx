import React from 'react';

interface AppIconProps {
  className?: string;
  size?: number;
}

export const AppIcon: React.FC<AppIconProps> = ({ className = "", size = 24 }) => {
  return (
    <div 
      className={`bg-slate-900 rounded ${className}`}
      style={{ width: size, height: size }}
    />
  );
}; 