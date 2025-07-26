import i18n from '../i18n';

export const getWeatherBackground = (weatherId: number, isDay: boolean = true): string => {
  // Hava durumu ID'lerine göre arka plan belirleme
  if (weatherId >= 200 && weatherId < 300) {
    // Gök gürültülü
    return 'bg-gradient-to-br from-gray-600 to-gray-800';
  } else if (weatherId >= 300 && weatherId < 400) {
    // Çisenti
    return 'bg-gradient-to-br from-blue-400 to-blue-600';
  } else if (weatherId >= 500 && weatherId < 600) {
    // Yağmur
    return 'bg-gradient-to-br from-blue-500 to-blue-700';
  } else if (weatherId >= 600 && weatherId < 700) {
    // Kar
    return 'bg-gradient-to-br from-blue-200 to-blue-400';
  } else if (weatherId >= 700 && weatherId < 800) {
    // Atmosferik (sis, pus)
    return 'bg-gradient-to-br from-gray-400 to-gray-600';
  } else if (weatherId === 800) {
    // Açık
    return isDay 
      ? 'bg-gradient-to-br from-blue-200 to-blue-400' 
      : 'bg-gradient-to-br from-blue-900 to-purple-900';
  } else if (weatherId >= 801 && weatherId < 900) {
    // Bulutlu
    return isDay 
      ? 'bg-gradient-to-br from-gray-300 to-gray-500' 
      : 'bg-gradient-to-br from-gray-700 to-gray-900';
  }
  
  return 'bg-gradient-to-br from-blue-200 to-blue-500';
};

export const getWeatherIcon = (weatherId: number, isDay: boolean = true): string => {
  if (weatherId >= 200 && weatherId < 300) {
    return '11d'; // Gök gürültülü
  } else if (weatherId >= 300 && weatherId < 400) {
    return '09d'; // Çisenti
  } else if (weatherId >= 500 && weatherId < 600) {
    return isDay ? '10d' : '10n'; // Yağmur
  } else if (weatherId >= 600 && weatherId < 700) {
    return isDay ? '13d' : '13n'; // Kar
  } else if (weatherId >= 700 && weatherId < 800) {
    return '50d'; // Atmosferik
  } else if (weatherId === 800) {
    return isDay ? '01d' : '01n'; // Açık
  } else if (weatherId === 801) {
    return isDay ? '02d' : '02n'; // Az bulutlu
  } else if (weatherId >= 802 && weatherId < 900) {
    return isDay ? '03d' : '03n'; // Bulutlu
  }
  
  return '01d';
};

export const isDayTime = (sunrise: number, sunset: number, currentTime: number): boolean => {
  return currentTime >= sunrise && currentTime <= sunset;
};

export const formatTime = (timestamp: number, timezone: number): string => {
  const date = new Date((timestamp + timezone) * 1000);
  return date.toLocaleTimeString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
};

export const formatDate = (timestamp: number, timezone: number): string => {
  const date = new Date((timestamp + timezone) * 1000);
  return date.toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });
};

export const getAirQualityText = (aqi: number, t: (key: string) => string): { text: string; color: string } => {
  switch (aqi) {
    case 1:
      return { text: t('airQualityGood'), color: 'text-green-600' };
    case 2:
      return { text: t('airQualityModerate'), color: 'text-yellow-600' };
    case 3:
      return { text: t('airQualityUnhealthySensitive'), color: 'text-orange-600' };
    case 4:
      return { text: t('airQualityUnhealthy'), color: 'text-red-600' };
    case 5:
      return { text: t('airQualityVeryUnhealthy'), color: 'text-purple-600' };
    default:
      return { text: t('airQualityUnknown'), color: 'text-gray-600' };
  }
};

export const getWindDirection = (degrees: number): string => {
  const directions = ['K', 'KKD', 'KD', 'DKD', 'D', 'DGD', 'GD', 'GKD', 'G', 'GKB', 'KB', 'KKB'];
  const index = Math.round(degrees / 30) % 12;
  return directions[index];
};

export const getHumidityText = (humidity: number): string => {
  if (humidity < 30) return 'Kuru';
  if (humidity < 60) return 'Normal';
  if (humidity < 80) return 'Nemli';
  return 'Çok Nemli';
}; 