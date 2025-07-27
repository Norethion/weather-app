import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFirebaseSettings } from '../hooks/useFirebaseSettings';

const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();
  const { setLanguage, isAuthenticated, language } = useFirebaseSettings();

  // Firebase'den gelen dil ayarını kullan, yoksa i18n'den al
  const currentLanguage = language || i18n.language;

  const changeLanguage = async (lng: string) => {
    i18n.changeLanguage(lng);
    
    // Firebase'e kaydet
    if (isAuthenticated) {
      try {
        await setLanguage(lng);
      } catch (error) {
        console.error('Failed to save language setting:', error);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs sm:text-sm font-medium text-white dark:text-gray-300">
        {t('language')}:
      </span>
      
      <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => changeLanguage('tr')}
          className={`px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors min-h-[32px] touch-manipulation ${
            currentLanguage === 'tr'
              ? 'bg-blue-500 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {t('turkish')}
        </button>
        
        <button
          onClick={() => changeLanguage('en')}
          className={`px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors min-h-[32px] touch-manipulation ${
            currentLanguage === 'en'
              ? 'bg-blue-500 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {t('english')}
        </button>
      </div>
    </div>
  );
};

export default LanguageSelector; 