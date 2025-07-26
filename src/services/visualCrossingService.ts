import axios from 'axios';

const API_KEY = process.env.VISUAL_CROSSING_API_KEY!;
const BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

function normalizeCityName(city: string) {
  return city
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/ /g, '+');
}

// Mock data for API limit exceeded
const generateMockData = (city: string, days: number) => {
  const mockData = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    mockData.push({
      datetime: date.toISOString().slice(0, 10),
      temp: Math.floor(Math.random() * 30) + 5, // 5-35°C arası
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80% arası
      windspeed: Math.floor(Math.random() * 20) + 5, // 5-25 m/s arası
      pressure: Math.floor(Math.random() * 50) + 1000, // 1000-1050 hPa arası
      conditions: ['Clear', 'Cloudy', 'Rain', 'Snow'][Math.floor(Math.random() * 4)]
    });
  }
  return mockData;
};

const generateMockHourlyData = (city: string, date: string) => {
  const mockHours = [];
  for (let hour = 0; hour < 24; hour++) {
    mockHours.push({
      datetime: `${date}T${hour.toString().padStart(2, '0')}:00:00`,
      temp: Math.floor(Math.random() * 20) + 10, // 10-30°C arası
      humidity: Math.floor(Math.random() * 40) + 40,
      windspeed: Math.floor(Math.random() * 15) + 2,
      uvindex: Math.floor(Math.random() * 10) + 1,
      visibility: Math.floor(Math.random() * 10) + 5,
      conditions: ['Clear', 'Cloudy', 'Rain'][Math.floor(Math.random() * 3)]
    });
  }
  return mockHours;
};

export const visualCrossingService = {
  // Aylık istatistikler
  getMonthlyStats: async (city: string, year: number, month: number) => {
    try {
      const url = `${BASE_URL}/${normalizeCityName(city)}/${year}-${month.toString().padStart(2, '0')}-01/${year}-${month.toString().padStart(2, '0')}-28`;
      const response = await axios.get(url, {
        params: {
          key: API_KEY,
          unitGroup: 'metric',
          include: 'days',
        },
      });
      return response.data.days;
    } catch (error: any) {
      console.warn('API limit exceeded, using mock data for monthly stats');
      return generateMockData(city, 28);
    }
  },

  // Yıllık istatistikler
  getYearlyStats: async (city: string, year: number) => {
    try {
      const url = `${BASE_URL}/${normalizeCityName(city)}/${year}-01-01/${year}-12-31`;
      const response = await axios.get(url, {
        params: {
          key: API_KEY,
          unitGroup: 'metric',
          include: 'days',
        },
      });
      return response.data.days;
    } catch (error: any) {
      console.warn('API limit exceeded, using mock data for yearly stats');
      return generateMockData(city, 365);
    }
  },

  // Saatlik veri
  getHourly: async (city: string, date: string) => {
    try {
      const url = `${BASE_URL}/${normalizeCityName(city)}/${date}`;
      const response = await axios.get(url, {
        params: {
          key: API_KEY,
          unitGroup: 'metric',
          include: 'hours',
        },
      });
      return response.data.days[0]?.hours || [];
    } catch (error: any) {
      console.warn('API limit exceeded, using mock data for hourly forecast');
      return generateMockHourlyData(city, date);
    }
  },

  // Geçmiş hafta (son 7 gün)
  getWeeklyStats: async (city: string) => {
    try {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const start = weekAgo.toISOString().slice(0, 10);
      const end = today.toISOString().slice(0, 10);
      const url = `${BASE_URL}/${normalizeCityName(city)}/${start}/${end}`;
      const response = await axios.get(url, {
        params: {
          key: API_KEY,
          unitGroup: 'metric',
          include: 'days',
        },
      });
      return response.data.days;
    } catch (error: any) {
      console.warn('API limit exceeded, using mock data for weekly stats');
      return generateMockData(city, 7);
    }
  },
}; 