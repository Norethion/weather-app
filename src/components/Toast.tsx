import React, { useEffect, useState } from 'react';


export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, type, title, message, duration = 5000, onClose }) => {

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-blue-500';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success': return 'border-green-200';
      case 'error': return 'border-red-200';
      case 'warning': return 'border-yellow-200';
      case 'info': return 'border-blue-200';
      default: return 'border-blue-200';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`bg-white dark:bg-gray-800 border-l-4 ${getBorderColor()} shadow-lg rounded-lg p-4 min-w-80 max-w-sm`}>
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">
            <span className="text-2xl">{getIcon()}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
              {message}
            </p>
          </div>
          <div className="flex-shrink-0 ml-3">
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onClose(id), 300);
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="mt-2">
          <div className={`h-1 ${getBgColor()} rounded-full transition-all duration-300`} />
        </div>
      </div>
    </div>
  );
};

export default Toast; 