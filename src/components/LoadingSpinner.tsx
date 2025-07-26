import React from 'react';
import Lottie from 'lottie-react';
import { useTranslation } from 'react-i18next';
import sunAnimation from '../lottie/sun.json';
import cloudAnimation from '../lottie/cloud.json';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  variant?: 'default' | 'weather';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  message, 
  variant = 'default' 
}) => {
  const { t } = useTranslation();

  const getSize = () => {
    switch (size) {
      case 'small': return { width: 32, height: 32 };
      case 'large': return { width: 128, height: 128 };
      default: return { width: 64, height: 64 };
    }
  };

  const getAnimation = () => {
    if (variant === 'weather') {
      return Math.random() > 0.5 ? sunAnimation : cloudAnimation;
    }
    return sunAnimation;
  };

  if (variant === 'weather') {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Lottie 
          autoplay 
          loop 
          animationData={getAnimation()} 
          style={getSize()} 
        />
        <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
          {message || t('loading')}
        </p>
        <div className="mt-2 w-32 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        <div 
          className={`border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin`}
          style={getSize()}
        />
      </div>
      <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
        {message || t('loading')}
      </p>
    </div>
  );
};

export default LoadingSpinner; 