import React, { useState } from 'react';
import { X, Tv, Sun, Moon, Monitor, Trash2, PlusCircle, ExternalLink, Heart, HardDrive, Globe, MessageCircle } from 'lucide-react';
import { getStoredTheme, setThemePreference } from '../utils/theme';
import { useTranslation } from '../utils/i18n';

export default function SettingsModal({
  isOpen,
  onClose,
  totalChannels,
  liveCount,
  moviesCount,
  seriesCount,
  onOpenM3uModal,
  onClearPlaylist
}) {
  const [theme, setTheme] = useState(getStoredTheme());
  const { t, lang, setLanguage } = useTranslation();

  if (!isOpen) return null;

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setThemePreference(newTheme);
  };

  const handleClear = () => {
    if (window.confirm(t('clearDataConfirm'))) {
      onClearPlaylist();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#f5f5f5] dark:bg-[#121212] rounded-3xl border border-neutral-300 dark:border-neutral-800 shadow-2xl overflow-hidden text-neutral-900 dark:text-neutral-100 transition-colors max-h-[90vh] overflow-y-auto">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center transition-colors z-10"
          title={t('close')}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-7 space-y-5">

          {/* Header with Logo and Domain */}
          <div className="text-center pt-2">
            <div className="w-12 h-12 mx-auto mb-2.5 rounded-2xl bg-amber-400/20 text-amber-500 border border-amber-400/40 flex items-center justify-center shadow-glow">
              <Tv className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
              IPTV Player
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {t('appTagline')}
            </p>
          </div>

          {/* IPTV Info and Manage Section */}
          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900/80 border border-neutral-300/80 dark:border-neutral-800 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5" /> {t('playlistManagement')}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                IndexedDB
              </span>
            </div>

            {/* Counts Grid */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                <span className="block text-[10px] text-neutral-500">{t('liveTv')}</span>
                <span className="font-extrabold text-sm text-neutral-900 dark:text-white">{liveCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                <span className="block text-[10px] text-neutral-500">{t('movies')}</span>
                <span className="font-extrabold text-sm text-neutral-900 dark:text-white">{moviesCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                <span className="block text-[10px] text-neutral-500">{t('series')}</span>
                <span className="font-extrabold text-sm text-neutral-900 dark:text-white">{seriesCount}</span>
              </div>
            </div>

            {/* Actions: Add / Clear */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenM3uModal();
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{totalChannels > 0 ? t('updatePlaylist') : t('enterM3uUrl')}</span>
              </button>

              {totalChannels > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-500/20 transition-colors"
                  title={t('clearAllData')}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t('clearAllData')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Language Selection (TR / EN) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900/80 border border-neutral-300/80 dark:border-neutral-800 space-y-2.5 shadow-xs">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> {t('languageSelection')}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLanguage('tr')}
                className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  lang === 'tr'
                    ? 'bg-amber-400 text-neutral-950 shadow-sm ring-1 ring-amber-400'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                }`}
              >
                <span>🇹🇷 Türkçe</span>
              </button>

              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  lang === 'en'
                    ? 'bg-amber-400 text-neutral-950 shadow-sm ring-1 ring-amber-400'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                }`}
              >
                <span>🇬🇧 English</span>
              </button>
            </div>
          </div>

          {/* Theme Preference */}
          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900/80 border border-neutral-300/80 dark:border-neutral-800 space-y-2.5 shadow-xs">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
              {t('themeSelection')}
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  theme === 'light'
                    ? 'bg-amber-400 text-neutral-950 shadow-sm ring-1 ring-amber-400'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>{t('themeLight')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  theme === 'dark'
                    ? 'bg-amber-400 text-neutral-950 shadow-sm ring-1 ring-amber-400'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>{t('themeDark')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange('system')}
                className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  theme === 'system'
                    ? 'bg-amber-400 text-neutral-950 shadow-sm ring-1 ring-amber-400'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>{t('themeSystem')}</span>
              </button>
            </div>
          </div>

          {/* Telegram Personal Contact Box */}
          <div className="p-4 rounded-2xl bg-sky-500/10 dark:bg-sky-950/30 border border-sky-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md shrink-0">
                <MessageCircle className="w-5 h-5 fill-current" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-sky-900 dark:text-sky-300">
                  {t('telegramChannel')}
                </h4>
                <p className="text-[11px] text-sky-700/80 dark:text-sky-400/80">
                  {t('joinTelegram')}
                </p>
              </div>
            </div>
            <a
              href="https://t.me/ersanceylann"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-sm transition-all hover:scale-105 shrink-0"
            >
              {t('telegramButtonText')}
            </a>
          </div>

          {/* Developer Footer Links */}
          <div className="pt-2 border-t border-neutral-300/80 dark:border-neutral-800 text-center space-y-2">
            <div className="flex items-center justify-center gap-3 text-xs">
              <a
                href="https://github.com/ersanceylan"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <span className="text-neutral-400 dark:text-neutral-600">•</span>

              <a
                href="https://x.com/ersanceylann"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>X (Twitter)</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <span className="text-neutral-400 dark:text-neutral-600">•</span>

              <a
                href="https://www.patreon.com/cw/ErsanCeylan"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 transition-colors"
              >
                <Heart className="w-3.5 h-3.5 fill-amber-500" />
                <span>Patreon</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
