import React, { useState } from 'react';
import { ShieldCheck, Upload, Link, Tv, Sparkles, Lock, X } from 'lucide-react';
import { parseM3UFast } from '../utils/m3uParser';
import { useTranslation } from '../utils/i18n';

const SAMPLE_M3U_DATA = `#EXTM3U
#EXTINF:-1 tvg-logo="https://images.unsplash.com/photo-1586899028174-e7098604235b?w=200" group-title="TR | Ulusal Kanallar",TRT 1 HD
https://tv-trt1.medya.trt.com.tr/master.m3u8
#EXTINF:-1 tvg-logo="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=200" group-title="TR | Ulusal Kanallar",TRT Haber HD
https://tv-trthaber.medya.trt.com.tr/master.m3u8
#EXTINF:-1 tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=200" group-title="TR | Spor",TRT Spor HD
https://tv-trtspor1.medya.trt.com.tr/master.m3u8
#EXTINF:-1 tvg-logo="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200" group-title="TR | Belgesel",TRT Belgesel HD
https://tv-trtbelgesel.medya.trt.com.tr/master.m3u8
#EXTINF:-1 tvg-logo="https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=200" group-title="TR | Çocuk & Aile",TRT Çocuk HD
https://tv-trtcocuk.medya.trt.com.tr/master.m3u8
#EXTINF:-1 tvg-logo="https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=200" group-title="TR | Müzik",TRT Müzik HD
https://tv-trtmuzik.medya.trt.com.tr/master.m3u8
#EXTINF:-1 tvg-logo="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200" group-title="VOD | Yabancı Sinema",Big Buck Bunny (2008) 4K
https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
#EXTINF:-1 tvg-logo="https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200" group-title="VOD | Animasyon Filmleri",Sintel Movie Full HD
https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8
#EXTINF:-1 tvg-logo="https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=200" group-title="Diziler | Bilim Kurgu",Cosmos Odyssey S01 E01 - Başlangıç
https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
#EXTINF:-1 tvg-logo="https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=200" group-title="Diziler | Bilim Kurgu",Cosmos Odyssey S01 E02 - Derin Uzay
https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
#EXTINF:-1 tvg-logo="https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=200" group-title="Diziler | Bilim Kurgu",Cosmos Odyssey S02 E01 - Yeni Boyut
https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
#EXTINF:-1 tvg-logo="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200" group-title="Diziler | Doğa & Macera",Wild Planet S01 E01 - Yağmur Ormanları
https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8
#EXTINF:-1 tvg-logo="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200" group-title="Diziler | Doğa & Macera",Wild Planet S01 E02 - Okyanusların Gizemi
https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8
`;

