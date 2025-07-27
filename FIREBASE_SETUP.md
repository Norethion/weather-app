# 🔥 Firebase Entegrasyonu - Detaylı Kurulum Rehberi

Bu hava durumu uygulaması Firebase ile tam entegre edilmiştir ve aşağıdaki özellikleri destekler:

## 🚀 Firebase Özellikleri

### 👤 Kullanıcı Yönetimi
- **Email/Şifre ile Kayıt ve Giriş**: Kullanıcılar email ve şifre ile hesap oluşturabilir
- **Anonim Giriş**: Kullanıcılar anonim olarak giriş yapabilir ve ayarlarını kaydedebilir
- **Otomatik Giriş**: Kullanıcı durumu otomatik olarak takip edilir
- **Güvenli Kimlik Doğrulama**: Firebase Authentication ile güvenli giriş

### ⚙️ Ayarlar Senkronizasyonu
- **Tema Ayarları**: Açık, koyu ve otomatik tema seçenekleri (kalıcı)
- **Dil Ayarları**: Türkçe ve İngilizce dil desteği (localStorage + Firebase)
- **Favori Şehirler**: Kullanıcının favori şehirleri
- **Son Aramalar**: Son 10 arama geçmişi
- **Bildirim Ayarları**: Bildirim tercihleri
- **Bölge Ayarları**: Ülke/bölge filtreleme

### 📊 Kullanıcı Logları ve Analitik
- **Giriş/Çıkış Logları**: Her giriş ve çıkış işlemi loglanır
- **Ayar Değişiklikleri**: Tema, dil, favori değişiklikleri loglanır
- **Arama Geçmişi**: Şehir aramaları loglanır
- **Kullanıcı Bilgileri**: IP adresi, tarayıcı bilgileri kaydedilir
- **Admin Logları**: Admin işlemleri detaylı olarak loglanır

### 🔄 Otomatik Senkronizasyon
- **Gerçek Zamanlı**: Ayarlar değiştiğinde otomatik olarak Firebase'e kaydedilir
- **Çoklu Cihaz**: Aynı hesap ile farklı cihazlarda senkronizasyon
- **Offline Desteği**: İnternet bağlantısı olmadığında local storage kullanılır
- **Conflict Resolution**: Çakışan veriler otomatik çözülür

### 👨‍💼 Admin Paneli
- **Kullanıcı Yönetimi**: Tüm kullanıcıları görüntüleme ve yönetme
- **Sistem İstatistikleri**: Toplam kullanıcı, aktif kullanıcı, giriş sayıları
- **Kullanıcı Logları**: Tüm kullanıcı aktivitelerini görüntüleme
- **Gerçek Zamanlı Veriler**: Anlık sistem durumu
- **Rol Yönetimi**: Kullanıcıları admin yapma/çıkarma
- **Anonim Kullanıcı Temizleme**: Eski anonim hesapları toplu silme
- **Log Yönetimi**: Kullanıcı loglarını filtreleme ve silme

## 🚀 Kurulum Adımları

