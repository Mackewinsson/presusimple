import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ className = "", size = 24 }) => {
  return (
    <div 
      className={`bg-slate-900 rounded ${className}`}
      style={{ width: size, height: size }}
    />
  );
}; 