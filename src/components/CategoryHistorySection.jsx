import React, { useState, useMemo } from 'react';
import { Play, Flame, Heart, Tv, Film, Clapperboard, FastForward, Layers, ChevronRight } from 'lucide-react';
import SeriesModal from './SeriesModal';
import { useTranslation } from '../utils/i18n';
import { classifyChannel } from '../utils/m3uParser';

export default function CategoryHistorySection({
  activeCategory,
  historyItems = [],
  favoriteChannels = [],
  allChannels = [],
  activeChannel,
  onSelectChannel
}) {
  const [selectedSeriesModal, setSelectedSeriesModal] = useState(null);
  const { t, lang } = useTranslation();

  // 1. Filter history & favorites strictly for this activeCategory
  const categoryHistory = useMemo(() => {
    return (historyItems || []).filter((item) => {
      if (activeCategory === 'series') {
        return item.mainCategory === 'series' || classifyChannel(item.name, item.tag, item.url).mainCategory === 'series';
      }
      return (item.mainCategory || 'live') === activeCategory;
    });
  }, [historyItems, activeCategory]);

  const categoryFavorites = useMemo(() => {
    return (favoriteChannels || []).filter((item) => {
      if (activeCategory === 'series') {
        return item.mainCategory === 'series' || classifyChannel(item.name, item.tag, item.url).mainCategory === 'series';
      }
      return (item.mainCategory || 'live') === activeCategory;
    });
  }, [favoriteChannels, activeCategory]);

  // If no history or favorites for this category, return null
  const hasItems = categoryHistory.length > 0 || categoryFavorites.length > 0;

  // 2. Build items for Live TV & Movies (Max 12 items)
  const nonSeriesItems = useMemo(() => {
    if (activeCategory === 'series') return [];

    // Combine favorites and history, avoiding duplicates
    const map = new Map();
    // Favorites first
    categoryFavorites.forEach((item) => {
      map.set(item.id, { ...item, isFavorite: true });
    });
    // History
    categoryHistory.forEach((item) => {
      if (map.has(item.id)) {
        const existing = map.get(item.id);
        map.set(item.id, { ...existing, watchCount: item.watchCount, lastPlayed: item.lastPlayed });
      } else {
        map.set(item.id, { ...item, isHistory: true });
      }
    });

    return Array.from(map.values()).slice(0, 12);
  }, [categoryHistory, categoryFavorites, activeCategory]);

  // 3. Build items for Series: Group by series title, calculate next episode, max 12 series
  const seriesItems = useMemo(() => {
    if (activeCategory !== 'series') return [];

    // Group all series channels in DB by title
    const allSeriesMap = new Map();
    for (let i = 0; i < allChannels.length; i++) {
      const ch = allChannels[i];
      const classified = ch.seriesInfo ? ch : { ...ch, ...classifyChannel(ch.name, ch.tag, ch.url) };
      if (classified.mainCategory !== 'series') continue;

      const title = classified.seriesInfo?.seriesTitle || classified.name;
      const season = classified.seriesInfo?.season || 1;

      if (!allSeriesMap.has(title)) {
        allSeriesMap.set(title, {
          title,
          logo: classified.logo,
          tag: classified.tag,
          seasons: {},
          totalEpisodes: 0,
          totalSeasons: 0,
          allEpisodesList: []
        });
      }
      const sObj = allSeriesMap.get(title);
      if (!sObj.seasons[season]) sObj.seasons[season] = [];
      sObj.seasons[season].push(classified);
      sObj.totalEpisodes++;
      sObj.allEpisodesList.push(classified);
      if (!sObj.logo && classified.logo) sObj.logo = classified.logo;
    }

    // Sort episodes in each season
    allSeriesMap.forEach((sObj) => {
      sObj.totalSeasons = Object.keys(sObj.seasons).length;
      Object.keys(sObj.seasons).forEach((sNum) => {
        sObj.seasons[sNum].sort((a, b) => {
          const epA = a.seriesInfo?.episode || 1;
          const epB = b.seriesInfo?.episode || 1;
          return epA - epB;
        });
      });
      // Sort all episodes list
      sObj.allEpisodesList.sort((a, b) => {
        const sA = a.seriesInfo?.season || 1;
        const sB = b.seriesInfo?.season || 1;
        if (sA !== sB) return sA - sB;
        const eA = a.seriesInfo?.episode || 1;
        const eB = b.seriesInfo?.episode || 1;
        return eA - eB;
      });
    });

    const getResolvedSeriesTitle = (item) => {
      if (item.seriesInfo?.seriesTitle) return item.seriesInfo.seriesTitle;
      const matched = allChannels.find((c) => c.id === item.id);
      if (matched?.seriesInfo?.seriesTitle) return matched.seriesInfo.seriesTitle;
      const classified = classifyChannel(item.name || '', item.tag || '', item.url || '');
      return classified?.seriesInfo?.seriesTitle || item.name;
    };

    const getFullEpisodeObject = (item) => {
      if (item.seriesInfo?.season && item.seriesInfo?.episode) return item;
      const matched = allChannels.find((c) => c.id === item.id);
      if (matched && matched.seriesInfo) return matched;
      const classified = classifyChannel(item.name || '', item.tag || '', item.url || '');
      return {
        ...item,
        seriesInfo: classified?.seriesInfo || { seriesTitle: item.name, season: 1, episode: 1 }
      };
    };

    // Find interacted series (from categoryHistory and categoryFavorites)
    const interactedTitles = new Set();
    const historyMapByTitle = new Map();

    // Map history to find last watched episode for each series
    categoryHistory.forEach((item) => {
      const title = getResolvedSeriesTitle(item);
      interactedTitles.add(title);
      if (!historyMapByTitle.has(title)) {
        historyMapByTitle.set(title, getFullEpisodeObject(item));
      }
    });

    categoryFavorites.forEach((item) => {
      const title = getResolvedSeriesTitle(item);
      interactedTitles.add(title);
    });

    const result = [];
    interactedTitles.forEach((title) => {
      const seriesData = allSeriesMap.get(title);
      if (!seriesData) return;

      const lastWatchedEpisode = historyMapByTitle.get(title) || seriesData.allEpisodesList[0];
      const isHistory = historyMapByTitle.has(title);
      const isFavorite = categoryFavorites.some(
        (f) => getResolvedSeriesTitle(f) === title
      );

      // Determine next episode:
      let nextEp = null;
      if (lastWatchedEpisode && seriesData.allEpisodesList.length > 0) {
        const curSeason = lastWatchedEpisode.seriesInfo?.season || 1;
        const curEpisode = lastWatchedEpisode.seriesInfo?.episode || 1;

        // Find currentIndex in sorted allEpisodesList
        const curIndex = seriesData.allEpisodesList.findIndex(
          (ep) =>
            (ep.seriesInfo?.season || 1) === curSeason &&
            (ep.seriesInfo?.episode || 1) === curEpisode
        );

        if (curIndex !== -1 && curIndex + 1 < seriesData.allEpisodesList.length) {
          nextEp = seriesData.allEpisodesList[curIndex + 1];
        } else if (curIndex !== -1 && curIndex === seriesData.allEpisodesList.length - 1) {
          // Last episode reached: keep current episode
          nextEp = seriesData.allEpisodesList[curIndex];
        } else {
          nextEp = seriesData.allEpisodesList[0];
        }
      } else if (seriesData.allEpisodesList.length > 0) {
        nextEp = seriesData.allEpisodesList[0];
      }

      result.push({
        seriesData,
        lastWatchedEpisode,
        nextEpisode: nextEp,
        isHistory,
        isFavorite
      });
    });

    return result.slice(0, 12);
  }, [categoryHistory, categoryFavorites, allChannels, activeCategory]);

  if (!hasItems) return null;

  return (
    <div className="pt-2 pb-2">
      <div className="p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-300/80 dark:border-neutral-800 shadow-sm backdrop-blur-sm">

        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-500">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white">
              {activeCategory === 'series'
                ? t('historyTitleSeries')
                : activeCategory === 'movie'
                  ? t('historyTitleMovies')
                  : t('historyTitleLive')}
            </h3>
          </div>
        </div>

        {/* 1. Series Cards with "Tüm Dizi" & "Sonraki Bölüm" */}
        {activeCategory === 'series' && (
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
            {seriesItems.map(({ seriesData, lastWatchedEpisode, nextEpisode, isFavorite }) => {
              const isNextPlaying = activeChannel && nextEpisode && activeChannel.id === nextEpisode.id;
              const nextSeasonNum = nextEpisode?.seriesInfo?.season || 1;
              const nextEpNum = nextEpisode?.seriesInfo?.episode || 1;

              return (
                <div
                  key={seriesData.title}
                  className="group relative flex-shrink-0 w-52 sm:w-60 p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700/60 hover:border-amber-400 dark:hover:border-amber-400 transition-all duration-200 flex flex-col justify-between"
                >
                  {/* Thumbnail / Poster */}
                  <div
                    onClick={() => setSelectedSeriesModal(seriesData)}
                    className="relative w-full aspect-video rounded-xl bg-neutral-200 dark:bg-neutral-900 flex items-center justify-center overflow-hidden mb-2.5 cursor-pointer"
                  >
                    {seriesData.logo ? (
                      <img
                        src={seriesData.logo}
                        alt={seriesData.title}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full items-center justify-center text-neutral-400 ${seriesData.logo ? 'hidden' : 'flex'
                        }`}
                    >
                      <Clapperboard className="w-8 h-8 opacity-40" />
                    </div>

                    {/* Season Badge */}
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[9px] font-bold text-amber-300 border border-amber-400/20 flex items-center gap-1">
                      <Layers className="w-2.5 h-2.5" />
                      <span>{seriesData.totalSeasons} {t('season')}</span>
                    </div>

                    {isFavorite && (
                      <div className="absolute top-2 left-2 p-1 rounded-md bg-rose-500/80 text-white">
                        <Heart className="w-3 h-3 fill-white" />
                      </div>
                    )}
                  </div>

                  {/* Title & Tag */}
                  <div className="mb-2">
                    <h4
                      onClick={() => setSelectedSeriesModal(seriesData)}
                      className="text-xs font-black text-neutral-900 dark:text-white truncate cursor-pointer hover:text-amber-500 transition-colors"
                      title={seriesData.title}
                    >
                      {seriesData.title}
                    </h4>
                    <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                      {seriesData.tag || (lang === 'tr' ? 'Genel' : 'General')} • {seriesData.totalEpisodes} {t('episodes')}
                    </p>
                  </div>

                  {/* Next Episode Action Card / Button */}
                  {nextEpisode && (
                    <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700/60 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-neutral-500">
                        <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <FastForward className="w-3 h-3" /> {t('nextEpisode')}
                        </span>
                        <span>S{nextSeasonNum} E{nextEpNum}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Play Next Episode Button */}
                        <button
                          type="button"
                          onClick={() => onSelectChannel(nextEpisode)}
                          className={`flex-1 py-1.5 px-2.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer ${isNextPlaying
                              ? 'bg-emerald-500 text-white'
                              : 'bg-amber-400 hover:bg-amber-300 text-neutral-950'
                            }`}
                          title={`${nextSeasonNum}. ${t('season')} ${nextEpNum}. ${t('episode')}`}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>{isNextPlaying ? t('watchingNow') : `${t('playEpisode')} ${nextEpNum}`}</span>
                        </button>

                        {/* Open Full Series Modal Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedSeriesModal(seriesData)}
                          className="p-1.5 rounded-xl bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                          title={t('seeAllSeasons')}
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 2. Non-Series Cards (Live TV & Movies) */}
        {activeCategory !== 'series' && (
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
            {nonSeriesItems.map((item) => {
              const isCurrentPlaying = activeChannel && activeChannel.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectChannel(item)}
                  className={`group relative flex-shrink-0 w-36 sm:w-44 p-2.5 rounded-2xl cursor-pointer bg-neutral-100 dark:bg-neutral-800/80 hover:bg-white dark:hover:bg-neutral-800 border transition-all duration-200 ${isCurrentPlaying
                      ? 'border-amber-400 bg-amber-400/10 shadow-md'
                      : 'border-neutral-200 dark:border-neutral-700/60 hover:border-amber-400'
                    }`}
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
                      className={`w-full h-full items-center justify-center text-neutral-400 ${item.logo ? 'hidden' : 'flex'
                        }`}
                    >
                      {activeCategory === 'movie' ? (
                        <Film className="w-6 h-6 opacity-40" />
                      ) : (
                        <Tv className="w-6 h-6 opacity-40" />
                      )}
                    </div>

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="w-7 h-7 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center shadow-md">
                        <Play className="w-3.5 h-3.5 fill-neutral-950 ml-0.5" />
                      </div>
                    </div>

                    {item.isFavorite && (
                      <div className="absolute top-1.5 left-1.5 p-1 rounded-md bg-rose-500 text-white">
                        <Heart className="w-2.5 h-2.5 fill-white" />
                      </div>
                    )}

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
              );
            })}
          </div>
        )}

      </div>

      {/* Series Full Modal Trigger if opened from history */}
      {selectedSeriesModal && (
        <SeriesModal
          isOpen={Boolean(selectedSeriesModal)}
          onClose={() => setSelectedSeriesModal(null)}
          series={selectedSeriesModal}
          activeChannel={activeChannel}
          onSelectEpisode={(ep) => {
            onSelectChannel(ep);
          }}
        />
      )}
    </div>
  );
}
