import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LazySectionProps {
  children: React.ReactNode;
  threshold?: number;
  className?: string;
  fallback?: React.ReactNode;
}

const LazySection: React.FC<LazySectionProps> = ({ 
  children, 
  threshold = 0.1, 
  className = "",
  fallback = <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
}) => {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Küçük bir gecikme ile yükleme animasyonu için
          setTimeout(() => setIsLoaded(true), 100);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={sectionRef} className={className}>
      <AnimatePresence mode="wait">
        {!isLoaded ? (
          <motion.div
            key="fallback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {fallback}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LazySection; 