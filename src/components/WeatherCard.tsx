import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CurrentWeather, AirQuality } from '../services/weatherService';
import { getWeatherBackground, isDayTime, formatTime, formatDate, getAirQualityText, getWindDirection, getHumidityText } from '../utils/weatherUtils';
import { useFavoriteCities } from '../hooks/useLocalStorage';
import Lottie from 'lottie-react';
import sunAnimation from '../lottie/sun.json';
import rainAnimation from '../lottie/rain.json';
import snowAnimation from '../lottie/snow.json';
import cloudAnimation from '../lottie/cloud.json';
import thunderAnimation from '../lottie/thunder.json';
import fogAnimation from '../lottie/fog.json';

// Hava durumu ID'sine göre animasyon seç
const getLottieAnimation = (weatherId: number) => {
  if (weatherId >= 200 && weatherId < 300) return thunderAnimation;
  if (weatherId >= 300 && weatherId < 600) return rainAnimation;
  if (weatherId >= 600 && weatherId < 700) return snowAnimation;
  if (weatherId >= 700 && weatherId < 800) return fogAnimation;
  if (weatherId === 800) return sunAnimation;
  if (weatherId > 800) return cloudAnimation;
  return sunAnimation;
};

type WeatherCardProps = {
  weather: CurrentWeather;
  airQuality?: AirQuality;
  onRefresh?: () => void;
};

const WeatherCard: React.FC<WeatherCardProps> = ({ weather, airQuality, onRefresh }) => {
  const { t } = useTranslation();
  const { favorites, addFavorite, removeFavorite } = useFavoriteCities();

  const isDay = isDayTime(weather.sys.sunrise, weather.sys.sunset, weather.dt);
  const backgroundClass = getWeatherBackground(weather.weather[0].id, isDay);
  // const weatherIcon = getWeatherIcon(weather.weather[0].id, isDay);
  const isFavorite = favorites.includes(weather.name);

  const handleFavoriteToggle = () => {
    if (isFavorite) {
      removeFavorite(weather.name);
    } else {
      addFavorite(weather.name);
    }
  };

  const airQualityData = airQuality?.list[0];
  const aqiText = airQualityData ? getAirQualityText(airQualityData.main.aqi, t) : null;
  const lottieAnim = getLottieAnimation(weather.weather[0].id);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`${backgroundClass} rounded-lg shadow-lg p-4 sm:p-6 text-white transition-all duration-300 relative overflow-hidden`}
    >
      {/* Arka plan overlay'i */}
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      <div className="relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex justify-between items-start mb-4"
        >
          <div>
            <motion.h2 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-3xl font-bold"
            >
              {weather.name}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-lg opacity-90"
            >
              {weather.sys.country}
            </motion.p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.75 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-sm opacity-75"
            >
              {formatDate(weather.dt, weather.timezone)}
            </motion.p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.75 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-sm opacity-75"
            >
              {formatTime(weather.dt, weather.timezone)}
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex gap-2"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFavoriteToggle}
              className={`p-2 sm:p-3 rounded-full transition-colors min-h-[44px] min-w-[44px] touch-manipulation ${isFavorite
                  ? 'bg-yellow-500 hover:bg-yellow-600'
                  : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                }`}
              title={isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
            >
              {isFavorite ? '⭐' : '☆'}
            </motion.button>

            {onRefresh && (
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRefresh}
                className="p-2 sm:p-3 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                title="Yenile"
              >
                🔄
              </motion.button>
            )}
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto">
              <Lottie autoplay loop animationData={lottieAnim} style={{ height: '100%', width: '100%' }} />
            </div>
            <p className="text-sm sm:text-base lg:text-lg capitalize">{weather.weather[0].description}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="text-center sm:text-right"
          >
            <motion.p 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0, duration: 0.6, type: "spring", stiffness: 200 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold"
            >
              {Math.round(weather.main.temp)}°C
            </motion.p>
            <p className="text-sm sm:text-base lg:text-lg opacity-90">
              {t('feelsLike')}: {Math.round(weather.main.feels_like)}°C
            </p>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6"
        >
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white bg-opacity-20 rounded-lg p-3 sm:p-4"
          >
            <p className="text-xs sm:text-sm opacity-75">{t('humidity')}</p>
            <p className="text-lg sm:text-xl font-semibold">{weather.main.humidity}%</p>
            <p className="text-xs opacity-75">{getHumidityText(weather.main.humidity)}</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white bg-opacity-20 rounded-lg p-3 sm:p-4"
          >
            <p className="text-xs sm:text-sm opacity-75">{t('wind')}</p>
            <p className="text-lg sm:text-xl font-semibold">{weather.wind.speed} m/s</p>
            <p className="text-xs opacity-75">{getWindDirection(weather.wind.deg)}</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white bg-opacity-20 rounded-lg p-3"
          >
            <p className="text-sm opacity-75">{t('pressure')}</p>
            <p className="text-xl font-semibold">{weather.main.pressure} hPa</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white bg-opacity-20 rounded-lg p-3"
          >
            <p className="text-sm opacity-75">{t('localTime')}</p>
            <p className="text-xl font-semibold">{formatTime(weather.dt, weather.timezone)}</p>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4"
        >
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white bg-opacity-20 rounded-lg p-3"
          >
            <p className="text-sm opacity-75">{t('sunrise')}</p>
            <p className="text-lg font-semibold">{formatTime(weather.sys.sunrise, weather.timezone)}</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white bg-opacity-20 rounded-lg p-3"
          >
            <p className="text-sm opacity-75">{t('sunset')}</p>
            <p className="text-lg font-semibold">{formatTime(weather.sys.sunset, weather.timezone)}</p>
          </motion.div>
        </motion.div>

        {airQualityData && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.6 }}
            className="bg-white bg-opacity-20 rounded-lg p-4"
          >
            <h3 className="text-lg font-semibold mb-3">{t('airQuality')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-sm opacity-75">{t('pm25')}</p>
                <p className="text-lg font-semibold">{airQualityData.components.pm2_5} µg/m³</p>
              </div>
              <div>
                <p className="text-sm opacity-75">{t('pm10')}</p>
                <p className="text-lg font-semibold">{airQualityData.components.pm10} µg/m³</p>
              </div>
              <div>
                <p className="text-sm opacity-75">{t('co')}</p>
                <p className="text-lg font-semibold">{airQualityData.components.co} µg/m³</p>
              </div>
              <div>
                <p className="text-sm opacity-75">{t('no2')}</p>
                <p className="text-lg font-semibold">{airQualityData.components.no2} µg/m³</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white border-opacity-20">
              <p className={`text-lg font-semibold ${aqiText?.color || 'text-white'}`}>
                {aqiText?.text}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default WeatherCard; 