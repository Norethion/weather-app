import React from 'react';
import { useTranslation } from 'react-i18next';

interface AlertPanelProps {
  alerts: any[];
}

const AlertPanel: React.FC<AlertPanelProps> = ({ alerts }) => {
  const { t } = useTranslation();
  if (!alerts || alerts.length === 0) return null;
  return (
    <div className="mb-4">
      {alerts.map((alert, idx) => (
        <div key={idx} className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-2 rounded shadow">
          <div className="font-bold text-lg mb-1">{alert.event || t('weatherAlert')}</div>
          <div className="text-sm mb-1">{alert.description}</div>
          <div className="text-xs text-gray-600">
            {alert.start && (
              <span>{t('start')}: {new Date(alert.start * 1000).toLocaleString('tr-TR')} </span>
            )}
            {alert.end && (
              <span>{t('end')}: {new Date(alert.end * 1000).toLocaleString('tr-TR')}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertPanel; 