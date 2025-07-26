import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-white dark:text-gray-300">
        {t('language')}:
      </span>
      
      <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => changeLanguage('tr')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            i18n.language === 'tr'
              ? 'bg-blue-500 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {t('turkish')}
        </button>
        
        <button
          onClick={() => changeLanguage('en')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            i18n.language === 'en'
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