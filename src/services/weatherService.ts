import axios from 'axios';
import { visualCrossingService } from './visualCrossingService';
import i18n from '../i18n';

const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY?.trim().replace(/%3B$/, '').replace(/;$/, '') || '';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Mock data for testing when API key is not available
const mockWeatherData: CurrentWeather = {
  name: "Istanbul",
  coord: { lat: 41.0082, lon: 28.9784 },
  main: {
    temp: 22,
    feels_like: 24,
    humidity: 65,
    pressure: 1013
  },
  weather: [{
    id: 800,
    main: "Clear",
    description: "açık",
    icon: "01d"
  }],
  wind: {
    speed: 3.5,
    deg: 180
  },
  sys: {
    sunrise: 1677649420,
    sunset: 1677682240,
    country: "TR"
  },
  dt: Math.floor(Date.now() / 1000),
  timezone: 10800
};

const mockForecastData: ForecastDay[] = [
  {
    dt: Math.floor(Date.now() / 1000) + 86400,
    main: { temp: 23, feels_like: 25, humidity: 60 },
    weather: [{ id: 800, main: "Clear", description: "açık", icon: "01d" }],
    wind: { speed: 4.0 },
    pop: 0.1
  },
  {
    dt: Math.floor(Date.now() / 1000) + 172800,
    main: { temp: 21, feels_like: 23, humidity: 70 },
    weather: [{ id: 801, main: "Clouds", description: "az bulutlu", icon: "02d" }],
    wind: { speed: 3.0 },
    pop: 0.2
  }
];

const mockAirQualityData: AirQuality = {
  list: [{
    main: { aqi: 2 },
    components: {
      pm2_5: 15,
      pm10: 25,
      co: 200,
      no2: 30,
      so2: 5,
      o3: 45
    }
  }]
};

// Helper function to get clean API key
const getCleanApiKey = () => {
  return API_KEY?.trim().replace(/%3B$/, '').replace(/;$/, '') || '';
};

// Track if we've already logged the API key status
let apiKeyLogged = false;

// Check if API key is valid
const isApiKeyValid = () => {
  const cleanKey = getCleanApiKey();
  if (!apiKeyLogged) {
    apiKeyLogged = true;
  }
  return cleanKey && cleanKey !== 'your-api-key-here' && cleanKey.length >= 32 && cleanKey.length <= 40;
};

export interface CurrentWeather {
  name: string;
  coord: {
    lat: number;
    lon: number;
  };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  sys: {
    sunrise: number;
    sunset: number;
    country: string;
  };
  dt: number;
  timezone: number;
}

export interface ForecastDay {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  pop: number; // Yağış olasılığı
}

export interface AirQuality {
  list: Array<{
    main: {
      aqi: number; // 1-5 arası kalite indeksi
    };
    components: {
      pm2_5: number;
      pm10: number;
      co: number;
      no2: number;
      so2: number;
      o3: number;
    };
  }>;
}

