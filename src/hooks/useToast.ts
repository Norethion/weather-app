import { useState, useCallback } from 'react';
import { ToastProps } from '../components/Toast';

export interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((title: string, message: string, options: ToastOptions = {}) => {
    const id = Date.now().toString();
    const newToast: ToastProps = {
      id,
      type: options.type || 'info',
      title,
      message,
      duration: options.duration || 5000,
      onClose: (toastId: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== toastId));
      }
    };

    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((title: string, message: string, duration?: number) => {
    addToast(title, message, { type: 'success', duration });
  }, [addToast]);

  const error = useCallback((title: string, message: string, duration?: number) => {
    addToast(title, message, { type: 'error', duration });
  }, [addToast]);

  const warning = useCallback((title: string, message: string, duration?: number) => {
    addToast(title, message, { type: 'warning', duration });
  }, [addToast]);

  const info = useCallback((title: string, message: string, duration?: number) => {
    addToast(title, message, { type: 'info', duration });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };
}; 