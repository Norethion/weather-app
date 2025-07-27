import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useFavoriteCities } from '../hooks/useLocalStorage';
import { useFirebaseSettings } from '../hooks/useFirebaseSettings';

type FavoritesPanelProps = {
  onCitySelect: (city: string) => void;
};

const FavoritesPanel: React.FC<FavoritesPanelProps> = ({ onCitySelect }) => {
  const { t } = useTranslation();
  const { favorites, clearFavorites } = useFavoriteCities();
  const { user, recentSearches, clearSearches, isAuthenticated } = useFirebaseSettings();
  const [activeTab, setActiveTab] = useState<'favorites' | 'recent'>('favorites');

  const handleCitySelect = (city: string) => {
    onCitySelect(city);
  };

  return (
    <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
      {/* Tab Navigation */}
      <div className="flex mb-4 sm:mb-6 bg-white/10 dark:bg-gray-700/30 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'favorites'
              ? 'bg-white/20 dark:bg-gray-600/50 text-white shadow-sm'
              : 'text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-white'
          }`}
        >
          ⭐ {t('favorites')}
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'recent'
              ? 'bg-white/20 dark:bg-gray-600/50 text-white shadow-sm'
              : 'text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-white'
          }`}
        >
          🕒 {t('recentSearches') || 'Son Aramalar'}
        </button>
      </div>

      {/* User Status */}
      {isAuthenticated && (
        <div className="mb-4 p-3 bg-green-500/20 dark:bg-green-600/20 rounded-lg border border-green-500/30">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-400">✓</span>
            <span className="text-green-300">
              {user?.isAnonymous 
                ? t('anonymousUser') || 'Anonim Kullanıcı'
                : t('authenticatedUser') || 'Giriş Yapıldı'
              }
            </span>
          </div>
          <p className="text-xs text-green-400/80 mt-1">
            {user?.isAnonymous 
              ? t('anonymousSyncInfo') || 'Ayarlarınız anonim olarak kaydediliyor'
              : t('syncInfo') || 'Ayarlarınız senkronize ediliyor'
            }
          </p>
        </div>
      )}

      {/* Favorites Tab */}
      {activeTab === 'favorites' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-white dark:text-white flex items-center gap-2">
              <span className="text-xl sm:text-2xl">⭐</span>
              {t('favorites')}
            </h3>
            {favorites.length > 0 && (
              <button
                onClick={clearFavorites}
                className="text-xs text-red-400 hover:text-red-300 dark:text-red-400 dark:hover:text-red-300 transition-colors px-2 py-1 rounded hover:bg-red-500/10 min-h-[32px] min-w-[32px] touch-manipulation"
                title={t('clearFavorites')}
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            {favorites.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <div className="text-3xl sm:text-4xl mb-3">📍</div>
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
                    onClick={() => handleCitySelect(city)}
                    className="w-full flex items-center justify-between bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-600/20 dark:to-purple-600/20 hover:from-blue-500/30 hover:to-purple-500/30 dark:hover:from-blue-600/30 dark:hover:to-purple-600/30 rounded-lg px-3 sm:px-4 py-3 text-left transition-all duration-200 border border-white/10 dark:border-gray-600/30 backdrop-blur-sm min-h-[44px] touch-manipulation"
                  >
                    <span className="font-medium text-white dark:text-white truncate text-sm sm:text-base">
                      {city}
                    </span>
                    <span className="text-blue-300 dark:text-blue-400 ml-2 text-lg">→</span>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Searches Tab */}
      {activeTab === 'recent' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-white dark:text-white flex items-center gap-2">
              <span className="text-xl sm:text-2xl">🕒</span>
              {t('recentSearches') || 'Son Aramalar'}
            </h3>
            {recentSearches.length > 0 && (
              <button
                onClick={clearSearches}
                className="text-xs text-red-400 hover:text-red-300 dark:text-red-400 dark:hover:text-red-300 transition-colors px-2 py-1 rounded hover:bg-red-500/10 min-h-[32px] min-w-[32px] touch-manipulation"
                title={t('clearRecentSearches') || 'Son Aramaları Temizle'}
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            {recentSearches.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <div className="text-3xl sm:text-4xl mb-3">🔍</div>
                <p className="text-gray-300 dark:text-gray-400 text-sm">
                  {t('noRecentSearches') || 'Henüz arama yapmadınız'}
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                  Şehir aradığınızda burada görünecek
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentSearches.map((city, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCitySelect(city)}
                    className="w-full flex items-center justify-between bg-gradient-to-r from-green-500/20 to-blue-500/20 dark:from-green-600/20 dark:to-blue-600/20 hover:from-green-500/30 hover:to-blue-500/30 dark:hover:from-green-600/30 dark:hover:to-blue-600/30 rounded-lg px-3 sm:px-4 py-3 text-left transition-all duration-200 border border-white/10 dark:border-gray-600/30 backdrop-blur-sm min-h-[44px] touch-manipulation"
                  >
                    <span className="font-medium text-white dark:text-white truncate text-sm sm:text-base">
                      {city}
                    </span>
                    <span className="text-green-300 dark:text-green-400 ml-2 text-lg">→</span>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesPanel; 