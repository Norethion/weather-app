import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';
import { motion } from 'framer-motion';
import { weatherService, CurrentWeather, ForecastDay, AirQuality } from './services/weatherService';
import { useGeolocation } from './hooks/useGeolocation';
import { useTheme } from './hooks/useLocalStorage';
import { useFirebaseSettings } from './hooks/useFirebaseSettings';

import { useToast } from './hooks/useToast';
import { authService } from './services/firebase';
import { User } from 'firebase/auth';

// Components
import SearchBar from './components/SearchBar';
import WeatherCard from './components/WeatherCard';
import ForecastCard from './components/ForecastCard';
import FavoritesPanel from './components/FavoritesPanel';
import LanguageSelector from './components/LanguageSelector';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import Toast from './components/Toast';
import DynamicBackground from './components/DynamicBackground';
import ThemeSelector from './components/ThemeSelector';
import AuthModal from './components/AuthModal';
import LazySection from './components/LazySection';
import UserStatus from './components/UserStatus';
import AdminPanel from './components/AdminPanel';
import ConfirmModal from './components/ConfirmModal';

import './App.css';

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { toasts, success, error: showError } = useToast();
  const { latitude, longitude, getCurrentPosition } = useGeolocation();
  const { actualTheme } = useTheme();
  const { user, addSearch, isAuthenticated, isAdmin, loginAnonymously, language } = useFirebaseSettings();

  // State
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [airQuality, setAirQuality] = useState<AirQuality | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [locationRequested, setLocationRequested] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAnonymousConfirm, setShowAnonymousConfirm] = useState(false);

  const fetchWeatherByLocation = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError('');
    
    try {
      const [weatherData, forecastData, airQualityData] = await Promise.all([
        weatherService.getCurrentWeatherByCoords(lat, lon),
        weatherService.getForecastByCoords(lat, lon),
        weatherService.getAirQuality(lat, lon),
      ]);

      setCurrentWeather(weatherData);
      setForecast(forecastData.list);
      setAirQuality(airQualityData);
      setLastUpdate(new Date());
      
      // Arama logunu kaydet
      if (isAuthenticated) {
        try {
          await addSearch(weatherData.name);
        } catch (error) {
          console.error('Failed to log search:', error);
        }
      }
    } catch (err: any) {
      setError(t('cityNotFound'));
      showError(t('error'), 'Hava durumu verileri alınamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }, [t, showError, isAuthenticated, addSearch]);

  const fetchWeatherByCity = useCallback(async (city: string) => {
    setLoading(true);
    setError('');
    
    try {
      // Önce şehir koordinatlarını al
      const coords = await weatherService.getCoordinatesFromCity(city);
      
      const [weatherData, forecastData, airQualityData] = await Promise.all([
        weatherService.getCurrentWeather(city),
        weatherService.getForecast(city),
        weatherService.getAirQuality(coords.lat, coords.lon),
      ]);

      setCurrentWeather(weatherData);
      setForecast(forecastData.list);
      setAirQuality(airQualityData);
      setLastUpdate(new Date());
      
      // Arama logunu kaydet
      if (isAuthenticated) {
        try {
          await addSearch(city);
        } catch (error) {
          console.error('Failed to log search:', error);
        }
      }
    } catch (err: any) {
      setError(t('cityNotFound'));
      showError(t('error'), `${city} için hava durumu verileri alınamadı. Lütfen tekrar deneyin.`);
    } finally {
      setLoading(false);
    }
  }, [t, showError, isAuthenticated, addSearch]);

  const handleLocationSearch = useCallback(() => {
    setLoading(true);
    setCurrentWeather(null);
    setForecast([]);
    setAirQuality(null);
    setError('');
    setLocationRequested(true);
    getCurrentPosition();
  }, [getCurrentPosition]);

  const handleCitySelect = useCallback((city: string) => {
    fetchWeatherByCity(city);
  }, [fetchWeatherByCity]);

  // Konum değişikliğinde otomatik hava durumu getir
  useEffect(() => {
    if (latitude && longitude && locationRequested) {
      fetchWeatherByLocation(latitude, longitude);
      setLocationRequested(false); // Konum alındıktan sonra flag'i sıfırla
    }
  }, [latitude, longitude, locationRequested, fetchWeatherByLocation]);

  // Firebase'den gelen dil ayarını i18n ile senkronize et
  useEffect(() => {
    if (language && i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  // Dil değişikliğinde sadece UI'ı güncelle, veri fetch etme
  useEffect(() => {
    // Sadece UI'ı yeniden render et, veri fetch etme
    setCurrentWeather(prev => prev ? { ...prev } : null);
  }, [i18n.language]);

  // Tema değişikliğinde UI'ı yeniden render et
  useEffect(() => {
    // Force re-render için state güncelle
    setCurrentWeather(prev => prev ? { ...prev } : null);
  }, [actualTheme]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      success(t('success'), t('logoutSuccess') || 'Çıkış yapıldı');
    } catch (error) {
      showError(t('error'), t('logoutError') || 'Çıkış yapılamadı');
    }
  };

  const handleAnonymousLogin = async () => {
    setShowAnonymousConfirm(true);
  };

  const confirmAnonymousLogin = async () => {
    setShowAnonymousConfirm(false);
    try {
      await loginAnonymously();
      success(t('success'), t('anonymousLoginSuccess') || 'Anonim olarak giriş yapıldı');
    } catch (error) {
      showError(t('error'), t('anonymousLoginError') || 'Anonim giriş yapılamadı');
    }
  };

  const cancelAnonymousLogin = () => {
    setShowAnonymousConfirm(false);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        {currentWeather ? (
          <DynamicBackground key={actualTheme} weather={currentWeather}>
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
              {/* Header */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-8 gap-3 sm:gap-4"
              >
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-center sm:justify-start">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setCurrentWeather(null);
                      setError('');
                      setLoading(false);
                    }}
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all duration-300 flex items-center gap-2 text-sm sm:text-base min-h-[44px] touch-manipulation"
                  >
                    🏠 <span className="hidden sm:inline">{t('home') || 'Ana Ekran'}</span>
                  </motion.button>
                  <motion.h1 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center sm:text-left"
                  >
                    {t('weatherApp')}
                  </motion.h1>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-center sm:justify-end">
                  <ThemeSelector />
                  <LanguageSelector />
                  {isAuthenticated ? (
                    <>
                      {isAdmin && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowAdminPanel(true)}
                          className="px-3 py-2 sm:px-4 sm:py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation flex items-center gap-2"
                        >
                          <span>👑</span>
                          {t('adminPanel')}
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="px-3 py-2 sm:px-4 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation"
                      >
                        {t('logout')}
                      </motion.button>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAnonymousLogin}
                        className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation"
                      >
                        {t('anonymousLogin') || 'Anonim'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAuthModal(true)}
                        className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation"
                      >
                        {t('login')}
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Search Bar */}
              <SearchBar 
                onSearch={handleCitySelect}
                onLocationSearch={handleLocationSearch}
                loading={loading}
                showLocationButton={false}
              />

              {/* Loading */}
              {loading && <LoadingSpinner />}

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
                >
                  {error}
                </motion.div>
              )}

              {/* Main Content with Sidebar */}
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                {/* Sidebar - Favorites Panel */}
                <div className="lg:w-80 lg:flex-shrink-0 order-2 lg:order-1">
                  <LazySection threshold={0.3}>
                    <FavoritesPanel onCitySelect={handleCitySelect} />
                  </LazySection>
                </div>

                {/* Main Content */}
                <div className="flex-1 space-y-6 sm:space-y-8 order-1 lg:order-2">
                  {/* Current Weather */}
                  <WeatherCard 
                    weather={currentWeather}
                    airQuality={airQuality || undefined}
                    onRefresh={() => fetchWeatherByCity(currentWeather.name)}
                  />

                  {/* 5-Day Forecast */}
                  <LazySection threshold={0.2}>
                    <ForecastCard forecast={forecast} timezone={currentWeather.timezone} />
                  </LazySection>
                </div>
              </div>

              {/* Last Update */}
              {lastUpdate && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm opacity-75 text-white mt-8"
                >
                  {t('lastUpdate')}: {lastUpdate.toLocaleTimeString(i18n.language === 'tr' ? 'tr-TR' : 'en-US')}
                </motion.div>
              )}
            </div>
          </DynamicBackground>
        ) : (
          // Welcome Screen
          <div 
            key={actualTheme}
            className={`min-h-screen ${actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-200 to-blue-500'} flex items-center justify-center transition-all duration-500`}
          >
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
              {/* Header */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-8 gap-3 sm:gap-4"
              >
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-center sm:justify-start">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setCurrentWeather(null);
                      setError('');
                      setLoading(false);
                    }}
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all duration-300 flex items-center gap-2 text-sm sm:text-base min-h-[44px] touch-manipulation"
                  >
                    🏠 <span className="hidden sm:inline">{t('home') || 'Ana Ekran'}</span>
                  </motion.button>
                  <motion.h1 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center sm:text-left"
                  >
                    {t('weatherApp')}
                  </motion.h1>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-center sm:justify-end">
                  <ThemeSelector />
                  <LanguageSelector />
                  {isAuthenticated ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      className="px-3 py-2 sm:px-4 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation"
                    >
                      {t('logout')}
                    </motion.button>
                  ) : (
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAnonymousLogin}
                        className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation"
                      >
                        {t('anonymousLogin') || 'Anonim'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAuthModal(true)}
                        className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation"
                      >
                        {t('login')}
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Search Bar */}
              <SearchBar 
                onSearch={handleCitySelect}
                onLocationSearch={handleLocationSearch}
                loading={loading}
              />

              {/* Loading */}
              {loading && <LoadingSpinner />}

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
                >
                  {error}
                </motion.div>
              )}

              {/* Welcome Message */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className={`${actualTheme === 'dark' ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm rounded-lg shadow-lg p-8 max-w-md mx-auto`}>
                  <h2 className={`text-2xl font-bold mb-4 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {t('welcomeTitle')} 🌤️
                  </h2>
                  <p className={`${actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-600'} opacity-75 mb-6`}>
                    {t('welcomeDesc')}
                  </p>
                  
                  {/* Firebase Status */}
                  {isAuthenticated && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h3 className="font-semibold text-green-800 dark:text-green-400 mb-2">
                        {user?.isAnonymous ? t('anonymousUser') || 'Anonim Kullanıcı' : t('authenticatedUser') || 'Giriş Yapıldı'}
                      </h3>
                      <p className="text-sm text-green-600 dark:text-green-300 mb-3">
                        {user?.isAnonymous 
                          ? t('anonymousSyncInfo') || 'Ayarlarınız anonim olarak kaydediliyor'
                          : t('syncInfo') || 'Ayarlarınız senkronize ediliyor'
                        }
                      </p>
                    </div>
                  )}
                  
                  {/* API Key Test */}
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">{t('apiKeyStatus')}</h3>
                    <p className="text-sm text-blue-600 mb-3">
                      {t('apiKeyStatusDesc')}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        try {
                          setLoading(true);
                          await fetchWeatherByCity('Istanbul');
                          success(t('success'), t('apiKeyWorking') || 'API key çalışıyor! Gerçek veriler alınıyor.');
                        } catch (err: any) {
                          showError(t('error'), err.message);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      {t('testApiKey')}
                    </motion.button>
                  </div>
                  
                  <div className={`space-y-2 text-sm ${actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-600'} opacity-75`}>
                    <p>{t('welcomeLocation')}</p>
                    <p>{t('welcomeSearch')}</p>
                    <p>{t('welcomeFavorites')}</p>
                    <p>{t('welcomeTheme')}</p>
                    <p>{t('welcomeLang')}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Auth Modal */}
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {}}
          showError={showError}
          showSuccess={success}
        />

        {/* Toast Notifications */}
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} />
        ))}

        {/* User Status */}
        <UserStatus />

        {/* Admin Panel */}
        {showAdminPanel && isAdmin && (
          <AdminPanel 
            isOpen={showAdminPanel}
            onClose={() => setShowAdminPanel(false)}
            currentUser={user}
          />
        )}

        {/* Anonim Giriş Onay Modalı */}
        <ConfirmModal
          open={showAnonymousConfirm}
          title="Anonim Giriş Uyarısı"
          message={`⚠️ Önemli: Anonim kullanıcı olarak giriş yaptığınızda:

• Favorileriniz, ayarlarınız ve arama geçmişiniz sadece bu oturum için kaydedilir
• Çıkış yaptığınızda tüm verileriniz kalıcı olarak silinir
• Verilerinizi kalıcı olarak kaydetmek için normal hesap oluşturmanız önerilir

Devam etmek istiyor musunuz?`}
          confirmText="Evet, Devam Et"
          cancelText="Vazgeç"
          onConfirm={confirmAnonymousLogin}
          onCancel={cancelAnonymousLogin}
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;
