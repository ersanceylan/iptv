import React from 'react';
import { Tv, Film, Clapperboard, ChevronRight } from 'lucide-react';
import { useTranslation } from '../utils/i18n';

export default function BigCategoryHero({
  onSelectCategory,
  liveCount,
  moviesCount,
  seriesCount
}) {
  const { t, lang } = useTranslation();
  const locale = lang === 'tr' ? 'tr-TR' : 'en-US';

  return (
    <div className="w-full pt-6 pb-2">
      <div className="text-center mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
          {lang === 'tr' ? 'Ne izlemek istersiniz?' : 'What would you like to watch?'}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-2">
          {lang === 'tr' ? 'İzlemeye başlamak için bir kategori seçin.' : 'Select a category to start browsing.'}
        </p>

        {/* Highlight Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            🔒 {lang === 'tr' ? '100% No-Cloud (Yerel Veri)' : '100% No-Cloud (Local)'}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-400/15 text-amber-600 dark:text-amber-400 border border-amber-400/30">
            📺 {lang === 'tr' ? 'Çoklu Ekran (Multi-View)' : 'Multi-View Dual Player'}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            ✨ {lang === 'tr' ? 'Tamamen Ücretsiz' : '100% Free'}
          </span>
        </div>
      </div>

      {/* 3 Big Category Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Canlı TV Box */}
        <div
          onClick={() => onSelectCategory('live')}
          className="group relative p-6 sm:p-8 rounded-3xl cursor-pointer bg-white dark:bg-neutral-900/90 border border-neutral-300/80 dark:border-neutral-800/90 hover:border-amber-400 dark:hover:border-amber-400 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[190px] sm:min-h-[220px]"
        >
          <div className="flex items-start justify-between">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 group-hover:bg-amber-400 group-hover:text-neutral-950 flex items-center justify-center transition-all duration-300 shadow-inner">
              <Tv className="w-7 h-7" />
            </div>
            <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 group-hover:bg-amber-400 group-hover:text-neutral-950 flex items-center justify-center text-neutral-400 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white group-hover:text-amber-500 transition-colors">
              {t('liveTv')}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-2">
              <span>{liveCount > 0 ? `${liveCount.toLocaleString(locale)} ${lang === 'tr' ? 'Kanal' : 'Channels'}` : t('liveTvDesc')}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </p>
          </div>
        </div>

        {/* Film Box */}
        <div
          onClick={() => onSelectCategory('movie')}
          className="group relative p-6 sm:p-8 rounded-3xl cursor-pointer bg-white dark:bg-neutral-900/90 border border-neutral-300/80 dark:border-neutral-800/90 hover:border-amber-400 dark:hover:border-amber-400 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[190px] sm:min-h-[220px]"
        >
          <div className="flex items-start justify-between">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 group-hover:bg-amber-400 group-hover:text-neutral-950 flex items-center justify-center transition-all duration-300 shadow-inner">
              <Film className="w-7 h-7" />
            </div>
            <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 group-hover:bg-amber-400 group-hover:text-neutral-950 flex items-center justify-center text-neutral-400 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white group-hover:text-amber-500 transition-colors">
              {t('movies')}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {moviesCount > 0 ? `${moviesCount.toLocaleString(locale)} ${lang === 'tr' ? 'Film (VOD)' : 'Movies'}` : t('moviesDesc')}
            </p>
          </div>
        </div>

        {/* Dizi Box */}
        <div
          onClick={() => onSelectCategory('series')}
          className="group relative p-6 sm:p-8 rounded-3xl cursor-pointer bg-white dark:bg-neutral-900/90 border border-neutral-300/80 dark:border-neutral-800/90 hover:border-amber-400 dark:hover:border-amber-400 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[190px] sm:min-h-[220px]"
        >
          <div className="flex items-start justify-between">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 group-hover:bg-amber-400 group-hover:text-neutral-950 flex items-center justify-center transition-all duration-300 shadow-inner">
              <Clapperboard className="w-7 h-7" />
            </div>
            <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 group-hover:bg-amber-400 group-hover:text-neutral-950 flex items-center justify-center text-neutral-400 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white group-hover:text-amber-500 transition-colors">
              {t('series')}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {seriesCount > 0 ? `${seriesCount.toLocaleString(locale)} ${lang === 'tr' ? 'Bölüm & Sezon' : 'Episodes'}` : t('seriesDesc')}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
