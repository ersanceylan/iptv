import React from 'react';
import { Tv, Film, Clapperboard, Search, X } from 'lucide-react';
import CategoryChips from './CategoryChips';
import { useTranslation } from '../utils/i18n';

export default function StickyCategoryBar({
  activeCategory,
  onSelectCategory,
  liveCount,
  moviesCount,
  seriesCount,
  searchQuery,
  onSearchChange,
  availableTags,
  tagCounts,
  selectedTag,
  onSelectTag,
  onOpenLabelsModal
}) {
  const { t } = useTranslation();

  return (
    <div className="sticky top-0 z-30 bg-[#eeeeee]/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md pt-3 pb-2 border-b border-neutral-300/80 dark:border-neutral-800/80 transition-colors">
      <div className="max-w-7xl mx-auto space-y-3">
        
        {/* Category Tabs Switcher */}
        <div className="flex items-center justify-center">
          <div className="flex items-center p-1 rounded-2xl bg-neutral-200/80 dark:bg-neutral-900/90 border border-neutral-300 dark:border-neutral-800 shadow-inner max-w-xl w-full">
            
            {/* Canlı TV */}
            <button
              type="button"
              onClick={() => onSelectCategory('live')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                activeCategory === 'live'
                  ? 'bg-amber-400 text-neutral-950 shadow-md ring-1 ring-amber-400/50'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>{t('liveTv')}</span>
              {liveCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeCategory === 'live'
                    ? 'bg-neutral-950/20 text-neutral-950'
                    : 'bg-neutral-300 dark:bg-neutral-800 text-neutral-500'
                }`}>
                  {liveCount}
                </span>
              )}
            </button>

            {/* Film */}
            <button
              type="button"
              onClick={() => onSelectCategory('movie')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                activeCategory === 'movie'
                  ? 'bg-amber-400 text-neutral-950 shadow-md ring-1 ring-amber-400/50'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>{t('movies')}</span>
              {moviesCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeCategory === 'movie'
                    ? 'bg-neutral-950/20 text-neutral-950'
                    : 'bg-neutral-300 dark:bg-neutral-800 text-neutral-500'
                }`}>
                  {moviesCount}
                </span>
              )}
            </button>

            {/* Dizi */}
            <button
              type="button"
              onClick={() => onSelectCategory('series')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                activeCategory === 'series'
                  ? 'bg-amber-400 text-neutral-950 shadow-md ring-1 ring-amber-400/50'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              <Clapperboard className="w-4 h-4" />
              <span>{t('series')}</span>
              {seriesCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeCategory === 'series'
                    ? 'bg-neutral-950/20 text-neutral-950'
                    : 'bg-neutral-300 dark:bg-neutral-800 text-neutral-500'
                }`}>
                  {seriesCount}
                </span>
              )}
            </button>

          </div>
        </div>

        {/* Massive Search Input */}
        <div className="relative max-w-3xl mx-auto">
          <Search className="w-5 h-5 sm:w-6 sm:h-6 absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              activeCategory === 'series'
                ? t('searchPlaceholderSeries')
                : activeCategory === 'movie'
                ? t('searchPlaceholderMovie')
                : t('searchPlaceholderLive')
            }
            className="w-full pl-12 sm:pl-14 pr-12 py-3 sm:py-4 text-sm sm:text-base font-medium rounded-2xl bg-white dark:bg-neutral-900/90 border border-neutral-300/80 dark:border-neutral-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25 outline-none text-neutral-900 dark:text-white placeholder-neutral-400 shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Publisher Labels / Tags Chips Bar */}
        {availableTags.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <CategoryChips
              tags={availableTags}
              tagCounts={tagCounts}
              selectedTag={selectedTag}
              onSelectTag={onSelectTag}
              onOpenLabelsModal={onOpenLabelsModal}
            />
          </div>
        )}

      </div>
    </div>
  );
}
