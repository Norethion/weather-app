import { Region } from '../components/RegionSelector';

export interface CitySuggestion {
  id: number;
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
}

// Nominatim API response interface
interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
  name: string;
  class: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

// Fallback şehir veritabanı (API çalışmadığında)
const fallbackCityDatabase = [
  // Türkiye şehirleri
  { id: 1, name: 'İstanbul', region: 'İstanbul', country: 'TR', latitude: 41.0082, longitude: 28.9784 },
  { id: 2, name: 'Ankara', region: 'Ankara', country: 'TR', latitude: 39.9334, longitude: 32.8597 },
  { id: 3, name: 'İzmir', region: 'İzmir', country: 'TR', latitude: 38.4192, longitude: 27.1287 },
  { id: 4, name: 'Bursa', region: 'Bursa', country: 'TR', latitude: 40.1885, longitude: 29.0610 },
  { id: 5, name: 'Antalya', region: 'Antalya', country: 'TR', latitude: 36.8969, longitude: 30.7133 },
  { id: 6, name: 'Adana', region: 'Adana', country: 'TR', latitude: 37.0000, longitude: 35.3213 },
  { id: 7, name: 'Konya', region: 'Konya', country: 'TR', latitude: 37.8667, longitude: 32.4833 },
  { id: 8, name: 'Gaziantep', region: 'Gaziantep', country: 'TR', latitude: 37.0662, longitude: 37.3833 },
  { id: 9, name: 'Mersin', region: 'Mersin', country: 'TR', latitude: 36.8000, longitude: 34.6333 },
  { id: 10, name: 'Diyarbakır', region: 'Diyarbakır', country: 'TR', latitude: 37.9144, longitude: 40.2306 },
  
  // Popüler dünya şehirleri
  { id: 101, name: 'London', region: 'England', country: 'GB', latitude: 51.5074, longitude: -0.1278 },
  { id: 102, name: 'Paris', region: 'Île-de-France', country: 'FR', latitude: 48.8566, longitude: 2.3522 },
  { id: 103, name: 'Berlin', region: 'Berlin', country: 'DE', latitude: 52.5200, longitude: 13.4050 },
  { id: 104, name: 'New York', region: 'New York', country: 'US', latitude: 40.7128, longitude: -74.0060 },
  { id: 105, name: 'Tokyo', region: 'Tokyo', country: 'JP', latitude: 35.6762, longitude: 139.6503 },
  { id: 106, name: 'Sydney', region: 'New South Wales', country: 'AU', latitude: -33.8688, longitude: 151.2093 },
  { id: 107, name: 'Cairo', region: 'Cairo', country: 'EG', latitude: 30.0444, longitude: 31.2357 },
  { id: 108, name: 'São Paulo', region: 'São Paulo', country: 'BR', latitude: -23.5505, longitude: -46.6333 }
];

