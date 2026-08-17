import React from 'react';
import { Play, Flame, Heart, Tv, Film, Clapperboard } from 'lucide-react';
import { useTranslation } from '../utils/i18n';

export default function HistorySection({
  historyItems = [],
  favoriteChannels = [],
  onSelectChannel
}) {
  const { t, lang } = useTranslation();
  const hasHistory = historyItems && historyItems.length > 0;
  const hasFavorites = favoriteChannels && favoriteChannels.length > 0;

  if (!hasHistory && !hasFavorites) return null;

  return (
    <div className="space-y-6 pt-4">
      {/* 1. Favorilerim Section */}
      {hasFavorites && (
        <section className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-neutral-900/80 border border-neutral-300/80 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                <Heart className="w-4 h-4 fill-rose-500" />
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white">
                {t('favorites')}
              </h3>
            </div>
            <span className="text-[11px] text-neutral-500 font-medium">
              {favoriteChannels.length} {t('contentCount')}
            </span>
          </div>

          {/* Horizontal list of favorites */}
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {favoriteChannels.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectChannel(item)}
                className="group relative flex-shrink-0 w-36 sm:w-44 p-2.5 rounded-2xl cursor-pointer bg-neutral-100 dark:bg-neutral-800/80 hover:bg-white dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/60 hover:border-amber-400 dark:hover:border-amber-400 transition-all duration-200"
              >
                <div className="relative w-full aspect-video rounded-xl bg-neutral-200 dark:bg-neutral-900 flex items-center justify-center overflow-hidden mb-2">
                  {item.logo ? (
                    <img
                      src={item.logo}
                      alt={item.name}
                      className="w-full h-full object-contain p-1.5 group-hover:scale-105 transition-transform"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-full h-full items-center justify-center text-neutral-400 ${
                      item.logo ? 'hidden' : 'flex'
                    }`}
                  >
                    {item.mainCategory === 'movie' ? (
                      <Film className="w-6 h-6 opacity-40" />
                    ) : item.mainCategory === 'series' ? (
                      <Clapperboard className="w-6 h-6 opacity-40" />
                    ) : (
                      <Tv className="w-6 h-6 opacity-40" />
                    )}
                  </div>

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="w-7 h-7 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center shadow-md">
                      <Play className="w-3.5 h-3.5 fill-neutral-950 ml-0.5" />
                    </div>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate" title={item.name}>
                  {item.name}
                </h4>
                <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                  {item.tag || (lang === 'tr' ? 'Genel' : 'General')}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. En Çok / Son İzlenenler Section */}
      {hasHistory && (
        <section className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-neutral-900/80 border border-neutral-300/80 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white">
                {t('history')}
              </h3>
            </div>
            <span className="text-[11px] text-neutral-500 font-medium">
              {lang === 'tr' ? 'Son aktiviteleriniz' : 'Recent activities'}
            </span>
          </div>

          {/* Horizontal list of history */}
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {historyItems.slice(0, 10).map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectChannel(item)}
                className="group relative flex-shrink-0 w-36 sm:w-44 p-2.5 rounded-2xl cursor-pointer bg-neutral-100 dark:bg-neutral-800/80 hover:bg-white dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/60 hover:border-amber-400 dark:hover:border-amber-400 transition-all duration-200"
              >
                <div className="relative w-full aspect-video rounded-xl bg-neutral-200 dark:bg-neutral-900 flex items-center justify-center overflow-hidden mb-2">
                  {item.logo ? (
                    <img
                      src={item.logo}
                      alt={item.name}
                      className="w-full h-full object-contain p-1.5 group-hover:scale-105 transition-transform"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-full h-full items-center justify-center text-neutral-400 ${
                      item.logo ? 'hidden' : 'flex'
                    }`}
                  >
                    {item.mainCategory === 'movie' ? (
                      <Film className="w-6 h-6 opacity-40" />
                    ) : item.mainCategory === 'series' ? (
                      <Clapperboard className="w-6 h-6 opacity-40" />
                    ) : (
                      <Tv className="w-6 h-6 opacity-40" />
                    )}
                  </div>

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="w-7 h-7 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center shadow-md">
                      <Play className="w-3.5 h-3.5 fill-neutral-950 ml-0.5" />
                    </div>
                  </div>

                  {item.watchCount > 1 && (
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/70 text-[9px] font-bold text-amber-300 flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5" />
                      <span>{item.watchCount}</span>
                    </div>
                  )}
                </div>

                <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate" title={item.name}>
                  {item.name}
                </h4>
                <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                  {item.tag || (lang === 'tr' ? 'Genel' : 'General')}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
