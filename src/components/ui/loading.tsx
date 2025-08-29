import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  text 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
};

const PageLoader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  );
};

const ComponentLoader: React.FC<{ text?: string; className?: string }> = ({ 
  text = 'Loading...', 
  className 
}) => {
  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <LoadingSpinner text={text} />
    </div>
  );
};

export { LoadingSpinner, PageLoader, ComponentLoader };
export default LoadingSpinner;