import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconHelperProps {
  name: string;
  className?: string;
  size?: number;
}

export const IconHelper: React.FC<IconHelperProps> = ({ name, className = 'w-5 h-5', size }) => {
  // Check if icon exists in Lucide
  const IconComponent = (LucideIcons as Record<string, any>)[name] || LucideIcons.Award;
  return <IconComponent className={className} size={size} />;
};
