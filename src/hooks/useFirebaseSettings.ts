import { useState, useEffect, useCallback } from 'react';
import { authService, userDataService, UserSettings } from '../services/firebase';
import { User } from 'firebase/auth';

// Firebase entegrasyonlu ayarlar hook'u
export const useFirebaseSettings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<{ role: string; permissions: string[] }>({
    role: 'user',
    permissions: []
  });
  const [settings, setSettings] = useState<UserSettings>(() => {
    // localStorage'dan dil ayarını al
    const savedLanguage = localStorage.getItem('language') || 'tr';
    
    return {
      theme: 'auto',
      language: savedLanguage,
      region: 'TR',
      units: 'metric',
      favorites: [],
      recentSearches: [],
      notifications: true,
      lastUpdated: new Date()
    };
  });
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Kullanıcı durumu dinle
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Kullanıcı giriş yaptığında ayarları ve rolü Firebase'den yükle
        try {
          const [userSettings, userRole] = await Promise.all([
            userDataService.getUserSettings(currentUser.uid),
            userDataService.getUserRole(currentUser.uid)
          ]);
          setSettings(userSettings);
          setUserRole(userRole);
        } catch (error) {
          console.error('Failed to load user data:', error);
          // Hata durumunda varsayılan ayarları kullan
        }
      } else {
        // Kullanıcı çıkış yaptığında localStorage'dan ayarları yükle
        const savedLanguage = localStorage.getItem('language') || 'tr';
        setSettings({
          theme: 'auto',
          language: savedLanguage,
          region: 'TR',
          units: 'metric',
          favorites: [],
          recentSearches: [],
          notifications: true,
          lastUpdated: new Date()
        });
        setUserRole({ role: 'user', permissions: [] });
      }
      
      setLoading(false);
      setInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  // Anonim giriş yap
  const loginAnonymously = useCallback(async () => {
    try {
      setLoading(true);
      await authService.loginAnonymously();
    } catch (error) {
      console.error('Anonymous login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Ayarları güncelle ve Firebase'e kaydet
  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings, lastUpdated: new Date() };
    setSettings(updatedSettings);

    // Kullanıcı giriş yapmışsa Firebase'e kaydet
    if (user) {
      try {
        await userDataService.saveUserSettings(user.uid, newSettings);
      } catch (error) {
        console.error('Failed to save settings to Firebase:', error);
        // Hata durumunda local state'i geri al
        setSettings(settings);
        throw error;
      }
    }
  }, [settings, user]);

  // Tema ayarını güncelle
  const setTheme = useCallback(async (theme: 'light' | 'dark' | 'auto') => {
    await updateSettings({ theme });
  }, [updateSettings]);

  // Dil ayarını güncelle
  const setLanguage = useCallback(async (language: string) => {
    // Önce localStorage'a kaydet (hem giriş yapmış hem yapmamış kullanıcılar için)
    localStorage.setItem('language', language);
    
    await updateSettings({ language });
  }, [updateSettings]);

  // Bölge ayarını güncelle
  const setRegion = useCallback(async (region: string) => {
    await updateSettings({ region });
  }, [updateSettings]);

  // Birim ayarını güncelle
  const setUnits = useCallback(async (units: 'metric' | 'imperial') => {
    await updateSettings({ units });
  }, [updateSettings]);

  // Bildirim ayarını güncelle
  const setNotifications = useCallback(async (notifications: boolean) => {
    await updateSettings({ notifications });
  }, [updateSettings]);

  // Favori ekle
  const addFavorite = useCallback(async (city: string) => {
    if (!settings.favorites.includes(city)) {
      const newFavorites = [...settings.favorites, city];
      await updateSettings({ favorites: newFavorites });
      
      if (user) {
        try {
          await userDataService.addFavorite(user.uid, city);
        } catch (error) {
          console.error('Failed to add favorite to Firebase:', error);
        }
      }
    }
  }, [settings.favorites, updateSettings, user]);

  // Favori kaldır
  const removeFavorite = useCallback(async (city: string) => {
    const newFavorites = settings.favorites.filter(fav => fav !== city);
    await updateSettings({ favorites: newFavorites });
    
    if (user) {
      try {
        await userDataService.removeFavorite(user.uid, city);
      } catch (error) {
        console.error('Failed to remove favorite from Firebase:', error);
      }
    }
  }, [settings.favorites, updateSettings, user]);

  // Favorileri temizle
  const clearFavorites = useCallback(async () => {
    await updateSettings({ favorites: [] });
    
    if (user) {
      try {
        await userDataService.saveFavorites(user.uid, []);
      } catch (error) {
        console.error('Failed to clear favorites in Firebase:', error);
      }
    }
  }, [updateSettings, user]);

  // Arama ekle
  const addSearch = useCallback(async (city: string) => {
    const newSearches = [city, ...settings.recentSearches.filter(search => search !== city)].slice(0, 10);
    await updateSettings({ recentSearches: newSearches });
    
    if (user) {
      try {
        await userDataService.addSearch(user.uid, city);
      } catch (error) {
        console.error('Failed to add search to Firebase:', error);
      }
    }
  }, [settings.recentSearches, updateSettings, user]);

  // Aramaları temizle
  const clearSearches = useCallback(async () => {
    await updateSettings({ recentSearches: [] });
    
    if (user) {
      try {
        await userDataService.saveRecentSearches(user.uid, []);
      } catch (error) {
        console.error('Failed to clear searches in Firebase:', error);
      }
    }
  }, [updateSettings, user]);

  // Tüm ayarları sıfırla
  const resetSettings = useCallback(async () => {
    const defaultSettings: UserSettings = {
      theme: 'auto',
      language: 'tr',
      region: 'TR',
      units: 'metric',
      favorites: [],
      recentSearches: [],
      notifications: true,
      lastUpdated: new Date()
    };
    
    setSettings(defaultSettings);
    
    // localStorage'ı da temizle
    localStorage.removeItem('language');
    
    if (user) {
      try {
        await userDataService.saveUserSettings(user.uid, defaultSettings);
      } catch (error) {
        console.error('Failed to reset settings in Firebase:', error);
      }
    }
  }, [user]);

  return {
    // State
    user,
    settings,
    loading,
    initialized,
    
    // Actions
    loginAnonymously,
    updateSettings,
    setTheme,
    setLanguage,
    setRegion,
    setUnits,
    setNotifications,
    addFavorite,
    removeFavorite,
    clearFavorites,
    addSearch,
    clearSearches,
    resetSettings,
    
    // Computed values
    isAuthenticated: !!user,
    isAnonymous: user?.isAnonymous || false,
    isAdmin: userRole.role === 'admin',
    theme: settings.theme,
    language: settings.language,
    region: settings.region,
    units: settings.units,
    favorites: settings.favorites,
    recentSearches: settings.recentSearches,
    notifications: settings.notifications
  };
}; 