export const weatherService = {
  // Mevcut hava durumu
  getCurrentWeather: async (city: string): Promise<CurrentWeather> => {
    if (!isApiKeyValid()) {
      return mockWeatherData;
    }
    try {
      const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
          q: city,
          appid: getCleanApiKey(),
          units: 'metric',
          lang: i18n.language === 'tr' ? 'tr' : 'en',
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error("API key geçersiz. Lütfen .env dosyasında REACT_APP_OPENWEATHER_API_KEY değerini kontrol edin.");
        } else if (error.response.status === 429) {
          throw new Error("API limit aşıldı. Lütfen daha sonra tekrar deneyin.");
        } else {
          throw new Error(`API Hatası: ${error.response.data.message || error.response.statusText}`);
        }
      }
      throw new Error("Failed to fetch current weather data.");
    }
  },

  // Koordinatlarla mevcut hava durumu
  getCurrentWeatherByCoords: async (lat: number, lon: number): Promise<CurrentWeather> => {
    if (!isApiKeyValid()) {
      return mockWeatherData;
    }
    try {
      const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
          lat,
          lon,
          appid: getCleanApiKey(),
          units: 'metric',
          lang: i18n.language === 'tr' ? 'tr' : 'en',
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error("API key geçersiz. Lütfen .env dosyasında REACT_APP_OPENWEATHER_API_KEY değerini kontrol edin.");
        } else if (error.response.status === 429) {
          throw new Error("API limit aşıldı. Lütfen daha sonra tekrar deneyin.");
        } else {
          throw new Error(`API Hatası: ${error.response.data.message || error.response.statusText}`);
        }
      }
      throw new Error("Failed to fetch current weather data by coordinates.");
    }
  },

  // 5 günlük tahmin
  getForecast: async (city: string): Promise<{ list: ForecastDay[] }> => {
    if (!isApiKeyValid()) {
      return { list: mockForecastData };
    }
    try {
      const response = await axios.get(`${BASE_URL}/forecast`, {
        params: {
          q: city,
          appid: getCleanApiKey(),
          units: 'metric',
          lang: i18n.language === 'tr' ? 'tr' : 'en',
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error("API key geçersiz. Lütfen .env dosyasında REACT_APP_OPENWEATHER_API_KEY değerini kontrol edin.");
        } else if (error.response.status === 429) {
          throw new Error("API limit aşıldı. Lütfen daha sonra tekrar deneyin.");
        } else {
          throw new Error(`API Hatası: ${error.response.data.message || error.response.statusText}`);
        }
      }
      throw new Error("Failed to fetch forecast data.");
    }
  },

  // Koordinatlarla 5 günlük tahmin
  getForecastByCoords: async (lat: number, lon: number): Promise<{ list: ForecastDay[] }> => {
    if (!isApiKeyValid()) {
      return { list: mockForecastData };
    }
    try {
      const response = await axios.get(`${BASE_URL}/forecast`, {
        params: {
          lat,
          lon,
          appid: getCleanApiKey(),
          units: 'metric',
          lang: i18n.language === 'tr' ? 'tr' : 'en',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Error fetching forecast by coords:", error);
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error("API key geçersiz. Lütfen .env dosyasında REACT_APP_OPENWEATHER_API_KEY değerini kontrol edin.");
        } else if (error.response.status === 429) {
          throw new Error("API limit aşıldı. Lütfen daha sonra tekrar deneyin.");
        } else {
          throw new Error(`API Hatası: ${error.response.data.message || error.response.statusText}`);
        }
      }
      throw new Error("Failed to fetch forecast data by coordinates.");
    }
  },

  // Hava kirliliği
  getAirQuality: async (lat: number, lon: number): Promise<AirQuality> => {
    if (!isApiKeyValid()) {
      console.warn("API key not available or invalid. Returning mock air quality data.");
      return mockAirQualityData;
    }
    try {
      const response = await axios.get(`${BASE_URL}/air_pollution`, {
        params: {
          lat,
          lon,
          appid: getCleanApiKey(),
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Error fetching air quality:", error);
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error("API key geçersiz. Lütfen .env dosyasında REACT_APP_OPENWEATHER_API_KEY değerini kontrol edin.");
        } else if (error.response.status === 429) {
          throw new Error("API limit aşıldı. Lütfen daha sonra tekrar deneyin.");
        } else {
          throw new Error(`API Hatası: ${error.response.data.message || error.response.statusText}`);
        }
      }
      throw new Error("Failed to fetch air quality data.");
    }
  },

  // Hava durumu uyarıları (Visual Crossing)
  getWeatherAlerts: async (city: string): Promise<any[]> => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const days = await visualCrossingService.getMonthlyStats(city, year, month);
    const alerts: any[] = [];
    days.forEach((d: any) => {
      if (d.alerts && d.alerts.length > 0) {
        alerts.push(...d.alerts);
      }
    });
    return alerts;
  },

  // Saatlik tahmin (Visual Crossing)
  getHourlyForecast: async (city: string): Promise<any[]> => {
    const today = new Date();
    const date = today.toISOString().slice(0, 10);
    return await visualCrossingService.getHourly(city, date);
  },

  // Şehir adından koordinat alma (reverse geocoding)
  getCoordinatesFromCity: async (city: string): Promise<{ lat: number; lon: number }> => {
    if (!isApiKeyValid()) {
      console.warn("API key not available or invalid. Returning mock coordinates.");
      return { lat: 41.0082, lon: 28.9784 }; // Istanbul coordinates
    }
    
    try {
      const response = await axios.get('https://api.openweathermap.org/geo/1.0/direct', {
        params: {
          q: city,
          limit: 1,
          appid: API_KEY,
        },
      });
      
      if (response.data.length === 0) {
        throw new Error('Şehir bulunamadı');
      }
      
      return {
        lat: response.data[0].lat,
        lon: response.data[0].lon,
      };
    } catch (error: any) {
      console.error("Error fetching coordinates:", error);
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error("API key geçersiz. Lütfen .env dosyasında REACT_APP_OPENWEATHER_API_KEY değerini kontrol edin.");
        } else if (error.response.status === 429) {
          throw new Error("API limit aşıldı. Lütfen daha sonra tekrar deneyin.");
        } else {
          throw new Error(`API Hatası: ${error.response.data.message || error.response.statusText}`);
        }
      }
      throw new Error("Failed to fetch city coordinates.");
    }
  },
}; 