import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  UserCredential,
  signInAnonymously
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

// Firebase konfigürasyonu - Environment variables kullanın
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "demo-project-id",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "demo-app-id"
};

// Firebase konfigürasyonu kontrolü
if (!process.env.REACT_APP_FIREBASE_API_KEY || process.env.REACT_APP_FIREBASE_API_KEY === "your-api-key-here") {
  console.warn("⚠️ Firebase konfigürasyonu eksik! Lütfen .env dosyasını düzenleyin.");
  console.warn("📖 FIREBASE_SETUP.md dosyasını okuyun.");
}

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Kullanıcı ayarları interface'i
export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  region: string;
  units: 'metric' | 'imperial';
  favorites: string[];
  recentSearches: string[];
  notifications: boolean;
  lastUpdated: Date;
}

// Kullanıcı log interface'i
export interface UserLog {
  action: 'login' | 'logout' | 'register' | 'settings_change' | 'favorite_add' | 'favorite_remove' | 'search';
  userId: string;
  userEmail?: string | null;
  isAnonymous: boolean;
  details?: any | null;
  timestamp: Date;
  userAgent: string;
  ipAddress?: string | null;
}

// Kullanıcı yönetimi
export const authService = {
  // Kayıt ol
  async register(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Kullanıcı profili oluştur
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        createdAt: new Date(),
        favorites: [],
        recentSearches: [],
        preferences: {
          theme: 'auto',
          language: 'tr',
          region: 'TR',
          units: 'metric',
          notifications: true,
          lastUpdated: new Date()
        },
        displayName: userCredential.user.displayName || 'Kullanıcı',
        lastLogin: new Date(),
        isActive: true,
        role: 'user' // Varsayılan rol
      });

      // Login log'u kaydet
      await this.logUserActivity(userCredential.user.uid, 'register', {
        email: userCredential.user.email,
        isAnonymous: false
      });
      
      return userCredential;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Giriş yap
  async login(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Login log'u kaydet
      await this.logUserActivity(userCredential.user.uid, 'login', {
        email: userCredential.user.email,
        isAnonymous: false
      });

      // Son giriş tarihini güncelle
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        lastLogin: new Date(),
        isActive: true
      });
      
      return userCredential;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Hata koduna göre özel mesajlar
      let errorMessage = 'Giriş yapılırken bir hata oluştu';
      
      switch (error.code) {
        case 'auth/invalid-credential':
          errorMessage = 'E-posta veya şifre yanlış';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Şifre yanlış';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Bu hesap devre dışı bırakılmış';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin';
          break;
        default:
          errorMessage = error.message || 'Bilinmeyen bir hata oluştu';
      }
      
      // Hata nesnesine özel mesajı ekle
      const customError = new Error(errorMessage);
      (customError as any).code = error.code;
      throw customError;
    }
  },

  // Anonim giriş
  async loginAnonymously(): Promise<UserCredential> {
    try {
      const userCredential = await signInAnonymously(auth);
      
      // Anonim kullanıcı profili oluştur
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        isAnonymous: true,
        createdAt: new Date(),
        favorites: [],
        recentSearches: [],
        preferences: {
          theme: 'auto',
          language: 'tr',
          region: 'TR',
          units: 'metric',
          notifications: true,
          lastUpdated: new Date()
        },
        displayName: 'Anonim Kullanıcı',
        lastLogin: new Date(),
        isActive: true,
        role: 'user' // Anonim kullanıcılar user rolünde
      });

      // Login log'u kaydet
      await this.logUserActivity(userCredential.user.uid, 'login', {
        isAnonymous: true
      });
      
      return userCredential;
    } catch (error: any) {
      console.error('Anonymous login error:', error);
      
      // Hata koduna göre özel mesajlar
      let errorMessage = 'Anonim giriş yapılırken bir hata oluştu';
      
      switch (error.code) {
        case 'auth/admin-restricted-operation':
          errorMessage = 'Anonim giriş Firebase Console\'da etkinleştirilmemiş. Lütfen Firebase Console\'da Authentication > Sign-in method > Anonymous sağlayıcısını etkinleştirin.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Anonim giriş bu projede etkinleştirilmemiş.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.';
          break;
        default:
          errorMessage = error.message || 'Bilinmeyen bir hata oluştu';
      }
      
      // Hata nesnesine özel mesajı ekle
      const customError = new Error(errorMessage);
      (customError as any).code = error.code;
      throw customError;
    }
  },

  // Çıkış yap
  async logout(): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Logout log'u kaydet
        await this.logUserActivity(currentUser.uid, 'logout', {
          email: currentUser.email,
          isAnonymous: currentUser.isAnonymous
        });
      }
      
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Kullanıcı durumu dinle
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // Mevcut kullanıcı
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // Kullanıcı aktivitesini logla
  async logUserActivity(userId: string, action: UserLog['action'], details?: any): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      const logData: any = {
        action,
        userId,
        isAnonymous: currentUser?.isAnonymous || false,
        userAgent: navigator.userAgent
      };

      // Sadece email varsa ekle (undefined değerleri Firebase'e gönderme)
      if (currentUser?.email) {
        logData.userEmail = currentUser.email;
      }

      // Sadece details varsa ekle (undefined değerleri Firebase'e gönderme)
      if (details !== undefined) {
        logData.details = details;
      }

      await addDoc(collection(db, 'user_logs'), {
        ...logData,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Log user activity error:', error);
      // Log hatası uygulamayı durdurmamalı
    }
  }
};

