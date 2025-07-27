import { useState, useEffect } from 'react';
import { useFirebaseSettings } from './useFirebaseSettings';

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

// Firebase entegrasyonlu favori şehirler hook'u
export const useFavoriteCities = () => {
  const { user, favorites, addFavorite, removeFavorite, clearFavorites } = useFirebaseSettings();
  const [localFavorites, setLocalFavorites] = useLocalStorage<string[]>('favoriteCities', []);

  // Kullanıcı giriş yapmışsa Firebase'den, yoksa local storage'dan kullan
  const currentFavorites = user ? favorites : localFavorites;

  const addFavoriteCity = async (city: string) => {
    if (user) {
      await addFavorite(city);
    } else {
      if (!localFavorites.includes(city)) {
        setLocalFavorites([...localFavorites, city].slice(-5)); // Son 5 şehri tut
      }
    }
  };

  const removeFavoriteCity = async (city: string) => {
    if (user) {
      await removeFavorite(city);
    } else {
      setLocalFavorites(localFavorites.filter(fav => fav !== city));
    }
  };

  const clearFavoriteCities = async () => {
    if (user) {
      await clearFavorites();
    } else {
      setLocalFavorites([]);
    }
  };

  return {
    favorites: currentFavorites,
    addFavorite: addFavoriteCity,
    removeFavorite: removeFavoriteCity,
    clearFavorites: clearFavoriteCities,
  };
};

// Firebase entegrasyonlu tema sistemi
export type ThemeMode = 'light' | 'dark' | 'auto';

export const useTheme = () => {
  const { user, theme, setTheme: setFirebaseTheme } = useFirebaseSettings();
  const [localTheme, setLocalTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme') as ThemeMode;
    return saved || 'auto';
  });

  // Kullanıcı giriş yapmışsa Firebase'den, yoksa local storage'dan kullan
  const currentTheme = user ? theme : localTheme;

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>(() => {
    if (currentTheme === 'auto') {
      const hour = new Date().getHours();
      return hour >= 6 && hour < 18 ? 'light' : 'dark';
    }
    return currentTheme;
  });

  // Tema değişikliğini uygula
  useEffect(() => {
    if (user) {
      // Firebase kullanıcısı için localStorage'a kaydetme
    } else {
      localStorage.setItem('theme', localTheme);
    }
    
    let newActualTheme: 'light' | 'dark';
    
    if (currentTheme === 'auto') {
      const hour = new Date().getHours();
      newActualTheme = hour >= 6 && hour < 18 ? 'light' : 'dark';
    } else {
      newActualTheme = currentTheme;
    }
    
    setActualTheme(newActualTheme);
    
    // HTML class'ını güncelle
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newActualTheme);
    
    // Body class'ını güncelle
    document.body.className = newActualTheme === 'dark' ? 'dark' : 'light';
    
  }, [currentTheme, user, localTheme]);

  // Otomatik tema için saat kontrolü
  useEffect(() => {
    if (currentTheme === 'auto') {
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
  }, [currentTheme, actualTheme]);

  const toggleTheme = async () => {
    let newTheme: ThemeMode;
    
    if (currentTheme === 'auto') {
      newTheme = 'light';
    } else if (currentTheme === 'light') {
      newTheme = 'dark';
    } else {
      newTheme = 'auto';
    }

    if (user) {
      await setFirebaseTheme(newTheme);
    } else {
      setLocalTheme(newTheme);
    }
  };

  const setLightTheme = async () => {
    if (user) {
      await setFirebaseTheme('light');
    } else {
      setLocalTheme('light');
    }
  };

  const setDarkTheme = async () => {
    if (user) {
      await setFirebaseTheme('dark');
    } else {
      setLocalTheme('dark');
    }
  };

  const setAutoTheme = async () => {
    if (user) {
      await setFirebaseTheme('auto');
    } else {
      setLocalTheme('auto');
    }
  };

  return {
    theme: currentTheme,
    actualTheme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setAutoTheme,
    isAuto: currentTheme === 'auto',
    isLight: actualTheme === 'light',
    isDark: actualTheme === 'dark'
  };
}; 