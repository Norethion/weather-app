# 🌤️ Weather App - Modern Hava Durumu Uygulaması

> **AI-Powered Development**: Bu proje tamamen **no-code prensibi** ile AI araçları kullanılarak geliştirilmiştir. Tüm kod, tasarım ve optimizasyonlar AI asistanları tarafından oluşturulmuştur.

## 📋 Proje Tanıtımı

Modern ve kullanıcı dostu bir hava durumu uygulaması. OpenWeather API kullanarak gerçek zamanlı hava durumu verilerini gösterir. Kullanıcılar şehir ismine göre arama yapabilir veya konumlarını kullanarak anlık hava durumu bilgilerini alabilir.

## 🚀 Özellikler

### 🌍 **Temel Özellikler**
- **Gerçek zamanlı hava durumu** - Anlık sıcaklık, nem, rüzgar hızı
- **5 günlük tahmin** - Detaylı hava durumu tahmini
- **Hava kalitesi indeksi** - AQI bilgileri
- **Konum tabanlı arama** - GPS ile otomatik konum tespiti
- **Şehir arama** - Nominatim API ile gelişmiş şehir arama
- **Favoriler sistemi** - Sık kullanılan şehirleri kaydetme

### 🎨 **Kullanıcı Deneyimi**
- **Responsive tasarım** - Mobil ve masaüstü uyumlu
- **Dark/Light tema** - Otomatik tema değişimi
- **Çoklu dil desteği** - Türkçe ve İngilizce
- **Animasyonlar** - Framer Motion ile akıcı geçişler
- **Toast bildirimleri** - Kullanıcı geri bildirimleri
- **Loading durumları** - Kullanıcı dostu yükleme ekranları

### 🔧 **Teknik Özellikler**
- **PWA desteği** - Progressive Web App
- **Offline çalışma** - Service Worker ile
- **Performance optimizasyonu** - Lazy loading ve code splitting
- **Error handling** - Kapsamlı hata yönetimi
- **TypeScript** - Tip güvenliği
- **ESLint** - Kod kalitesi

## 🛠️ Kullanılan Teknolojiler

### **Frontend Framework**
- **React 18** - Modern UI framework
- **TypeScript** - Tip güvenliği
- **TailwindCSS** - Utility-first CSS framework

### **State Management & Hooks**
- **React Hooks** - useState, useEffect, useCallback
- **Custom Hooks** - useGeolocation, useToast, useLocalStorage

### **UI/UX Libraries**
- **Framer Motion** - Animasyonlar
- **Lottie** - Lottie animasyonları
- **Recharts** - Veri görselleştirme

### **Internationalization**
- **i18next** - Çoklu dil desteği
- **react-i18next** - React entegrasyonu

### **APIs & Services**
- **OpenWeather API** - Hava durumu verileri
- **Nominatim API** - Şehir arama ve geocoding
- **Firebase Authentication** - Kullanıcı kimlik doğrulama

### **Development Tools**
- **Create React App** - Proje scaffold
- **ESLint** - Kod linting
- **PostCSS** - CSS processing

## 📦 Kurulum

### **Gereksinimler**
- Node.js (v16 veya üzeri)
- npm veya yarn

### **1. Projeyi Klonlayın**
```bash
git clone https://github.com/Norethion/weather-app.git
cd weather-app
```

### **2. Bağımlılıkları Yükleyin**
```bash
npm install --legacy-peer-deps
```

### **3. Environment Variables**
`.env` dosyası oluşturun:
```env
REACT_APP_OPENWEATHER_API_KEY=your_openweather_api_key_here
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
```

### **4. API Key'leri Alın**