// Kullanıcı verileri yönetimi
export const userDataService = {
  // Kullanıcı ayarlarını kaydet
  async saveUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
    try {
      const updateData: any = {
        'preferences.lastUpdated': new Date()
      };

      // Ayarları preferences altına kaydet
      Object.entries(settings).forEach(([key, value]) => {
        if (key === 'favorites') {
          updateData.favorites = value;
        } else if (key === 'recentSearches') {
          updateData.recentSearches = value;
        } else {
          updateData[`preferences.${key}`] = value;
        }
      });

      await updateDoc(doc(db, 'users', userId), updateData);

      // Log kaydet
      await authService.logUserActivity(userId, 'settings_change', settings);
    } catch (error) {
      console.error('Save user settings error:', error);
      throw error;
    }
  },

  // Kullanıcı ayarlarını getir
  async getUserSettings(userId: string): Promise<UserSettings> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          theme: data.preferences?.theme || 'auto',
          language: data.preferences?.language || 'tr',
          region: data.preferences?.region || 'TR',
          units: data.preferences?.units || 'metric',
          favorites: data.favorites || [],
          recentSearches: data.recentSearches || [],
          notifications: data.preferences?.notifications !== false,
          lastUpdated: data.preferences?.lastUpdated?.toDate() || new Date()
        };
      }
      
      // Varsayılan ayarlar
      return {
        theme: 'auto',
        language: 'tr',
        region: 'TR',
        units: 'metric',
        favorites: [],
        recentSearches: [],
        notifications: true,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Get user settings error:', error);
      return {
        theme: 'auto',
        language: 'tr',
        region: 'TR',
        units: 'metric',
        favorites: [],
        recentSearches: [],
        notifications: true,
        lastUpdated: new Date()
      };
    }
  },

  // Kullanıcı rolünü getir
  async getUserRole(userId: string): Promise<{ role: string; permissions: string[] }> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          role: data.role || 'user',
          permissions: data.permissions || []
        };
      }
      
      // Varsayılan rol
      return {
        role: 'user',
        permissions: []
      };
    } catch (error) {
      console.error('Get user role error:', error);
      return {
        role: 'user',
        permissions: []
      };
    }
  },

  // Kullanıcı rolünü güncelle (sadece adminler yapabilir)
  async updateUserRole(userId: string, newRole: { role: string; permissions: string[] }, updatedBy: string): Promise<void> {
    try {
      // Güncelleyen kullanıcının admin olduğunu kontrol et
      const updaterRole = await this.getUserRole(updatedBy);
      if (updaterRole.role !== 'admin') {
        throw new Error('Sadece adminler kullanıcı rollerini değiştirebilir');
      }

      await updateDoc(doc(db, 'users', userId), {
        role: newRole.role,
        permissions: newRole.permissions,
        grantedBy: updatedBy,
        grantedAt: new Date()
      });

      // Log kaydet
      await authService.logUserActivity(updatedBy, 'settings_change', {
        action: 'role_update',
        targetUserId: userId,
        newRole: newRole.role
      });
    } catch (error) {
      console.error('Update user role error:', error);
      throw error;
    }
  },

  // Admin kontrolü
  async isAdmin(userId: string): Promise<boolean> {
    try {
      const userRole = await this.getUserRole(userId);
      return userRole.role === 'admin';
    } catch (error) {
      console.error('Check admin status error:', error);
      return false;
    }
  },

  // Favorileri kaydet
  async saveFavorites(userId: string, favorites: string[]): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        favorites: favorites
      });

      // Log kaydet
      await authService.logUserActivity(userId, 'favorite_add', { favorites });
    } catch (error) {
      console.error('Save favorites error:', error);
      throw error;
    }
  },

  // Favorileri getir
  async getFavorites(userId: string): Promise<string[]> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data().favorites || [];
      }
      return [];
    } catch (error) {
      console.error('Get favorites error:', error);
      return [];
    }
  },

  // Favori ekle
  async addFavorite(userId: string, city: string): Promise<void> {
    try {
      const currentFavorites = await this.getFavorites(userId);
      if (!currentFavorites.includes(city)) {
        const newFavorites = [...currentFavorites, city];
        await this.saveFavorites(userId, newFavorites);
        
        // Log kaydet
        await authService.logUserActivity(userId, 'favorite_add', { city });
      }
    } catch (error) {
      console.error('Add favorite error:', error);
      throw error;
    }
  },

  // Favori kaldır
  async removeFavorite(userId: string, city: string): Promise<void> {
    try {
      const currentFavorites = await this.getFavorites(userId);
      const newFavorites = currentFavorites.filter(fav => fav !== city);
      await this.saveFavorites(userId, newFavorites);
      
      // Log kaydet
      await authService.logUserActivity(userId, 'favorite_remove', { city });
    } catch (error) {
      console.error('Remove favorite error:', error);
      throw error;
    }
  },

  // Son aramaları kaydet
  async saveRecentSearches(userId: string, searches: string[]): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        recentSearches: searches.slice(0, 10) // Son 10 aramayı tut
      });

      // Log kaydet
      await authService.logUserActivity(userId, 'search', { searches });
    } catch (error) {
      console.error('Save recent searches error:', error);
      throw error;
    }
  },

  // Son aramaları getir
  async getRecentSearches(userId: string): Promise<string[]> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data().recentSearches || [];
      }
      return [];
    } catch (error) {
      console.error('Get recent searches error:', error);
      return [];
    }
  },

  // Arama ekle
  async addSearch(userId: string, city: string): Promise<void> {
    try {
      const currentSearches = await this.getRecentSearches(userId);
      const newSearches = [city, ...currentSearches.filter(search => search !== city)].slice(0, 10);
      await this.saveRecentSearches(userId, newSearches);
    } catch (error) {
      console.error('Add search error:', error);
      throw error;
    }
  },

  // Kullanıcı profilini getir
  async getUserProfile(userId: string): Promise<any> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }
};

