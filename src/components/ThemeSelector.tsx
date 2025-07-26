import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useLocalStorage';

const ThemeSelector: React.FC = () => {
  const { t } = useTranslation();
  const { theme, setLightTheme, setDarkTheme, setAutoTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const getThemeIcon = () => {
    if (theme === 'auto') return '🌓';
    if (theme === 'light') return '☀️';
    return '🌙';
  };

  const getThemeName = () => {
    if (theme === 'auto') return t('auto') || 'Otomatik';
    if (theme === 'light') return t('light') || 'Açık';
    return t('dark') || 'Koyu';
  };

  const themeOptions = [
    { value: 'auto', label: t('auto') || 'Otomatik', icon: '🌓', desc: t('autoThemeDesc') || 'Gün/gece otomatik' },
    { value: 'light', label: t('light') || 'Açık', icon: '☀️', desc: t('lightThemeDesc') || 'Açık tema' },
    { value: 'dark', label: t('dark') || 'Koyu', icon: '🌙', desc: t('darkThemeDesc') || 'Koyu tema' }
  ];

  const handleThemeSelect = (themeValue: string) => {
    if (themeValue === 'auto') setAutoTheme();
    else if (themeValue === 'light') setLightTheme();
    else if (themeValue === 'dark') setDarkTheme();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base min-h-[44px] touch-manipulation"
      >
        <span className="flex items-center gap-2">
          {getThemeIcon()} {getThemeName()}
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            ▼
          </motion.span>
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-64 sm:w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 backdrop-blur-sm"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                {t('selectTheme') || 'Tema Seç'}
              </h3>
              
              <div className="space-y-2">
                {themeOptions.map((option) => (
                  <motion.div
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleThemeSelect(option.value)}
                    className={`relative cursor-pointer rounded-lg p-3 border-2 transition-all duration-200 min-h-[44px] touch-manipulation ${
                      theme === option.value 
                        ? 'border-blue-500 shadow-lg bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{option.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {option.label}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {option.desc}
                          </div>
                        </div>
                      </div>
                      
                      {theme === option.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                        >
                          <span className="text-white text-sm">✓</span>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSelector; 