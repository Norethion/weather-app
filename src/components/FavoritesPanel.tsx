import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useFavoriteCities } from '../hooks/useLocalStorage';

type FavoritesPanelProps = {
  onCitySelect: (city: string) => void;
};

const FavoritesPanel: React.FC<FavoritesPanelProps> = ({ onCitySelect }) => {
  const { t } = useTranslation();
  const { favorites, clearFavorites } = useFavoriteCities();

  return (
    <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white dark:text-white flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          {t('favorites')}
        </h3>
        {favorites.length > 0 && (
          <button
            onClick={clearFavorites}
            className="text-xs text-red-400 hover:text-red-300 dark:text-red-400 dark:hover:text-red-300 transition-colors px-2 py-1 rounded hover:bg-red-500/10"
            title={t('clearFavorites')}
          >
            ✕
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {favorites.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📍</div>
            <p className="text-gray-300 dark:text-gray-400 text-sm">
              {t('noFavorites')}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
              Şehir aradığınızda ⭐ butonuna tıklayarak favorilere ekleyebilirsiniz
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {favorites.map((city, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onCitySelect(city)}
                className="w-full flex items-center justify-between bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-600/20 dark:to-purple-600/20 hover:from-blue-500/30 hover:to-purple-500/30 dark:hover:from-blue-600/30 dark:hover:to-purple-600/30 rounded-lg px-4 py-3 text-left transition-all duration-200 border border-white/10 dark:border-gray-600/30 backdrop-blur-sm"
              >
                <span className="font-medium text-white dark:text-white truncate">
                  {city}
                </span>
                <span className="text-blue-300 dark:text-blue-400 ml-2 text-lg">→</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPanel; 