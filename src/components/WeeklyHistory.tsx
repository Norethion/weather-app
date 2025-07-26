import React from 'react';
import { useTranslation } from 'react-i18next';
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

interface WeeklyHistoryProps {
  data: any[];
}

const WeeklyHistory: React.FC<WeeklyHistoryProps> = ({ data }) => {
  const { t } = useTranslation();

  if (!data || data.length === 0) return null;

  // API limit aşımı kontrolü (mock data kullanılıyorsa)
  const isMockData = data.length > 0 && data[0].hasOwnProperty('conditions');

  const chartData = data.map(day => ({
    date: new Date(day.datetime).toLocaleDateString('tr-TR', { weekday: 'short' }),
    temp: Math.round(day.temp),
    humidity: day.humidity,
    windSpeed: day.windspeed,
    pressure: day.pressure,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        {t('weeklyHistory')}
      </h3>

      {isMockData && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <p className="text-sm">
            {t('apiLimitWarning')}
          </p>
        </div>
      )}

      {/* Grafik */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          {t('last7Days')}
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
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
                if (name === 'windSpeed') return [`${value} m/s`, t('wind')];
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
              name={t('wind')}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tablo */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-50 dark:bg-gray-700 rounded-lg">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-gray-800 dark:text-white">{t('date')}</th>
              <th className="px-4 py-2 text-left text-gray-800 dark:text-white">{t('temperature')}</th>
              <th className="px-4 py-2 text-left text-gray-800 dark:text-white">{t('humidity')}</th>
              <th className="px-4 py-2 text-left text-gray-800 dark:text-white">{t('wind')}</th>
              <th className="px-4 py-2 text-left text-gray-800 dark:text-white">{t('pressure')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((day, index) => (
              <tr key={index} className="border-t border-gray-200 dark:border-gray-600">
                <td className="px-4 py-2 text-gray-800 dark:text-white">
                  {new Date(day.datetime).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US')}
                </td>
                <td className="px-4 py-2 text-gray-800 dark:text-white">
                  {Math.round(day.temp)}°C
                </td>
                <td className="px-4 py-2 text-gray-800 dark:text-white">
                  {day.humidity}%
                </td>
                <td className="px-4 py-2 text-gray-800 dark:text-white">
                  {day.windspeed} m/s
                </td>
                <td className="px-4 py-2 text-gray-800 dark:text-white">
                  {day.pressure} hPa
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeeklyHistory; 