export default function OnboardingModal({ isOpen, onClose, onAddChannels, isMandatory = false }) {
  const [tab, setTab] = useState('url');
  const [m3uUrl, setM3uUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [stats, setStats] = useState(null);
  const { t, lang } = useTranslation();

  if (!isOpen) return null;

  const handleProcessM3U = async (content) => {
    try {
      setIsLoading(true);
      setStatusMessage(lang === 'tr' ? 'Çalma listesi taranıyor ve kategorize ediliyor...' : 'Parsing and categorizing playlist...');
      setErrorMessage('');

      await new Promise((r) => setTimeout(r, 100));

      const parsedChannels = parseM3UFast(content);

      if (!parsedChannels || parsedChannels.length === 0) {
        setErrorMessage(t('loadError'));
        setIsLoading(false);
        return;
      }

      let series = 0;
      let movies = 0;
      let live = 0;
      for (const ch of parsedChannels) {
        if (ch.mainCategory === 'series') series++;
        else if (ch.mainCategory === 'movie') movies++;
        else live++;
      }

      setStats({ total: parsedChannels.length, series, movies, live });
      setStatusMessage(lang === 'tr' ? 'İçerikler IndexedDB veritabanına kaydediliyor...' : 'Saving to local IndexedDB storage...');

      await onAddChannels(parsedChannels);

      setStatusMessage(lang === 'tr' ? 'Başarıyla tamamlandı!' : 'Successfully loaded!');
      setTimeout(() => {
        setIsLoading(false);
        if (onClose) onClose();
      }, 800);
    } catch (err) {
      console.error('M3U ayrıştırma hatası:', err);
      setErrorMessage(t('loadError') + ' ' + (err.message || ''));
      setIsLoading(false);
    }
  };

  const handleFetchUrl = async (e) => {
    e.preventDefault();
    if (!m3uUrl.trim()) return;

    setIsLoading(true);
    setStatusMessage(lang === 'tr' ? 'Uzak M3U listesi indiriliyor...' : 'Downloading remote playlist...');
    setErrorMessage('');

    try {
      let response;
      try {
        response = await fetch(m3uUrl.trim());
      } catch (directErr) {
        setStatusMessage(lang === 'tr' ? 'Doğrudan erişim engeli algılandı, alternatif köprü deneniyor...' : 'CORS proxy fallback in progress...');
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(m3uUrl.trim())}`;
        response = await fetch(proxyUrl);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const content = await response.text();
      await handleProcessM3U(content);
    } catch (err) {
      console.error('URL indirme hatası:', err);
      setErrorMessage(lang === 'tr' ? 'Bağlantıdan liste indirilemedi. Lütfen adresi kontrol edin.' : 'Failed to download playlist URL. Check link or try file upload.');
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setStatusMessage(lang === 'tr' ? 'Dosya okunuyor...' : 'Reading file...');
    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        await handleProcessM3U(content);
      } else {
        setErrorMessage(t('loadError'));
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setErrorMessage(t('loadError'));
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = async () => {
    await handleProcessM3U(SAMPLE_M3U_DATA);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#f5f5f5] dark:bg-[#121212] rounded-3xl border border-neutral-300 dark:border-neutral-800 shadow-2xl p-6 sm:p-8 text-neutral-900 dark:text-neutral-100 transition-colors">
        
        {/* Close Button (if not mandatory) */}
        {!isMandatory && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title={t('close')}
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header with Icon */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-amber-500 border border-amber-400/30 flex items-center justify-center mx-auto mb-3 shadow-glow">
            <Tv className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
            {t('welcomeTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
            {t('welcomeSubtitle')}
          </p>
        </div>

        {/* Privacy Note */}
        <div className="mb-5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-emerald-700 dark:text-emerald-300 text-xs">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>
            {t('privacyNote')}
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center p-1 rounded-2xl bg-neutral-200 dark:bg-neutral-800/80 mb-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'url' ? 'bg-amber-400 text-neutral-950 shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Link className="w-4 h-4" />
            <span>M3U URL</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('file')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'file' ? 'bg-amber-400 text-neutral-950 shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{lang === 'tr' ? 'Dosya Yükle' : 'Upload File'}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('sample')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'sample' ? 'bg-amber-400 text-neutral-950 shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{lang === 'tr' ? 'Örnek Liste' : 'Demo Playlist'}</span>
          </button>
        </div>

        {/* Tab Content 1: URL */}
        {tab === 'url' && (
          <form onSubmit={handleFetchUrl} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                {t('enterM3uUrl')}
              </label>
              <input
                type="url"
                required
                value={m3uUrl}
                onChange={(e) => setM3uUrl(e.target.value)}
                placeholder="http://iptv-server.com:8080/get.php?username=...&type=m3u_plus"
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none text-sm text-neutral-900 dark:text-white placeholder-neutral-400"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !m3uUrl.trim()}
              className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-extrabold text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isLoading ? (lang === 'tr' ? 'Yükleniyor...' : 'Loading...') : t('loadPlaylist')}
            </button>
          </form>
        )}

        {/* Tab Content 2: File Upload */}
        {tab === 'file' && (
          <div className="space-y-4">
            <label className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-amber-400 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/50 dark:bg-neutral-900/50">
              <Upload className="w-10 h-10 text-neutral-400 mb-3" />
              <span className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
                {lang === 'tr' ? '.m3u veya .m3u8 dosyasını seçin veya buraya sürükleyin' : 'Select or drop .m3u / .m3u8 file'}
              </span>
              <span className="text-xs text-neutral-500 mt-1">100.000+ {t('channelsLoaded')}</span>
              <input
                type="file"
                accept=".m3u,.m3u8,.txt"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Tab Content 3: Sample / Demo */}
        {tab === 'sample' && (
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-center space-y-4">
            <div>
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-1">
                {lang === 'tr' ? 'Hazır Test & Demo Listesi' : 'Preloaded Test & Demo Playlist'}
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {lang === 'tr'
                  ? 'Yasal açık yayınlar (TRT 1, TRT Spor, TRT Belgesel, Sintel Film, Cosmos Dizi sezon ve bölümleri) ile uygulamayı hemen test edin.'
                  : 'Test the application right away with legal open public streams (TRT, Sintel 4K, Cosmos Series).'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLoadSample}
              disabled={isLoading}
              className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-extrabold text-sm shadow-md transition-all cursor-pointer"
            >
              {lang === 'tr' ? 'Demo Listesini Yükle' : 'Load Demo Playlist'}
            </button>
          </div>
        )}

        {/* Status / Loading Progress */}
        {isLoading && (
          <div className="mt-5 p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-300">{statusMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-600 dark:text-rose-400">
            <span className="text-xs sm:text-sm font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Stats Preview on Success */}
        {stats && (
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-center">
              <span className="block text-[11px] text-neutral-500">{t('liveTv')}</span>
              <span className="font-extrabold text-sm text-amber-600 dark:text-amber-400">{stats.live}</span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-center">
              <span className="block text-[11px] text-neutral-500">{t('movies')}</span>
              <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">{stats.movies}</span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-center">
              <span className="block text-[11px] text-neutral-500">{t('series')}</span>
              <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">{stats.series}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