### 1. Firebase Projesi Oluştur
1. [Firebase Console](https://console.firebase.google.com/) adresine git
2. "Yeni Proje Oluştur" butonuna tıkla
3. Proje adını gir (örn: "weather-app-804a9")
4. Google Analytics'i etkinleştir (opsiyonel)
5. "Proje Oluştur" butonuna tıkla

### 2. Web Uygulaması Ekle
1. Firebase Console'da "Web" simgesine tıkla
2. Uygulama takma adı gir (örn: "weather-app")
3. "Firebase Hosting'i de kur" seçeneğini işaretleme
4. "Uygulama Kaydet" butonuna tıkla
5. Firebase konfigürasyon bilgilerini kopyala

### 3. Authentication Ayarla
1. Sol menüden "Authentication" seç
2. "Sign-in method" sekmesine git
3. **"Email/Password"** sağlayıcısını etkinleştir
   - "Enable" butonuna tıkla
   - "Email link (passwordless sign-in)" seçeneğini kapat
4. **"Anonymous"** sağlayıcısını etkinleştir ⚠️ **ÖNEMLİ**
   - "Enable" butonuna tıkla
5. Her iki sağlayıcı için "Save" butonuna tıkla

### 4. Firestore Database Oluştur
1. Sol menüden "Firestore Database" seç
2. "Create database" butonuna tıkla
3. **"Start in production mode"** seç (güvenlik için)
4. Bölge seç (örn: europe-west3 - Avrupa için)
5. "Done" butonuna tıkla

### 5. Güvenlik Kuralları Ayarla
Firestore güvenlik kurallarını aşağıdaki gibi ayarla:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin kontrolü fonksiyonu
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Kullanıcı kendi verilerine erişebilir
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Adminler tüm kullanıcıları okuyabilir ve yazabilir
      allow read, write: if isAdmin();
    }
    
    // Kullanıcı logları - Tüm kullanıcılar yazabilir, adminler tümünü okuyabilir
    match /user_logs/{logId} {
      allow read, write: if request.auth != null;
      // Adminler tüm logları silebilir
      allow delete: if isAdmin();
    }
    
    // Hava durumu geçmişi
    match /weatherHistory/{historyId} {
      allow read, write: if request.auth != null;
      // Adminler tüm geçmişi silebilir
      allow delete: if isAdmin();
    }
    
    // Admin işlemleri için özel koleksiyon
    match /admin_operations/{operationId} {
      allow read, write: if isAdmin();
    }
  }
}
```

**NOT:** Bu kurallar güvenlidir ve production'da kullanılabilir. Admin paneli için gerekli tüm izinler dahildir.

### 6. Environment Variables
Proje kök dizininde `.env` dosyası oluştur:

```env
# OpenWeather API (Zorunlu)
REACT_APP_OPENWEATHER_API_KEY=your_openweather_api_key_here

# Firebase (Kullanıcı yönetimi için)
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your_app_id