#### **OpenWeather API**
1. [OpenWeather](https://openweathermap.org/api) sitesine gidin
2. Ücretsiz hesap oluşturun
3. API key'inizi alın
4. `.env` dosyasına ekleyin

#### **Firebase (Opsiyonel)**
1. [Firebase Console](https://console.firebase.google.com/) gidin
2. Yeni proje oluşturun
3. Authentication'ı etkinleştirin
4. Web app ekleyin ve config bilgilerini alın

### **5. Uygulamayı Başlatın**
```bash
npm start
```

Uygulama `http://localhost:3000` adresinde açılacaktır.

## 🚀 Deployment

### **Vercel (Önerilen) 🚀**

#### **1. Vercel Hesabı Oluşturun**
- [vercel.com](https://vercel.com) adresine gidin
- GitHub hesabınızla giriş yapın

#### **2. Projeyi Vercel'e Bağlayın**
- Vercel Dashboard'da "New Project" tıklayın
- GitHub repository'nizi seçin
- Framework Preset: **Create React App** seçin

#### **3. Build Ayarları**
```
Framework Preset: Create React App
Build Command: npm run build:vercel
Output Directory: build
Install Command: npm install
```

#### **4. Environment Variables Ekleme**
Vercel Dashboard > Settings > Environment Variables:
```
REACT_APP_OPENWEATHER_API_KEY=your_openweather_api_key
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your_app_id
VISUAL_CROSSING_API_KEY=your_visual_crossing_api_key
```

#### **5. Deploy**
- "Deploy" butonuna tıklayın
- Vercel otomatik olarak build edip yayınlayacak

#### **Vercel Avantajları:**
✅ Otomatik HTTPS  
✅ Global CDN  
✅ Otomatik Deploy (GitHub'a push ettiğinizde)  
✅ Preview Deployments  
✅ Environment Variables güvenli yönetimi  

---

### **GitHub Pages 🌐**

#### **1. Repository Ayarları**
- GitHub repository'nizde **Settings** > **Pages**
- Source: **Deploy from a branch** seçin
- Branch: **gh-pages** seçin
- **Save** tıklayın

#### **2. Environment Variables**
GitHub Pages'te environment variables kullanılamaz. Bunun yerine:
- API key'lerinizi güvenli bir şekilde yönetin
- Production'da API key'lerinizi kısıtlayın

#### **3. Deploy**
```bash
npm run deploy
```

#### **4. Site URL'i**
Site `https://yourusername.github.io/weather-app` adresinde yayınlanacak



## 🎯 Kullanım

### **Şehir Arama**
1. Arama kutusuna şehir adını yazın
2. Dropdown'dan istediğiniz şehri seçin
3. Hava durumu bilgileri otomatik yüklenecek

### **Konum Kullanma**
1. 📍 butonuna tıklayın
2. Konum izni verin
3. Bulunduğunuz yerin hava durumu yüklenecek

### **Favoriler**
1. Hava durumu kartında ⭐ butonuna tıklayın
2. Şehir favorilere eklenecek
3. Sidebar'dan favorilerinizi yönetin

### **Tema Değiştirme**
1. Tema seçici butonuna tıklayın
2. Açık/Koyu/Otomatik seçin

## 🔧 Geliştirici Notları

### **Proje Yapısı**
```
src/
├── components/          # React bileşenleri
├── hooks/              # Custom React hooks
├── services/           # API servisleri
├── utils/              # Yardımcı fonksiyonlar
├── i18n/               # Dil dosyaları
└── lottie/             # Animasyon dosyaları
```

### **API Entegrasyonu**
- **OpenWeather API**: Hava durumu verileri
- **Nominatim API**: Şehir arama ve geocoding
- **Firebase**: Kullanıcı kimlik doğrulama

### **Performance Optimizasyonları**
- **Lazy loading**: Bileşenler ihtiyaç duyulduğunda yüklenir
- **Debouncing**: API çağrıları optimize edilmiştir
- **Memoization**: Gereksiz re-render'lar önlenir
- **Code splitting**: Bundle boyutu optimize edilmiştir

### **Error Handling**
- **Error Boundary**: Uygulama çökmesini önler
- **Toast notifications**: Kullanıcı geri bildirimleri
- **Fallback systems**: API hatalarında alternatif çözümler

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🙏 Teşekkürler

- **OpenWeather** - Hava durumu API'si
- **Nominatim** - Geocoding servisi
- **Firebase** - Authentication servisi
- **AI Tools** - Proje geliştirme sürecinde kullanılan AI asistanları

---

**⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!** 