export const cityService = {
  // Bölge filtreleme fonksiyonu
  filterByRegion: (cities: CitySuggestion[], region: Region): CitySuggestion[] => {
    const regionFilters = {
      'TR': (city: CitySuggestion) => city.country === 'TR',
      'EU': (city: CitySuggestion) => ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB'].includes(city.country),
      'AF': (city: CitySuggestion) => ['DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CM', 'CV', 'CF', 'TD', 'KM', 'CG', 'CD', 'DJ', 'EG', 'GQ', 'ER', 'ET', 'GA', 'GM', 'GH', 'GN', 'GW', 'CI', 'KE', 'LS', 'LR', 'LY', 'MG', 'MW', 'ML', 'MR', 'MU', 'YT', 'MA', 'MZ', 'NA', 'NE', 'NG', 'RE', 'RW', 'SH', 'ST', 'SN', 'SC', 'SL', 'SO', 'ZA', 'SS', 'SD', 'SZ', 'TZ', 'TG', 'TN', 'UG', 'EH', 'ZM', 'ZW'].includes(city.country),
      'NA': (city: CitySuggestion) => ['CA', 'MX', 'US'].includes(city.country),
      'SA': (city: CitySuggestion) => ['AR', 'BO', 'BR', 'CL', 'CO', 'EC', 'FK', 'GF', 'GY', 'PY', 'PE', 'SR', 'UY', 'VE'].includes(city.country),
      'AS': (city: CitySuggestion) => ['AF', 'AM', 'AZ', 'BH', 'BD', 'BT', 'BN', 'KH', 'CN', 'GE', 'HK', 'IN', 'ID', 'IR', 'IQ', 'IL', 'JP', 'JO', 'KZ', 'KW', 'KG', 'LA', 'LB', 'MO', 'MY', 'MV', 'MN', 'MM', 'NP', 'KP', 'OM', 'PK', 'PS', 'PH', 'QA', 'SA', 'SG', 'KR', 'LK', 'SY', 'TW', 'TJ', 'TH', 'TL', 'TR', 'TM', 'AE', 'UZ', 'VN', 'YE'].includes(city.country),
      'OC': (city: CitySuggestion) => ['AS', 'AU', 'CK', 'FJ', 'PF', 'GU', 'KI', 'MH', 'FM', 'NR', 'NC', 'NZ', 'NU', 'NF', 'MP', 'PW', 'PG', 'PN', 'WS', 'SB', 'TK', 'TO', 'TV', 'VU', 'WF'].includes(city.country),
      'ALL': () => true
    };

    const filter = regionFilters[region];
    return filter ? cities.filter(filter) : cities;
  },

  // Nominatim API ile şehir arama
  getCitySuggestions: async (query: string): Promise<CitySuggestion[]> => {
    if (query.length < 3) return [];
    
    try {
      // Önce fallback veritabanından kontrol et
      const fallbackResults = cityService.getFallbackCitySuggestions(query);
      if (fallbackResults.length > 0) {
        return fallbackResults;
      }

      // Nominatim API çağrısı - sadece büyük şehirler için
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}` +
        `&format=json` +
        `&limit=30` +
        `&addressdetails=1` +
        `&accept-language=tr,en` +
        `&countrycodes=tr,us,gb,de,fr,it,es,nl,at,ch,ca,au,jp,cn,in,br,ar,mx,ru,ua,pl,cz,hu,ro,bg,hr,si,sk,ee,lv,lt,fi,se,no,dk,ie,pt,gr,cy,mt,lu,be`
      );

      if (!response.ok) {
        throw new Error('Nominatim API error');
      }

      const results: NominatimResult[] = await response.json();
      
      // Sonuçları CitySuggestion formatına dönüştür
      const suggestions: CitySuggestion[] = results
        .filter(result => {
          // Tüm tipleri kabul et, sadece gerçekten gereksiz olanları filtrele
          return (
            result.importance > 0.05 &&
            !['platform', 'stop'].some(badWord => 
              result.name.toLowerCase().includes(badWord)
            ) &&
            // Sadece place, boundary, waterway class'larını kabul et
            ['place', 'boundary', 'waterway'].includes(result.class)
          );
        })
        .map((result, index) => {
          const address = result.address;
          const cityName = address.city || result.name;
          const stateName = address.state || '';
          const countryCode = address.country_code?.toUpperCase() || '';
          
          return {
            id: result.place_id,
            name: cityName,
            region: stateName,
            country: countryCode,
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
          };
        })
        .filter((suggestion, index, self) => {
          // Duplicate'leri kaldır
          return self.findIndex(s => s.name === suggestion.name && s.country === suggestion.country) === index;
        })
        .sort((a, b) => {
          // Önce Türkiye şehirleri, sonra diğerleri
          if (a.country === 'TR' && b.country !== 'TR') return -1;
          if (a.country !== 'TR' && b.country === 'TR') return 1;
          return 0;
        });
      
      // İlk 6 sonucu döndür
      return suggestions.slice(0, 6);
      
    } catch (error) {
      console.warn('Nominatim API error, using fallback:', error);
      // API hatası durumunda fallback veritabanını kullan
      return cityService.getFallbackCitySuggestions(query);
    }
  },

  // Fallback şehir önerileri (API çalışmadığında)
  getFallbackCitySuggestions: (query: string): CitySuggestion[] => {
    const allMatches = fallbackCityDatabase
      .filter(city =>
        city.name.toLowerCase().includes(query.toLowerCase()) ||
        city.region.toLowerCase().includes(query.toLowerCase())
      );
    
    return allMatches.slice(0, 8);
  },

  // Basit şehir listesi (eski metod - geriye uyumluluk için)
  getSimpleCitySuggestions: (query: string): CitySuggestion[] => {
    return fallbackCityDatabase.filter(city => 
      city.name.toLowerCase().includes(query.toLowerCase()) ||
      city.region.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);
  },
}; 