import React, { useState, useMemo, useEffect } from 'react';
import { Clapperboard, Layers, Play, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import SeriesModal from './SeriesModal';
import { useTranslation } from '../utils/i18n';

const ITEMS_PER_PAGE = 24;

export default function SeriesGrid({
  seriesChannels = [],
  activeChannel,
  onSelectEpisode,
  searchQuery = '',
  selectedTag = null
}) {
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { t, lang } = useTranslation();

  const cleanQuery = searchQuery.trim();
  const hasFilter = Boolean(selectedTag) || cleanQuery.length >= 2;

  // Reset pagination when search query, selected tag or channels change
  useEffect(() => {
    setCurrentPage(1);
  }, [cleanQuery, selectedTag, seriesChannels]);

  // Group individual series episode items by series title and count seasons
  const groupedSeries = useMemo(() => {
    if (!hasFilter) return [];

    const map = new Map();

    for (let i = 0; i < seriesChannels.length; i++) {
      const ch = seriesChannels[i];
      const title = ch.seriesInfo?.seriesTitle || ch.name;
      const season = ch.seriesInfo?.season || 1;

      if (!map.has(title)) {
        map.set(title, {
          id: `series-${i}-${title}`,
          title,
          logo: ch.logo,
          tag: ch.tag,
          seasons: {},
          totalEpisodes: 0,
          totalSeasons: 0
        });
      }

      const item = map.get(title);
      if (!item.seasons[season]) {
        item.seasons[season] = [];
      }
      item.seasons[season].push(ch);
      item.totalEpisodes++;

      if (!item.logo && ch.logo) {
        item.logo = ch.logo;
      }
    }

    // Sort episodes in each season
    map.forEach((item) => {
      item.totalSeasons = Object.keys(item.seasons).length;
      Object.keys(item.seasons).forEach((sNum) => {
        item.seasons[sNum].sort((a, b) => {
          const epA = a.seriesInfo?.episode || 1;
          const epB = b.seriesInfo?.episode || 1;
          return epA - epB;
        });
      });
    });

    return Array.from(map.values());
  }, [seriesChannels, hasFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(groupedSeries.length / ITEMS_PER_PAGE);
  const paginatedSeries = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return groupedSeries.slice(start, start + ITEMS_PER_PAGE);
  }, [groupedSeries, currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  // Generate pagination page items with smart ellipsis
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }, [currentPage, totalPages]);

  // 1. If NO label is selected and search is less than 2 characters
  if (!hasFilter) {
    return (
      <div className="py-20 text-center max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-500 shadow-sm">
          <Tag className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-neutral-900 dark:text-white">
          {t('filterPromptSeriesTitle')}
        </h3>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
          {t('filterPromptSeriesDesc')}
        </p>
      </div>
    );
  }

  // 2. If no series match
  if (groupedSeries.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
          <Clapperboard className="w-7 h-7" />
        </div>
        <p className="font-bold text-sm text-neutral-700 dark:text-neutral-300">
          {t('noContentFoundTitle')}
        </p>
        <p className="text-xs text-neutral-500 mt-1">
          {t('noContentFoundDesc')}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Search / Tag Results Summary Header */}
      <div className="flex items-center justify-between pb-1 text-xs text-neutral-500 dark:text-neutral-400">
        <span>
          {selectedTag ? (
            <span><strong>{selectedTag}</strong> {t('groupContentCount')} <strong>{groupedSeries.length}</strong> {lang === 'tr' ? 'dizi' : 'series'}</span>
          ) : (
            <span><strong>{groupedSeries.length}</strong> {lang === 'tr' ? 'dizi bulundu' : 'series found'}</span>
          )}
        </span>
        {totalPages > 1 && (
          <span>
            {lang === 'tr' ? `Sayfa ${currentPage} / ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
          </span>
        )}
      </div>

      {/* Series Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 pt-2">
        {paginatedSeries.map((series) => {
          return (
            <div
              key={series.id}
              onClick={() => setSelectedSeries(series)}
              className="group relative p-3 rounded-2xl cursor-pointer bg-white dark:bg-neutral-900/90 border border-neutral-300/80 dark:border-neutral-800 hover:border-amber-400/90 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
            >
              {/* Poster / Logo */}
              <div className="relative w-full aspect-video rounded-xl bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center overflow-hidden mb-2.5">
                {series.logo ? (
                  <img
                    src={series.logo}
                    alt={series.title}
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full items-center justify-center text-neutral-400 ${
                    series.logo ? 'hidden' : 'flex'
                  }`}
                >
                  <Clapperboard className="w-8 h-8 opacity-30" />
                </div>

                {/* Play / Open Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="w-9 h-9 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-neutral-950 ml-0.5" />
                  </div>
                </div>

                {/* Minimalist Season Count Badge */}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-black/75 backdrop-blur-xs text-[10px] font-extrabold text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-amber-400" />
                  <span>{series.totalSeasons} {t('season')}</span>
                </div>
              </div>

              {/* Title & Stats */}
              <div>
                <h4
                  className="font-bold text-xs text-neutral-900 dark:text-neutral-100 line-clamp-1 group-hover:text-amber-500 transition-colors"
                  title={series.title}
                >
                  {series.title}
                </h4>
                <div className="flex items-center justify-between mt-1.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                  <span className="truncate max-w-[100px] bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded" title={series.tag}>
                    {series.tag || (lang === 'tr' ? 'Genel' : 'General')}
                  </span>
                  <span className="font-semibold text-neutral-600 dark:text-neutral-300">
                    {series.totalEpisodes} {t('episodes')}
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-8 pb-4">
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:border-amber-400 hover:text-amber-500 transition-colors shadow-sm cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{lang === 'tr' ? 'Önceki' : 'Previous'}</span>
          </button>

          <div className="flex items-center gap-1.5">
            {pageNumbers.map((num, idx) => {
              if (num === '...') {
                return (
                  <span key={`dots-${idx}`} className="px-2 text-neutral-400 text-xs font-bold">
                    ...
                  </span>
                );
              }
              const isCurrent = currentPage === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => handlePageChange(num)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-400 text-neutral-950 shadow-md ring-1 ring-amber-400'
                      : 'bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:border-neutral-400'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:border-amber-400 hover:text-amber-500 transition-colors shadow-sm cursor-pointer"
          >
            <span>{lang === 'tr' ? 'Sonraki' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Series Full-Screen Modal */}
      <SeriesModal
        isOpen={Boolean(selectedSeries)}
        onClose={() => setSelectedSeries(null)}
        series={selectedSeries}
        activeChannel={activeChannel}
        onSelectEpisode={(ep) => {
          onSelectEpisode(ep);
        }}
      />
    </>
  );
}