// Hava durumu geçmişi yönetimi
export const weatherHistoryService = {
  // Hava durumu geçmişini kaydet
  async saveWeatherHistory(userId: string, city: string, weatherData: any): Promise<void> {
    try {
      const historyRef = doc(db, 'weatherHistory', `${userId}_${city}_${Date.now()}`);
      await setDoc(historyRef, {
        userId,
        city,
        weatherData,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Save weather history error:', error);
      throw error;
    }
  },

  // Hava durumu geçmişini getir
  async getWeatherHistory(userId: string, city?: string): Promise<any[]> {
    try {
      let q = query(collection(db, 'weatherHistory'), where('userId', '==', userId));
      if (city) {
        q = query(q, where('city', '==', city));
      }
      
      const querySnapshot = await getDocs(q);
      const history: any[] = [];
      querySnapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() });
      });
      
      return history.sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate());
    } catch (error) {
      console.error('Get weather history error:', error);
      return [];
    }
  }
};

// Kullanıcı ayarları senkronizasyon hook'u için yardımcı fonksiyonlar
export const syncUserSettings = {
  // Tema ayarını senkronize et
  async syncTheme(userId: string, theme: 'light' | 'dark' | 'auto'): Promise<void> {
    await userDataService.saveUserSettings(userId, { theme });
  },

  // Dil ayarını senkronize et
  async syncLanguage(userId: string, language: string): Promise<void> {
    await userDataService.saveUserSettings(userId, { language });
  },

  // Bölge ayarını senkronize et
  async syncRegion(userId: string, region: string): Promise<void> {
    await userDataService.saveUserSettings(userId, { region });
  },

  // Favori şehirleri senkronize et
  async syncFavorites(userId: string, favorites: string[]): Promise<void> {
    await userDataService.saveFavorites(userId, favorites);
  },

  // Son aramaları senkronize et
  async syncRecentSearches(userId: string, searches: string[]): Promise<void> {
    await userDataService.saveRecentSearches(userId, searches);
  }
};