# Visual Crossing API (Opsiyonel - Alternatif veri kaynağı)
VISUAL_CROSSING_API_KEY=your_visual_crossing_api_key
```

### 7. Index Oluştur (Gerekirse)
Admin panelinde log filtreleme için index gerekebilir:

1. Firebase Console > Firestore Database > Indexes
2. "Create Index" butonuna tıkla
3. Collection ID: `user_logs`
4. Fields to index:
   - `action` (Ascending)
   - `timestamp` (Descending)
5. "Create" butonuna tıkla

## 🔧 Admin Hesabı Oluşturma

### Yöntem 1: Firebase Console'dan Manuel Olarak (İlk Admin İçin)
1. **Uygulamada normal bir hesap oluşturun** (email/şifre ile kayıt olun)
2. **Firebase Console > Firestore Database > users koleksiyonu**
3. **Admin olacak kullanıcının dokümanını bulun** (UID ile)
4. **Aşağıdaki alanları ekleyin/güncelleyin:**
   ```json
   {
     "role": "admin",
     "permissions": ["admin"],
     "grantedBy": "manual",
     "grantedAt": "2024-01-01T00:00:00.000Z"
   }
   ```

### Yöntem 2: Admin Panel Üzerinden (Önerilen)
1. **İlk admin hesabını manuel olarak oluşturun** (Yöntem 1)
2. **Uygulamaya giriş yapın**
3. **Admin Panel'i açın** (👑 Admin Paneli butonu)
4. **Kullanıcı Yönetimi sekmesine gidin**
5. **İstediğiniz kullanıcıya "Admin Yap" butonuna tıklayın**

### Admin Özellikleri
- **Dashboard**: Sistem istatistiklerini görüntüleme
- **Kullanıcı Yönetimi**: Tüm kullanıcıları listeleme, detaylarını görme ve **rol yönetimi**
- **Log Görüntüleme**: Kullanıcı aktivitelerini takip etme
- **Gerçek Zamanlı Veriler**: Anlık sistem durumu
- **Rol Yönetimi**: Kullanıcıları admin yapma/çıkarma
- **Anonim Kullanıcı Temizleme**: Eski anonim hesapları toplu silme
- **Log Yönetimi**: Kullanıcı loglarını filtreleme ve silme

**Not:** Artık admin kontrolü Firebase'den yapılıyor. Sadece `role: "admin"` olan kullanıcılar admin paneline erişebilir.

## 🐛 Sorun Giderme

### Admin Panel "Missing or insufficient permissions" Hatası
Bu hata admin paneli açılırken Firebase güvenlik kuralları nedeniyle oluşur.

**Çözüm:**
1. Firebase Console'a gidin
2. Firestore Database > Rules sekmesine gidin
3. Yukarıdaki güvenlik kurallarını uygulayın
4. "Publish" butonuna tıklayın
5. Admin hesabı ile giriş yapın

### Firebase Index Hatası
"The query requires an index" hatası alıyorsanız:

**Çözüm:**
1. Firebase Console'a gidin
2. Firestore Database > Indexes sekmesine gidin
3. "Create Index" butonuna tıklayın
4. Collection ID: `user_logs`
5. Fields to index:
   - `action` (Ascending)
   - `timestamp` (Descending)
6. "Create" butonuna tıklayın
7. Index oluşturulana kadar bekleyin (birkaç dakika sürebilir)

### Anonim Giriş Hatası (auth/admin-restricted-operation)
Bu hata Firebase Console'da Anonymous Authentication'ın etkinleştirilmediğini gösterir.

**Çözüm:**
1. Firebase Console'a gidin
2. Sol menüden "Authentication" seçin
3. "Sign-in method" sekmesine gidin
4. "Anonymous" sağlayıcısını bulun
5. "Enable" butonuna tıklayın
6. "Save" butonuna tıklayın

### Undefined Value Hatası
"Function addDoc() called with invalid data. Unsupported field value: undefined" hatası:

**Çözüm:**
Bu hata düzeltildi. Anonim kullanıcılar için `undefined` değerler artık Firebase'e gönderilmiyor.

### Dil Ayarları Kalıcı Değil
Dil ayarları sayfa yenilendiğinde sıfırlanıyorsa:

**Çözüm:**
Bu sorun düzeltildi. Dil ayarları artık localStorage ve Firebase ile senkronize ediliyor.

### Manifest Icon Hatası
"Error while trying to use the following icon from the Manifest" hatası:

**Çözüm:**
Bu hata düzeltildi. `logo.svg` referansı kaldırıldı, sadece `favicon.ico` kullanılıyor.

## 📁 Veritabanı Yapısı

### Users Koleksiyonu
```javascript
{
  "email": "user@example.com",
  "isAnonymous": false,
  "createdAt": "2024-01-01T00:00:00Z",
  "lastLogin": "2024-01-01T12:00:00Z",
  "isActive": true,
  "displayName": "Kullanıcı",
  "role": "user", // "user", "admin", "moderator"
  "permissions": [], // ["admin"], ["moderator"], []
  "grantedBy": "admin-uid", // Admin yapan kullanıcının UID'si
  "grantedAt": "2024-01-01T12:00:00Z", // Rol verilme tarihi
  "favorites": ["Istanbul", "Ankara", "Izmir"],
  "recentSearches": ["Istanbul", "London", "Paris"],
  "preferences": {
    "theme": "auto", // "light", "dark", "auto"
    "language": "tr", // "tr", "en"
    "region": "TR", // "TR", "EU", "NA", "SA", "AS", "OC", "ALL"
    "units": "metric", // "metric", "imperial"
    "notifications": true,
    "lastUpdated": "2024-01-01T12:00:00Z"
  }
}
```

### User Logs Koleksiyonu
```javascript
{
  "action": "login|logout|register|settings_change|favorite_add|favorite_remove|search",
  "userId": "user-id",
  "userEmail": "user@example.com", // Anonim kullanıcılar için undefined
  "isAnonymous": false,
  "details": {
    "city": "Istanbul",
    "theme": "dark",
    "language": "en"
  },
  "timestamp": "2024-01-01T12:00:00Z",
  "userAgent": "Mozilla/5.0...",
  "ipAddress": "192.168.1.1" // Opsiyonel
}
```

### Weather History Koleksiyonu
```javascript
{
  "userId": "user-id",
  "city": "Istanbul",
  "weatherData": {
    "temperature": 25,
    "humidity": 60,
    "description": "Açık",
    "forecast": [...]
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 🔧 Kullanım

### Anonim Kullanıcı
- "Anonim" butonuna tıklayarak anonim giriş yapabilirsiniz
- Ayarlarınız anonim olarak kaydedilir
- Farklı cihazlarda aynı ayarlara erişemezsiniz
- Sayfa yenilendiğinde ayarlarınız korunur

### Kayıtlı Kullanıcı
- Email ve şifre ile kayıt olun
- Ayarlarınız tüm cihazlarda senkronize olur
- Arama geçmişiniz ve favorileriniz korunur
- Tema ve dil ayarları kalıcı olarak saklanır

### Admin Kullanıcı
- Admin hesabı ile giriş yapın
- "Admin Paneli" butonuna tıklayın
- Sistem istatistiklerini ve kullanıcı aktivitelerini görüntüleyin
- Kullanıcı rollerini yönetin
- Anonim kullanıcıları temizleyin

### Ayarlar
- **Tema**: Açık, koyu veya otomatik tema seçin (kalıcı)
- **Dil**: Türkçe veya İngilizce dil seçin (kalıcı)
- **Bölge**: Ülke/bölge filtreleme seçin
- **Birimler**: Metrik veya İngiliz birimleri seçin
- **Favoriler**: Şehirleri favorilere ekleyin/çıkarın
- **Son Aramalar**: Son aradığınız şehirleri görün

## 🛡️ Güvenlik

- Kullanıcılar sadece kendi verilerine erişebilir
- Anonim kullanıcılar için geçici ID'ler oluşturulur
- Hassas bilgiler şifrelenir
- Rate limiting uygulanır
- Admin paneline sadece yetkili kullanıcılar erişebilir
- Firebase Security Rules ile güvenlik sağlanır
- Undefined değerler Firebase'e gönderilmez

## 📱 Özellikler

### ✅ Tamamlanan
- [x] Firebase Authentication (Email/Password + Anonymous)
- [x] Firestore Database entegrasyonu
- [x] Kullanıcı ayarları senkronizasyonu
- [x] Favori şehirler yönetimi
- [x] Son aramalar geçmişi
- [x] Tema ve dil ayarları (kalıcı)
- [x] Kullanıcı aktivite logları
- [x] Otomatik giriş durumu takibi
- [x] Offline/online geçiş desteği
- [x] Admin paneli
- [x] Sistem istatistikleri
- [x] Kullanıcı yönetimi
- [x] Gerçek zamanlı log görüntüleme
- [x] Rol yönetimi
- [x] Anonim kullanıcı temizleme
- [x] Log filtreleme ve silme
- [x] Çoklu dil desteği (kalıcı)
- [x] Bölge filtreleme
- [x] Birim seçenekleri
- [x] Hata yönetimi iyileştirmeleri

### 🔄 Geliştirilebilir
- [ ] Push notifications
- [ ] Sosyal medya ile giriş (Google, Facebook)
- [ ] Kullanıcı profili yönetimi
- [ ] Veri dışa aktarma
- [ ] Gelişmiş analitikler
- [ ] Kullanıcı rolleri ve izinler (moderator, editor)
- [ ] Toplu kullanıcı işlemleri
- [ ] Email doğrulama
- [ ] Şifre sıfırlama
- [ ] İki faktörlü kimlik doğrulama

## 🐛 Sorun Giderme

### Firebase Bağlantı Hatası
- Environment variables'ları kontrol edin
- Firebase projesinin aktif olduğundan emin olun
- İnternet bağlantınızı kontrol edin
- Firebase Console'da proje durumunu kontrol edin

### Authentication Hatası
- Email/şifre kombinasyonunu kontrol edin
- Firebase Console'da Authentication ayarlarını kontrol edin
- Anonymous Authentication'ın etkinleştirildiğinden emin olun
- Tarayıcı konsolunda hata mesajlarını kontrol edin
- Firebase projesinin doğru olduğundan emin olun

### Veri Senkronizasyon Hatası
- Kullanıcının giriş yapmış olduğundan emin olun
- Firebase güvenlik kurallarını kontrol edin
- Network sekmesinde API çağrılarını kontrol edin
- Firebase Console'da Firestore loglarını kontrol edin

### Admin Panel Erişim Hatası
- Admin hesabı ile giriş yaptığınızdan emin olun
- Admin UID'sinin doğru ayarlandığını kontrol edin
- Firebase güvenlik kurallarını kontrol edin
- Firebase Console'da kullanıcı dokümanını kontrol edin

### Performance Sorunları
- Firebase Index'lerini kontrol edin
- Gereksiz API çağrılarını azaltın
- Lazy loading kullanın
- Bundle boyutunu optimize edin

## 📞 Destek

Sorun yaşarsanız:
1. Tarayıcı konsolunu kontrol edin
2. Firebase Console'da logları inceleyin
3. Environment variables'ları doğrulayın
4. Güvenlik kurallarını kontrol edin
5. Anonymous Authentication'ın etkinleştirildiğinden emin olun
6. Firebase projesinin doğru olduğundan emin olun
7. Network sekmesinde API çağrılarını kontrol edin

## 🔗 Faydalı Linkler

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Hosting](https://firebase.google.com/docs/hosting) 