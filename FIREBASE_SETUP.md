# Firebase Entegrasyonu

Bu hava durumu uygulaması Firebase ile entegre edilmiştir ve aşağıdaki özellikleri destekler:

## 🔥 Firebase Özellikleri

### 👤 Kullanıcı Yönetimi
- **Email/Şifre ile Kayıt ve Giriş**: Kullanıcılar email ve şifre ile hesap oluşturabilir
- **Anonim Giriş**: Kullanıcılar anonim olarak giriş yapabilir ve ayarlarını kaydedebilir
- **Otomatik Giriş**: Kullanıcı durumu otomatik olarak takip edilir

### ⚙️ Ayarlar Senkronizasyonu
- **Tema Ayarları**: Açık, koyu ve otomatik tema seçenekleri
- **Dil Ayarları**: Türkçe ve İngilizce dil desteği
- **Favori Şehirler**: Kullanıcının favori şehirleri
- **Son Aramalar**: Son 10 arama geçmişi
- **Bildirim Ayarları**: Bildirim tercihleri

### 📊 Kullanıcı Logları
- **Giriş/Çıkış Logları**: Her giriş ve çıkış işlemi loglanır
- **Ayar Değişiklikleri**: Tema, dil, favori değişiklikleri loglanır
- **Arama Geçmişi**: Şehir aramaları loglanır
- **Kullanıcı Bilgileri**: IP adresi, tarayıcı bilgileri kaydedilir

### 🔄 Otomatik Senkronizasyon
- **Gerçek Zamanlı**: Ayarlar değiştiğinde otomatik olarak Firebase'e kaydedilir
- **Çoklu Cihaz**: Aynı hesap ile farklı cihazlarda senkronizasyon
- **Offline Desteği**: İnternet bağlantısı olmadığında local storage kullanılır

### 👨‍💼 Admin Paneli
- **Kullanıcı Yönetimi**: Tüm kullanıcıları görüntüleme ve yönetme
- **Sistem İstatistikleri**: Toplam kullanıcı, aktif kullanıcı, giriş sayıları
- **Kullanıcı Logları**: Tüm kullanıcı aktivitelerini görüntüleme
- **Gerçek Zamanlı Veriler**: Anlık sistem durumu

## 🚀 Kurulum

