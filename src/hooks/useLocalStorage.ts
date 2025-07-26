import { useState, useEffect } from 'react';

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
};

// Sık kullanılan şehirler için özel hook
export const useFavoriteCities = () => {
  const [favorites, setFavorites] = useLocalStorage<string[]>('favoriteCities', []);

  const addFavorite = (city: string) => {
    if (!favorites.includes(city)) {
      setFavorites([...favorites, city].slice(-5)); // Son 5 şehri tut
    }
  };

  const removeFavorite = (city: string) => {
    setFavorites(favorites.filter(fav => fav !== city));
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    clearFavorites,
  };
};

// Basit tema sistemi
export type ThemeMode = 'light' | 'dark' | 'auto';

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme') as ThemeMode;
    return saved || 'auto';
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>(() => {
    if (theme === 'auto') {
      const hour = new Date().getHours();
      return hour >= 6 && hour < 18 ? 'light' : 'dark';
    }
    return theme;
  });

  // Tema değişikliğini uygula
  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    let newActualTheme: 'light' | 'dark';
    
    if (theme === 'auto') {
      const hour = new Date().getHours();
      newActualTheme = hour >= 6 && hour < 18 ? 'light' : 'dark';
    } else {
      newActualTheme = theme;
    }
    
    setActualTheme(newActualTheme);
    
    // HTML class'ını güncelle
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newActualTheme);
    
    // Body class'ını güncelle
    document.body.className = newActualTheme === 'dark' ? 'dark' : 'light';
    
  }, [theme]);

  // Otomatik tema için saat kontrolü
  useEffect(() => {
    if (theme === 'auto') {
      const checkTime = () => {
        const hour = new Date().getHours();
        const newActualTheme = hour >= 6 && hour < 18 ? 'light' : 'dark';
        
        if (newActualTheme !== actualTheme) {
          setActualTheme(newActualTheme);
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(newActualTheme);
          document.body.className = newActualTheme === 'dark' ? 'dark' : 'light';
        }
      };

      // Her dakika kontrol et
      const interval = setInterval(checkTime, 60000);
      return () => clearInterval(interval);
    }
  }, [theme, actualTheme]);

  const toggleTheme = () => {
    if (theme === 'auto') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('auto');
    }
  };

  const setLightTheme = () => setTheme('light');
  const setDarkTheme = () => setTheme('dark');
  const setAutoTheme = () => setTheme('auto');

  return {
    theme,
    actualTheme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setAutoTheme,
    isAuto: theme === 'auto',
    isLight: actualTheme === 'light',
    isDark: actualTheme === 'dark'
  };
}; 