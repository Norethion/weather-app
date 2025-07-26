import React from 'react';
import { motion } from 'framer-motion';
import { CurrentWeather } from '../services/weatherService';

interface DynamicBackgroundProps {
  weather: CurrentWeather;
  children: React.ReactNode;
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ weather, children }) => {
  const weatherId = weather.weather[0].id;
  const isDay = weather.sys.sunrise < weather.dt && weather.dt < weather.sys.sunset;

  // Hava durumuna göre arka plan sınıfları
  const getBackgroundClass = () => {
    if (weatherId >= 200 && weatherId < 300) {
      // Gök gürültülü
      return isDay 
        ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600' 
        : 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800';
    } else if (weatherId >= 300 && weatherId < 400) {
      // Çisenti
      return isDay 
        ? 'bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500' 
        : 'bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700';
    } else if (weatherId >= 500 && weatherId < 600) {
      // Yağmur
      return isDay 
        ? 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600' 
        : 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800';
    } else if (weatherId >= 600 && weatherId < 700) {
      // Kar
      return isDay 
        ? 'bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400' 
        : 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600';
    } else if (weatherId >= 700 && weatherId < 800) {
      // Sis
      return isDay 
        ? 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500' 
        : 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800';
    } else if (weatherId === 800) {
      // Açık
      return isDay 
        ? 'bg-gradient-to-br from-blue-200 to-blue-500' 
        : 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900';
    } else {
      // Bulutlu
      return isDay 
        ? 'bg-gradient-to-br from-blue-300 via-gray-300 to-blue-400' 
        : 'bg-gradient-to-br from-gray-700 via-gray-800 to-blue-900';
    }
  };

  // Hava durumuna göre animasyonlu elementler
  const getWeatherElements = () => {
    const elements = [];

    if (weatherId >= 200 && weatherId < 300) {
      // Gök gürültülü animasyon
      elements.push(
        <motion.div
          key="lightning"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
          className="absolute inset-0 bg-yellow-300 opacity-0 pointer-events-none"
        />
      );
    }

    if (weatherId >= 500 && weatherId < 600) {
      // Yağmur animasyonu
      for (let i = 0; i < 20; i++) {
        elements.push(
          <motion.div
            key={`rain-${i}`}
            animate={{ 
              y: [-100, window.innerHeight + 100],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 1 + Math.random() * 0.5,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            className="absolute w-0.5 h-8 bg-blue-400 opacity-60"
            style={{ 
              left: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 10 - 5}deg)`
            }}
          />
        );
      }
    }

    if (weatherId >= 600 && weatherId < 700) {
      // Kar animasyonu
      for (let i = 0; i < 30; i++) {
        elements.push(
          <motion.div
            key={`snow-${i}`}
            animate={{ 
              y: [-50, window.innerHeight + 50],
              x: [0, Math.random() * 100 - 50],
              rotate: [0, 360]
            }}
            transition={{ 
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
            className="absolute w-2 h-2 bg-white rounded-full opacity-80"
            style={{ left: `${Math.random() * 100}%` }}
          />
        );
      }
    }

    if (weatherId === 800 && isDay) {
      // Güneş animasyonu
      elements.push(
        <motion.div
          key="sun"
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-10 right-10 w-20 h-20 bg-yellow-400 rounded-full shadow-lg"
        />
      );
    }

    if (weatherId === 800 && !isDay) {
      // Ay animasyonu
      elements.push(
        <motion.div
          key="moon"
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-10 right-10 w-16 h-16 bg-gray-200 rounded-full shadow-lg"
        />
      );
    }

    // Bulut animasyonları (çoğu hava durumunda)
    if (weatherId !== 800 || !isDay) {
      for (let i = 0; i < 5; i++) {
        elements.push(
          <motion.div
            key={`cloud-${i}`}
            animate={{ 
              x: [window.innerWidth + 100, -100],
              opacity: [0, 0.7, 0]
            }}
            transition={{ 
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 10
            }}
            className="absolute w-24 h-12 bg-white/60 rounded-full opacity-0"
            style={{ 
              top: `${20 + Math.random() * 60}%`,
              transform: `scale(${0.5 + Math.random() * 0.5})`
            }}
          />
        );
      }
    }

    return elements;
  };

  return (
    <div className={`min-h-screen ${getBackgroundClass()} transition-all duration-1000 relative overflow-hidden`}>
      {/* Hava durumu animasyonları */}
      {getWeatherElements()}
      
      {/* Ana içerik */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default DynamicBackground; 