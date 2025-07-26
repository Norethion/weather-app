# Firebase Kurulum Rehberi

Bu rehber, hava durumu uygulamanız için Firebase'i nasıl kuracağınızı ve yapılandıracağınızı açıklar.

## 1. Firebase Projesi Oluşturma

1. [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. "Proje Ekle" butonuna tıklayın
3. Proje adını girin (örn: "weather-app")
4. Google Analytics'i etkinleştirin (isteğe bağlı)
5. "Proje Oluştur" butonuna tıklayın

## 2. Authentication Kurulumu

1. Sol menüden "Authentication" seçin
2. "Başlayın" butonuna tıklayın
3. "Sign-in method" sekmesine gidin
4. "Email/Password" sağlayıcısını etkinleştirin
5. "Kaydet" butonuna tıklayın

## 3. Firestore Database Kurulumu

1. Sol menüden "Firestore Database" seçin
2. "Veritabanı oluştur" butonuna tıklayın
3. "Test modunda başlat" seçeneğini seçin
4. Bölge seçin (örn: "europe-west3")
5. "Bitti" butonuna tıklayın

## 4. Güvenlik Kuralları

Firestore'da "Rules" sekmesine gidin ve aşağıdaki kuralları ekleyin:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kullanıcılar sadece kendi verilerini okuyabilir/yazabilir
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Hava durumu geçmişi - kullanıcılar sadece kendi verilerini okuyabilir/yazabilir
    match /weatherHistory/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Kullanıcı tercihleri (tema, dil, bölge, favoriler)
    match /userPreferences/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 5. Web Uygulaması Ekleme

1. Proje genel bakış sayfasında "</>" simgesine tıklayın
2. Uygulama takma adı girin (örn: "weather-app-web")
3. "Firebase Hosting'i de kur" seçeneğini işaretleyin
4. "Uygulama kaydet" butonuna tıklayın
5. Firebase SDK yapılandırmasını kopyalayın

## 6. Environment Variables Kurulumu

Proje kök dizininde `.env` dosyası oluşturun:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-api-key-here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your-app-id

# OpenWeatherMap API Key (isteğe bağlı)
REACT_APP_OPENWEATHER_API_KEY=your-openweather-api-key
```

## 7. Gerekli Paketlerin Kurulumu

```bash
npm install firebase
```

## 8. Kullanıcı Veri Yapısı

Firestore'da kullanıcı verileri şu yapıda saklanır:

```javascript
// users/{userId} koleksiyonu
{
  uid: "user_id",
  email: "user@example.com",
  displayName: "Kullanıcı Adı",
  createdAt: timestamp,
  lastLogin: timestamp,
  isActive: true,
  preferences: {
    theme: "auto" | "light" | "dark",
    language: "tr" | "en", 
    region: "TR" | "EU" | "AF" | "NA" | "SA" | "AS" | "OC" | "ALL",
    favorites: ["İstanbul", "Ankara", "İzmir"],
    lastUpdated: timestamp
  }
}
```

### Yeni Özellikler:
- **Tema Seçimi**: Otomatik, Açık, Koyu
- **Dil Seçimi**: Türkçe, İngilizce
- **Bölge Seçimi**: Türkiye, Avrupa, Afrika, Amerika, Asya, Okyanusya, Tüm Dünya
- **Favori Şehirler**: Kullanıcının kaydettiği şehirler

## 9. Uygulamayı Test Etme

1. `npm start` komutuyla uygulamayı başlatın
2. "Login" butonuna tıklayın
3. Yeni hesap oluşturun veya mevcut hesapla giriş yapın
4. Favori şehirlerinizi kaydedin
5. Tema, dil ve bölge tercihlerinizi test edin

## 10. Production Deployment

### Firebase Hosting ile:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

### Vercel ile:

1. [Vercel](https://vercel.com) hesabı oluşturun
2. GitHub reponuzu bağlayın
3. Environment variables'ları Vercel dashboard'da ayarlayın
4. Deploy edin

## 11. Güvenlik Notları

- `.env` dosyasını asla GitHub'a commit etmeyin
- Firebase API anahtarlarınızı güvenli tutun
- Production'da Firestore güvenlik kurallarını sıkılaştırın
- Rate limiting uygulayın

## 12. Sorun Giderme

### Yaygın Hatalar:

1. **"Firebase App named '[DEFAULT]' already exists"**
   - Firebase'i sadece bir kez initialize edin

2. **"Permission denied"**
   - Firestore güvenlik kurallarını kontrol edin

3. **"API key not valid"**
   - Environment variables'ları kontrol edin
   - Firebase Console'dan API anahtarını doğrulayın

### Debug İpuçları:

```javascript
// Firebase debug modunu etkinleştirin
localStorage.setItem('debug', 'firebase:*');
```

## 12. Ek Özellikler

### Push Notifications:
1. Firebase Console'da "Cloud Messaging" etkinleştirin
2. Service worker ekleyin
3. Notification izinlerini yönetin

### Analytics:
1. Firebase Console'da "Analytics" etkinleştirin
2. Kullanıcı davranışlarını takip edin

### Performance Monitoring:
1. Firebase Console'da "Performance" etkinleştirin
2. Uygulama performansını izleyin

## Destek

Sorun yaşarsanız:
1. Firebase Console'da "Help" bölümünü kontrol edin
2. Firebase dokümantasyonunu inceleyin
3. Stack Overflow'da arama yapın 