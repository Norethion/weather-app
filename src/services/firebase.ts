import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  UserCredential 
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
  getDocs
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
    preferences: {
      theme: 'auto',
      language: 'tr',
      units: 'metric'
    },
    // Debug için kullanıcı bilgileri
    displayName: userCredential.user.displayName || 'Kullanıcı',
    lastLogin: new Date(),
    isActive: true
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
      return await signInWithEmailAndPassword(auth, email, password);
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

  // Çıkış yap
  async logout(): Promise<void> {
    try {
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
  }
};

// Kullanıcı verileri yönetimi
export const userDataService = {
  // Favorileri kaydet
  async saveFavorites(userId: string, favorites: string[]): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        favorites: favorites
      });
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

  // Kullanıcı tercihlerini kaydet
  async savePreferences(userId: string, preferences: any): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        preferences: {
          ...preferences,
          lastUpdated: new Date()
        }
      });
    } catch (error) {
      console.error('Save preferences error:', error);
      throw error;
    }
  },

  // Kullanıcı tercihlerini getir
  async getPreferences(userId: string): Promise<any> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return data.preferences || {
          theme: 'auto',
          language: 'tr',
          region: 'TR',
          favorites: []
        };
      }
      
      return {
        theme: 'auto',
        language: 'tr',
        region: 'TR',
        favorites: []
      };
    } catch (error) {
      console.error('Get preferences error:', error);
      return {
        theme: 'auto',
        language: 'tr',
        region: 'TR',
        favorites: []
      };
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