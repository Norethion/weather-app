import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';
import { motion } from 'framer-motion';
import { weatherService, CurrentWeather, ForecastDay, AirQuality } from './services/weatherService';
import { useGeolocation } from './hooks/useGeolocation';
import { useTheme } from './hooks/useLocalStorage';

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

import './App.css';

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { toasts, success, error: showError } = useToast();
  const { latitude, longitude, getCurrentPosition } = useGeolocation();
  const { actualTheme } = useTheme();

  // State
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [airQuality, setAirQuality] = useState<AirQuality | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [locationRequested, setLocationRequested] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);


  // Kullanıcı durumu dinle
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

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
      //success('Başarılı', 'Konum hava durumu güncellendi.');
    } catch (err: any) {
      setError(t('cityNotFound'));
      showError(t('error'), 'Hava durumu verileri alınamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }, [t, showError]);

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
      //success('Başarılı', `${city} için hava durumu verileri güncellendi.`);
    } catch (err: any) {
      setError(t('cityNotFound'));
      showError(t('error'), `${city} için hava durumu verileri alınamadı. Lütfen tekrar deneyin.`);
    } finally {
      setLoading(false);
    }
  }, [t, showError]);

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

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        {currentWeather ? (
          <DynamicBackground key={actualTheme} weather={currentWeather}>
            <div className="container mx-auto px-4 py-8">
              {/* Header */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4"
              >
                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setCurrentWeather(null);
                      setError('');
                      setLoading(false);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all duration-300 flex items-center gap-2"
                  >
                    🏠 {t('home') || 'Ana Ekran'}
                  </motion.button>
                  <motion.h1 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-4xl font-bold text-white"
                  >
                    {t('weatherApp')}
                  </motion.h1>
                </div>
                
                <div className="flex items-center gap-4">
                  <ThemeSelector />
                  <LanguageSelector />
                  {user ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      {t('logout')}
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowAuthModal(true)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      {t('login')}
                    </motion.button>
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
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar - Favorites Panel */}
                <div className="lg:w-80 lg:flex-shrink-0">
                  <LazySection threshold={0.3}>
                    <FavoritesPanel onCitySelect={handleCitySelect} />
                  </LazySection>
                </div>

                {/* Main Content */}
                <div className="flex-1 space-y-8">
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
            <div className="container mx-auto px-4 py-8">
              {/* Header */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4"
              >
                <motion.h1 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-4xl font-bold text-white"
                >
                  {t('weatherApp')}
                </motion.h1>
                
                <div className="flex items-center gap-4">
                  <ThemeSelector />
                  <LanguageSelector />
                  {user ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      {t('logout')}
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowAuthModal(true)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      {t('login')}
                    </motion.button>
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
      </div>
    </ErrorBoundary>
  );
};

export default App;
