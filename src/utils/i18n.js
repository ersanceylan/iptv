import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export const translations = {
  tr: {
    // Brand & General
    appName: 'IPTV Player',
    appTagline: 'Ücretsiz, No-Cloud & Çoklu Ekran IPTV Oynatıcı',
    metaDescription: 'IPTV Player - Tamamen ücretsiz, no-cloud (%100 yerel ve gizli) ve çoklu ekran destekli modern IPTV oynatıcısı.',
    
    // Categories
    categories: 'Kategoriler',
    liveTv: 'Canlı Yayın',
    liveTvDesc: 'Ulusal, spor, haber ve tüm canlı kanallar',
    movies: 'Film',
    moviesDesc: 'Sinema, vizyon ve klasik filmler arşivi',
    series: 'Dizi',
    seriesDesc: 'Tüm sezon ve bölümleriyle dizi arşivi',
    favorites: 'Favoriler',
    history: 'Son İzlenenler',
    
    // Multi-View Player
    screen1: '1. Ekran',
    screen2: '2. Ekran',
    activeAudio: 'Aktif Ses',
    muted: 'Sessiz',
    selected: 'Seçili',
    addSecondPlayer: 'İkinci Oynatıcıyı Ekle (Çift Ekran / Multi-View)',
    closePlayer: 'Oynatıcıyı Kapat',
    adjustSize: '16:9 Boyut Ayarla',
    resetSize: 'Varsayılan 16:9 Oranına Sıfırla',
    
    // Player Controls & Overlays
    play: 'Oynat',
    pause: 'Durdur',
    unmute: 'Sesi Aç',
    mute: 'Sesi Kapat',
    fullscreen: 'Tam Ekran',
    exitFullscreen: 'Tam Ekrandan Çık',
    refreshStream: 'Yayını Yenile / Donmayı Çöz',
    streamSettings: 'Yayın Kalitesi & Donma Önleme Ayarları',
    castToTv: 'Chromecast / TV Yayını',
    stopCast: 'Cast Yayını Durdur',
    buffering: 'Tamponlanıyor • Tıkla ve Senkronize Et',
    streamFailed: 'Yayın Yüklenemedi',
    retry: 'Tekrar Dene',
    smoothMode: '🛡️ Akıcı Mod',
    lowLatencyMode: '⚡ Düşük Gecikme',
    generalBroadcast: 'Genel Yayın',
    
    // Settings & Quality Menu
    antiFreezeEngine: 'Donma Önleme (Tampon Modu)',
    smoothBufferTitle: 'Pürüzsüz / Akıcı Mod',
    smoothBufferDesc: 'Büyük tampon • İnternet dalgalanmasını önler (Önerilen)',
    lowLatencyTitle: 'Düşük Gecikme Modu',
    lowLatencyDesc: 'Anlık canlı yayın • Hızlı internet gerektirir',
    altQualities: 'Alternatif Yayın Kaliteleri',
    hlsResolution: 'HLS Çözünürlük Seviyesi',
    resyncStream: 'Yayını Yeniden Senkronize Et',
    autoRecommended: 'Otomatik (Önerilen)',
    autoOriginal: 'Otomatik (Orijinal)',
    
    // Search & Filters
    searchPlaceholderLive: 'Kanal adı veya canlı yayın ara...',
    searchPlaceholderMovie: 'Film adı veya sinema kategorisi ara...',
    searchPlaceholderSeries: 'Dizi adı veya yayıncı ara...',
    allTags: 'Tüm Gruplar',
    moreLabels: 'Tümünü Gör',
    contentCount: 'içerik bulundu',
    groupContentCount: 'grubunda',
    filterPromptLiveTitle: 'Kanal Listelemek İçin Etiket Seçin',
    filterPromptLiveDesc: 'Kanalları listelemek için yukarıdaki yayıncı etiketlerinden birini seçin veya arama kutusuna en az 2 harf yazın.',
    filterPromptMovieTitle: 'Film Listelemek İçin Etiket Seçin',
    filterPromptMovieDesc: 'İçerikleri listelemek için yukarıdaki etiketlerden birine tıklayın veya arama kutusuna en az 2 harf yazın.',
    filterPromptSeriesTitle: 'Dizi Listelemek İçin Etiket Seçin',
    filterPromptSeriesDesc: 'Dizileri listelemek için yukarıdaki yayıncı etiketlerinden birini seçin veya arama kutusuna en az 2 harf yazın.',
    noContentFoundTitle: 'Seçilen kritere uygun içerik bulunamadı.',
    noContentFoundDesc: 'Farklı bir etiket seçebilir veya arama teriminizi değiştirebilirsiniz.',
    
    // Series Specific
    season: 'Sezon',
    episode: 'Bölüm',
    episodes: 'Bölüm',
    allSeries: 'Tüm Dizi',
    nextEpisode: 'Sonraki Bölüm',
    playEpisode: 'Bölüm',
    watchingNow: 'Oynatılıyor',
    seeAllSeasons: 'Tüm Dizi ve Sezonları Gör',
    
    // History & Favorites Bottom Section
    historyTitleSeries: 'Kaldığınız Yerden & Favori Dizileriniz',
    historyTitleMovies: 'Son İzlenen & Favori Filmleriniz',
    historyTitleLive: 'Son İzlenen & Favori Canlı Kanallarınız',
    max12Items: 'En çok 12 içerik',
    emptyHistory: 'Henüz izleme geçmişi yok.',
    emptyFavorites: 'Henüz favori eklenmedi.',
    
    // Settings Modal
    settingsTitle: 'Ayarlar & Profil',
    playlistManagement: 'Çalma Listesi Yönetimi',
    currentPlaylist: 'Yüklü Çalma Listesi',
    channelsLoaded: 'kanal yüklü',
    updatePlaylist: 'M3U Listesini Değiştir / Güncelle',
    clearAllData: 'Tüm Verileri ve Geçmişi Temizle',
    clearDataConfirm: 'Tüm kanallar, favoriler ve izleme geçmişiniz silinecek. Emin misiniz?',
    themeSelection: 'Görünüm Teması',
    themeLight: 'Açık',
    themeDark: 'Koyu',
    themeSystem: 'Sistem',
    languageSelection: 'Dil Seçimi / Language',
    langTurkish: 'Türkçe',
    langEnglish: 'English',
    communityAndSupport: 'İletişim & Destek',
    telegramChannel: 'Geliştirici İletişim (Telegram)',
    joinTelegram: 'Görüş ve önerileriniz için doğrudan mesaj gönderin',
    telegramButtonText: 'Mesaj Gönder',
    githubContributeTitle: 'Açık Kaynak Geliştirme (GitHub)',
    githubContributeDesc: 'Projeye yıldız verin, yeni özellik önerin veya geliştirmeye destek olun',
    githubContributeButton: 'Destek Ol & Katkı Sağla',
    githubRepo: 'GitHub Kaynak Kodu',
    developer: 'Geliştirici',
    version: 'Sürüm',
    close: 'Kapat',
    
    // Onboarding Modal
    welcomeTitle: 'IPTV Player\'a Hoş Geldiniz',
    welcomeSubtitle: 'Ücretsiz, no-cloud ve çoklu ekran destekli IPTV oynatıcınız. M3U çalma listenizi ekleyerek canlı yayınları, dizi ve filmleri hemen izleyin.',
    enterM3uUrl: 'M3U / M3U8 Playlist Bağlantısı:',
    m3uUrlPlaceholder: 'https://example.com/playlist.m3u...',
    orUploadFile: 'veya M3U dosyasını yükleyin:',
    loadPlaylist: 'Listeyi Yükle ve Başla',
    parsingPlaylist: 'Çalma listesi ayrıştırılıyor...',
    loadError: 'Çalma listesi yüklenemedi. Lütfen geçerli bir bağlantı veya dosya seçin.',
    privacyNote: '🔒 %100 No-Cloud Gizlilik: Çalma listesi verileriniz hiçbir sunucuya iletilmez, tamamen tarayıcınızın yerel IndexedDB hafızasında saklanır.',
    
    // Labels Modal
    allPublisherLabels: 'Tüm Yayıncı Etiketleri',
    searchLabelPlaceholder: 'Etiket ara...',
    
    // Footer
    feedbackAndSuggestions: 'Geliştirici İletişim & Öneriler',
    rightsReserved: 'Tüm hakları saklıdır. Bu uygulama tamamen no-cloud (istemci taraflı) ve ücretsiz çalışmaktadır.',
    freeAndOpenSource: 'Ücretsiz, No-Cloud & Çoklu Ekran Web IPTV Oynatıcısı',
    
    // Error Boundary
    errorTitle: 'Bir Hata Oluştu',
    errorDesc: 'Oynatıcı veya sayfa bileşeni yüklenirken beklenmeyen bir hata meydana geldi:',
    goHome: 'Ana Sayfaya Dön',
    reloadPage: 'Yeniden Yükle'
  },
  
  en: {
    // Brand & General
    appName: 'IPTV Player',
    appTagline: 'Free, No-Cloud & Multi-View IPTV Player',
    metaDescription: 'IPTV Player - Free, 100% client-side (no-cloud), privacy-focused, and modern web IPTV player with Multi-View dual-screen support.',
    
    // Categories
    categories: 'Categories',
    liveTv: 'Live TV',
    liveTvDesc: 'National, sports, news and all live channels',
    movies: 'Movies',
    moviesDesc: 'Cinema, box office and classic movies library',
    series: 'Series',
    seriesDesc: 'Complete TV shows with all seasons and episodes',
    favorites: 'Favorites',
    history: 'Recent History',
    
    // Multi-View Player
    screen1: 'Screen 1',
    screen2: 'Screen 2',
    activeAudio: 'Active Audio',
    muted: 'Muted',
    selected: 'Selected',
    addSecondPlayer: 'Add Second Player (Dual Screen / Multi-View)',
    closePlayer: 'Close Player',
    adjustSize: '16:9 Resize',
    resetSize: 'Reset to 16:9 Ratio',
    
    // Player Controls & Overlays
    play: 'Play',
    pause: 'Pause',
    unmute: 'Unmute',
    mute: 'Mute',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit Fullscreen',
    refreshStream: 'Reload Stream / Fix Stalling',
    streamSettings: 'Stream Quality & Anti-Freeze Settings',
    castToTv: 'Chromecast / TV Cast',
    stopCast: 'Stop Cast Session',
    buffering: 'Buffering • Click to Sync',
    streamFailed: 'Stream Load Failed',
    retry: 'Try Again',
    smoothMode: '🛡️ Smooth Mode',
    lowLatencyMode: '⚡ Low Latency',
    generalBroadcast: 'General Stream',
    
    // Settings & Quality Menu
    antiFreezeEngine: 'Anti-Freeze Engine (Buffer Profile)',
    smoothBufferTitle: 'Smooth Buffer Mode',
    smoothBufferDesc: 'Large buffer • Prevents network jitter (Recommended)',
    lowLatencyTitle: 'Low Latency Mode',
    lowLatencyDesc: 'Instant live stream • Requires fast internet connection',
    altQualities: 'Alternate Channel Qualities',
    hlsResolution: 'HLS Resolution Level',
    resyncStream: 'Resync Live Stream',
    autoRecommended: 'Auto (Recommended)',
    autoOriginal: 'Auto (Original)',
    
    // Search & Filters
    searchPlaceholderLive: 'Search channel name or live stream...',
    searchPlaceholderMovie: 'Search movie title or cinema tag...',
    searchPlaceholderSeries: 'Search TV show title or publisher...',
    allTags: 'All Groups',
    moreLabels: 'View All',
    contentCount: 'items found',
    groupContentCount: 'in group',
    filterPromptLiveTitle: 'Select a Tag to List Channels',
    filterPromptLiveDesc: 'Click on one of the publisher tags above or type at least 2 characters in the search box to browse channels.',
    filterPromptMovieTitle: 'Select a Tag to List Movies',
    filterPromptMovieDesc: 'Click on one of the cinema tags above or type at least 2 characters in the search box to browse movies.',
    filterPromptSeriesTitle: 'Select a Tag to List Series',
    filterPromptSeriesDesc: 'Click on one of the TV show tags above or type at least 2 characters in the search box to browse series.',
    noContentFoundTitle: 'No items match your criteria.',
    noContentFoundDesc: 'You can choose another tag or refine your search query.',
    
    // Series Specific
    season: 'Season',
    episode: 'Episode',
    episodes: 'Episodes',
    allSeries: 'Full Series',
    nextEpisode: 'Next Episode',
    playEpisode: 'Episode',
    watchingNow: 'Playing',
    seeAllSeasons: 'View All Seasons & Episodes',
    
    // History & Favorites Bottom Section
    historyTitleSeries: 'Continue Watching & Favorite Series',
    historyTitleMovies: 'Recently Watched & Favorite Movies',
    historyTitleLive: 'Recently Watched & Favorite Channels',
    max12Items: 'Up to 12 items',
    emptyHistory: 'No watch history yet.',
    emptyFavorites: 'No favorites added yet.',
    
    // Settings Modal
    settingsTitle: 'Settings & Profile',
    playlistManagement: 'Playlist Management',
    currentPlaylist: 'Loaded Playlist',
    channelsLoaded: 'channels loaded',
    updatePlaylist: 'Change / Update M3U Playlist',
    clearAllData: 'Clear All Playlists & History',
    clearDataConfirm: 'All channels, favorites and watch history will be deleted. Are you sure?',
    themeSelection: 'Appearance Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
    languageSelection: 'Language / Dil Seçimi',
    langTurkish: 'Türkçe',
    langEnglish: 'English',
    communityAndSupport: 'Contact & Support',
    telegramChannel: 'Developer Contact (Telegram)',
    joinTelegram: 'Send direct message for feedback & suggestions',
    telegramButtonText: 'Send Message',
    githubContributeTitle: 'Open Source Contribution (GitHub)',
    githubContributeDesc: 'Star the repository, suggest features, or contribute code',
    githubContributeButton: 'Contribute & Star',
    githubRepo: 'GitHub Repository',
    developer: 'Developer',
    version: 'Version',
    close: 'Close',
    
    // Onboarding Modal
    welcomeTitle: 'Welcome to IPTV Player',
    welcomeSubtitle: 'Free, 100% no-cloud & multi-view web IPTV player. Add your M3U playlist link or file to start watching live channels, movies, and series seamlessly.',
    enterM3uUrl: 'M3U / M3U8 Playlist URL:',
    m3uUrlPlaceholder: 'https://example.com/playlist.m3u...',
    orUploadFile: 'or upload M3U file directly:',
    loadPlaylist: 'Load Playlist & Start',
    parsingPlaylist: 'Parsing playlist...',
    loadError: 'Failed to load playlist. Please provide a valid link or M3U file.',
    privacyNote: '🔒 100% No-Cloud Privacy: Your playlist and watch history are stored strictly in your browser (IndexedDB) and never sent to any server.',
    
    // Labels Modal
    allPublisherLabels: 'All Publisher Tags',
    searchLabelPlaceholder: 'Search tags...',
    
    // Footer
    feedbackAndSuggestions: 'Developer Contact & Feedback',
    rightsReserved: 'All rights reserved. This application is free and runs 100% client-side (no-cloud).',
    freeAndOpenSource: 'Free, No-Cloud & Multi-View Web IPTV Player',
    
    // Error Boundary
    errorTitle: 'Something Went Wrong',
    errorDesc: 'An unexpected error occurred while rendering the page component:',
    goHome: 'Go Home',
    reloadPage: 'Reload Page'
  }
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem('iptv_player_lang') || localStorage.getItem('streampulse_lang');
      if (saved === 'tr' || saved === 'en') return saved;
      // Auto-detect from browser locale
      const browserLang = navigator.language || navigator.userLanguage || '';
      return browserLang.toLowerCase().startsWith('tr') ? 'tr' : 'en';
    } catch {
      return 'tr';
    }
  });

  const setLanguage = useCallback((newLang) => {
    if (newLang !== 'tr' && newLang !== 'en') return;
    setLangState(newLang);
    try {
      localStorage.setItem('iptv_player_lang', newLang);
      document.documentElement.lang = newLang;
    } catch (e) {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback((key, fallback = '') => {
    const dict = translations[lang] || translations.tr;
    return dict[key] !== undefined ? dict[key] : (fallback || key);
  }, [lang]);

  return React.createElement(
    I18nContext.Provider,
    { value: { lang, setLanguage, t } },
    children
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback if rendered outside provider
    const fallbackT = (key, fallback = '') => {
      const dict = translations.tr;
      return dict[key] !== undefined ? dict[key] : (fallback || key);
    };
    return { lang: 'tr', setLanguage: () => {}, t: fallbackT };
  }
  return context;
}
