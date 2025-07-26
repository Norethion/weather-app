import React from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

interface HourlyForecastProps {
  data: any[];
}

const HourlyForecast: React.FC<HourlyForecastProps> = ({ data }) => {
  const { t } = useTranslation();

  if (!data || data.length === 0) return null;

  // API limit aşımı kontrolü (mock data kullanılıyorsa)
  const isMockData = data.length > 0 && data[0].hasOwnProperty('conditions');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        {t('hourlyForecast')}
      </h3>

      {isMockData && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <p className="text-sm">
            {t('apiLimitWarning')}
          </p>
        </div>
      )}

      <div className="flex overflow-x-auto space-x-4 pb-4">
        {data.map((hour, index) => (
          <div
            key={index}
            className="flex-shrink-0 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-w-[120px]"
          >
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {new Date(hour.datetime).toLocaleTimeString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {Math.round(hour.temp)}°C
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('humidity')}: {hour.humidity}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('wind')}: {hour.windspeed} m/s
              </p>
              {hour.uvindex && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  UV: {hour.uvindex}
                </p>
              )}
              {hour.visibility && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t('view')}: {hour.visibility} km
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HourlyForecast; 