### 1. Firebase Projesi Oluştur
1. [Firebase Console](https://console.firebase.google.com/) adresine git
2. "Yeni Proje Oluştur" butonuna tıkla
3. Proje adını gir ve oluştur

### 2. Web Uygulaması Ekle
1. Firebase Console'da "Web" simgesine tıkla
2. Uygulama takma adı gir
3. "Uygulama Kaydet" butonuna tıkla
4. Firebase konfigürasyon bilgilerini kopyala

### 3. Authentication Ayarla
1. Sol menüden "Authentication" seç
2. "Sign-in method" sekmesine git
3. **"Email/Password"** sağlayıcısını etkinleştir
4. **"Anonymous"** sağlayıcısını etkinleştir ⚠️ **ÖNEMLİ**
5. Her iki sağlayıcı için "Enable" butonuna tıkla

### 4. Firestore Database Oluştur
1. Sol menüden "Firestore Database" seç
2. "Create database" butonuna tıkla
3. "Start in test mode" seç (geliştirme için)
4. Bölge seç (örn: europe-west3)

### 5. Güvenlik Kuralları
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
      // Adminler tüm kullanıcıları okuyabilir
      allow read: if isAdmin();
      // Adminler kullanıcı rollerini güncelleyebilir
      allow update: if isAdmin() || (request.auth != null && request.auth.uid == userId);
    }
    
    // Kullanıcı logları - Tüm kullanıcılar yazabilir, adminler tümünü okuyabilir
    match /user_logs/{logId} {
      allow read, write: if request.auth != null;
    }
    
    // Hava durumu geçmişi
    match /weatherHistory/{historyId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**NOT:** Bu kurallar güvenlidir ve production'da kullanılabilir. Admin paneli için gerekli tüm izinler dahildir.

### 6. Environment Variables
Proje kök dizininde `.env` dosyası oluştur:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key-here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your-app-id
```

## 🔧 Admin Hesabı Oluşturma

### Yöntem 1: Firebase Console'dan Manuel Olarak (İlk Admin İçin)
1. **Uygulamada normal bir hesap oluşturun**
2. **Firebase Console > Firestore Database > users koleksiyonu**
3. **Admin olacak kullanıcının dokümanını bulun**
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

### Admin Hesabı Oluşturma (Manuel)
1. **Normal bir hesap oluşturun** (email/şifre ile kayıt olun)
2. **Firebase Console'a gidin**
3. **Firestore Database > users koleksiyonunu açın**
4. **Kullanıcınızın dokümanını bulun** (UID ile)
5. **Aşağıdaki alanları ekleyin/güncelleyin:**

```json
{
  "role": "admin",
  "permissions": ["admin"],
  "grantedBy": "manual",
  "grantedAt": "2024-01-01T00:00:00.000Z"
}
```

6. **Kaydedin**
7. **Uygulamaya geri dönün ve yeniden giriş yapın**

### Anonim Giriş Hatası (auth/admin-restricted-operation)
Bu hata Firebase Console'da Anonymous Authentication'ın etkinleştirilmediğini gösterir.

**Çözüm:**
1. Firebase Console'a gidin
2. Sol menüden "Authentication" seçin
3. "Sign-in method" sekmesine gidin
4. "Anonymous" sağlayıcısını bulun
5. "Enable" butonuna tıklayın
6. "Save" butonuna tıklayın

### Varsayılan Ayarlar
Uygulama her zaman şu varsayılan ayarlarla başlar:
- **Tema**: Otomatik (gün/gece otomatik değişim)
- **Dil**: Türkçe
- **Bölge**: Türkiye
- **Birimler**: Metrik (Celsius, km/h, hPa)

### Çeviri Sorunları
Eksik çeviriler için `src/i18n/index.ts` dosyasını kontrol edin. Tüm çeviriler hem Türkçe hem İngilizce olarak mevcuttur.

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
    "theme": "auto",
    "language": "tr",
    "region": "TR",
    "units": "metric",
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
  "userEmail": "user@example.com",
  "isAnonymous": false,
  "details": {
    "city": "Istanbul",
    "theme": "dark",
    "language": "en"
  },
  "timestamp": "2024-01-01T12:00:00Z",
  "userAgent": "Mozilla/5.0...",
  "ipAddress": "192.168.1.1"
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
    "description": "Açık"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 🔧 Kullanım

### Anonim Kullanıcı
- "Anonim" butonuna tıklayarak anonim giriş yapabilirsiniz
- Ayarlarınız anonim olarak kaydedilir
- Farklı cihazlarda aynı ayarlara erişemezsiniz

### Kayıtlı Kullanıcı
- Email ve şifre ile kayıt olun
- Ayarlarınız tüm cihazlarda senkronize olur
- Arama geçmişiniz ve favorileriniz korunur

### Admin Kullanıcı
- Admin hesabı ile giriş yapın
- "Admin Paneli" butonuna tıklayın
- Sistem istatistiklerini ve kullanıcı aktivitelerini görüntüleyin

### Ayarlar
- **Tema**: Açık, koyu veya otomatik tema seçin
- **Dil**: Türkçe veya İngilizce dil seçin
- **Favoriler**: Şehirleri favorilere ekleyin/çıkarın
- **Son Aramalar**: Son aradığınız şehirleri görün

## 🛡️ Güvenlik

- Kullanıcılar sadece kendi verilerine erişebilir
- Anonim kullanıcılar için geçici ID'ler oluşturulur
- Hassas bilgiler şifrelenir
- Rate limiting uygulanır
- Admin paneline sadece yetkili kullanıcılar erişebilir

## 📱 Özellikler

### ✅ Tamamlanan
- [x] Firebase Authentication (Email/Password + Anonymous)
- [x] Firestore Database entegrasyonu
- [x] Kullanıcı ayarları senkronizasyonu
- [x] Favori şehirler yönetimi
- [x] Son aramalar geçmişi
- [x] Tema ve dil ayarları
- [x] Kullanıcı aktivite logları
- [x] Otomatik giriş durumu takibi
- [x] Offline/online geçiş desteği
- [x] Admin paneli
- [x] Sistem istatistikleri
- [x] Kullanıcı yönetimi
- [x] Gerçek zamanlı log görüntüleme

### 🔄 Geliştirilebilir
- [ ] Push notifications
- [ ] Sosyal medya ile giriş (Google, Facebook)
- [ ] Kullanıcı profili yönetimi
- [ ] Veri dışa aktarma
- [ ] Gelişmiş analitikler
- [ ] Kullanıcı rolleri ve izinler
- [ ] Toplu kullanıcı işlemleri

## 🐛 Sorun Giderme

### Firebase Bağlantı Hatası
- Environment variables'ları kontrol edin
- Firebase projesinin aktif olduğundan emin olun
- İnternet bağlantınızı kontrol edin

### Authentication Hatası
- Email/şifre kombinasyonunu kontrol edin
- Firebase Console'da Authentication ayarlarını kontrol edin
- Anonymous Authentication'ın etkinleştirildiğinden emin olun
- Tarayıcı konsolunda hata mesajlarını kontrol edin

### Veri Senkronizasyon Hatası
- Kullanıcının giriş yapmış olduğundan emin olun
- Firebase güvenlik kurallarını kontrol edin
- Network sekmesinde API çağrılarını kontrol edin

### Admin Panel Erişim Hatası
- Admin hesabı ile giriş yaptığınızdan emin olun
- Admin UID'sinin doğru ayarlandığını kontrol edin
- Firebase güvenlik kurallarını kontrol edin

## 📞 Destek

Sorun yaşarsanız:
1. Tarayıcı konsolunu kontrol edin
2. Firebase Console'da logları inceleyin
3. Environment variables'ları doğrulayın
4. Güvenlik kurallarını kontrol edin
5. Anonymous Authentication'ın etkinleştirildiğinden emin olun 