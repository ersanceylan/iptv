# IPTV Player 📺✨

IPTV Player is a lightweight, modern, client-side, privacy-focused Web IPTV application built with **React**, **Vite**, and **Tailwind CSS**.

🔗 **Live Demo:** [iptv.ersanceylan.com](https://iptv.ersanceylan.com) | [streampulse-iptv-app.web.app](https://streampulse-iptv-app.web.app)

---

## 🔒 Gizlilik & Güvenlik (Privacy First)

- **Sıfır Sunucu Kaydı:** Eklediğiniz M3U çalma listeleri, izleme geçmişi ve favorileriniz **hiçbir harici sunucuya iletilmez**.
- **İstemci Taraflı Depolama (IndexedDB):** Tüm verileriniz yalnızca tarayıcınızın yerel IndexedDB veritabanında güvenle saklanır.
- **Güvenli Oynatma:** HLS (.m3u8) akışları doğrudan tarayıcı üzerinden Hls.js ile işlenir.

---

## ✨ Özellikler (Features)

- ⚡ **Hızlı ve Akıcı:** Vite & React altyapısıyla anında yüklenen, pürüzsüz arayüz.
- 🎨 **Modern Tasarım & Dark/Light Mode:** Noto Sans tipografisi, şık koyu/açık tema desteği.
- 📺 **Gelişmiş Video Oynatıcı:**
  - Kalite & Ses seçimi
  - Resim içinde Resim (PiP)
  - Otomatik gizlenen kontroller ve imleç
  - Ekranı kapla ve tam ekran modu
  - Klavye kısayolları (Boşluk: Duraklat, F: Tam Ekran, M: Sessiz, Ok Tuşları: İleri/Geri & Ses)
- 🎛️ **Çoklu Ekran (Multi-View):** İki yayını aynı anda yan yana izleme imkanı.
- 🎬 **Akıllı Sınıflandırma:**
  - Canlı TV, Dizi ve Film otomatik ayrımı
  - Diziler için özel Sezon / Bölüm modal görünümü
  - Yayıncı etiketleri (Tags/Chips) ile filtreleme
- 🌍 **Çoklu Dil Desteği:** Türkçe & İngilizce (otomatik tarayıcı dili algılama).
- 📱 **Tam Responsive & PWA Uyumlu:** Masaüstü, tablet ve mobil cihazlar için optimize edilmiş düzen.

---

## 🚀 Başlangıç (Getting Started)

### Gereksinimler
- Node.js (v18+)
- npm veya pnpm / yarn

### Kurulum

```bash
# Projeyi klonlayın
git clone https://github.com/ersanceylan/iptv.git
cd iptv

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

### Üretim Derlemesi (Build)

```bash
npm run build
```

---

## 🛠️ Teknolojiler (Tech Stack)

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS, PostCSS
- **Video Engine:** Hls.js, Lucide Icons
- **Database:** Browser IndexedDB (idb)
- **Deployment:** Firebase Hosting

---

## 📄 Lisans (License)

Bu proje [MIT](LICENSE) lisansı ile lisanslanmıştır.
