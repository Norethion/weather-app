import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ForecastDay } from '../services/weatherService';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import i18n from '../i18n';

type ForecastCardProps = {
  forecast: ForecastDay[];
  timezone: number;
};

const ForecastCard: React.FC<ForecastCardProps> = ({ forecast, timezone }) => {
  const { t } = useTranslation();

  // Günlük tahminleri grupla (her gün için en yüksek sıcaklık)
  const dailyForecasts = forecast.reduce((acc: ForecastDay[], item) => {
    const date = new Date((item.dt + timezone) * 1000).toDateString();
    const existingIndex = acc.findIndex(f => 
      new Date((f.dt + timezone) * 1000).toDateString() === date
    );
    
    if (existingIndex === -1) {
      acc.push(item);
    } else if (item.main.temp > acc[existingIndex].main.temp) {
      acc[existingIndex] = item;
    }
    
    return acc;
  }, []).slice(0, 5); // İlk 5 gün

  // Grafik için veri hazırla
  const chartData = dailyForecasts.map(item => ({
    day: new Date((item.dt + timezone) * 1000).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { weekday: 'short' }),
    temp: Math.round(item.main.temp),
    humidity: item.main.humidity,
    windSpeed: item.wind.speed,
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6"
    >
      <motion.h3 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-white"
      >
        {t('forecast')}
      </motion.h3>

      {/* Günlük kartlar */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6"
      >
        {dailyForecasts.map((item, idx) => {
          const dayLabel = new Date((item.dt + timezone) * 1000).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { weekday: 'long' });
          const icon = <img src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`} alt={item.weather[0].description} className="w-12 h-12 mx-auto mb-2" />;
          const description = item.weather[0].description;
          const temperature = Math.round(item.main.temp);
          const humidity = item.main.humidity;
          const windSpeed = item.wind.speed;
          const precipitation = Math.round(item.pop * 100);
          
          return (
            <motion.div 
              key={item.dt} 
              variants={cardVariants}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center justify-between bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 m-2 transition-all duration-300 min-w-[180px] max-w-[220px] text-white"
            >
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 * idx }}
                className="text-lg font-semibold mb-2"
              >
                {dayLabel}
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 * idx, duration: 0.5 }}
                className="flex flex-col items-center mb-2"
              >
                <span className="text-2xl mb-1">{icon}</span>
                <span className="capitalize text-base text-center mb-2">{description}</span>
                <motion.span 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 * idx, duration: 0.6, type: "spring", stiffness: 200 }}
                  className="text-4xl font-bold mb-1"
                >
                  {temperature}°C
                </motion.span>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 * idx, duration: 0.5 }}
                className="text-xs opacity-80 space-y-1"
              >
                <div className="mb-1">{t('humidity')}: {humidity}%</div>
                <div className="mb-1">{t('windSpeed')}: {windSpeed} m/s</div>
                <div>{t('precipitation')}: {precipitation}%</div>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Sıcaklık, Nem ve Rüzgar grafiği */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-8"
      >
        <motion.h4 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="text-lg font-semibold mb-4 text-gray-800 dark:text-white"
        >
          {t('chartTitle', { metrics: t('temperature') + ', ' + t('humidity') + ', ' + t('windSpeed') })}
        </motion.h4>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} label={{ value: '', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'temp') return [`${value}°C`, t('temperature')];
                  if (name === 'humidity') return [`${value}%`, t('humidity')];
                  if (name === 'windSpeed') return [`${value} m/s`, t('windSpeed')];
                  return [value, name];
                }}
              />
              <Line 
                type="monotone" 
                dataKey="temp" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name={t('temperature')}
              />
              <Line 
                type="monotone" 
                dataKey="humidity" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                name={t('humidity')}
              />
              <Line 
                type="monotone" 
                dataKey="windSpeed" 
                stroke="#f59e42" 
                strokeWidth={3}
                dot={{ fill: '#f59e42', strokeWidth: 2, r: 4 }}
                name={t('windSpeed')}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ForecastCard; 