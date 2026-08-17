import React, { useState, useMemo, useRef } from 'react';
import { X, Play, Clapperboard, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '../utils/i18n';

export default function SeriesModal({
  isOpen,
  onClose,
  series,
  activeChannel,
  onSelectEpisode
}) {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const seasonsScrollRef = useRef(null);
  const { t, lang } = useTranslation();

  // Extract sorted season numbers
  const seasonNumbers = useMemo(() => {
    if (!series || !series.seasons) return [];
    return Object.keys(series.seasons)
      .map(Number)
      .sort((a, b) => a - b);
  }, [series]);

  // Set default selected season to first available season when series opens
  React.useEffect(() => {
    if (seasonNumbers.length > 0 && !seasonNumbers.includes(selectedSeason)) {
      setSelectedSeason(seasonNumbers[0]);
    }
  }, [seasonNumbers, selectedSeason]);

  if (!isOpen || !series) return null;

  const currentEpisodes = (series.seasons && series.seasons[selectedSeason]) || [];

  const handleScroll = (dir) => {
    if (seasonsScrollRef.current) {
      const offset = dir === 'left' ? -200 : 200;
      seasonsScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] flex flex-col bg-[#f5f5f5] dark:bg-[#111111] rounded-3xl border border-neutral-300 dark:border-neutral-800 shadow-2xl overflow-hidden text-neutral-900 dark:text-neutral-100 transition-colors">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-6 border-b border-neutral-300 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-neutral-950 flex items-center justify-center shadow-md shrink-0">
              <Clapperboard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-black tracking-tight line-clamp-1">
                  {series.title}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-400/30">
                  {t('series')}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {series.totalSeasons} {t('season')} • {series.totalEpisodes} {t('episodes')} • {series.tag || (lang === 'tr' ? 'Genel' : 'General')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-neutral-200 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
            title={t('close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Season Selector Bar (Scrollable with distinct frame and accent color) */}
        <div className="px-4 sm:px-6 py-3 border-b border-neutral-300 dark:border-neutral-800 bg-neutral-200/60 dark:bg-neutral-950/60 shrink-0 flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider hidden sm:inline mr-2">
            {lang === 'tr' ? 'Sezonlar:' : 'Seasons:'}
          </span>

          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg bg-neutral-300 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 shrink-0 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={seasonsScrollRef}
            className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 scroll-smooth flex-1"
          >
            {seasonNumbers.map((seasonNum) => {
              const isSelected = selectedSeason === seasonNum;
              const episodeCount = (series.seasons[seasonNum] || []).length;
              return (
                <button
                  key={seasonNum}
                  type="button"
                  onClick={() => setSelectedSeason(seasonNum)}
                  className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-neutral-950 shadow-md ring-2 ring-amber-400 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900 scale-105'
                      : 'bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-700'
                  }`}
                >
                  <span>{lang === 'tr' ? `${seasonNum}. Sezon` : `Season ${seasonNum}`}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-neutral-950/20 text-neutral-950' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400'
                  }`}>
                    {episodeCount} {t('episodes')}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg bg-neutral-300 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 shrink-0 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Episodes Grid/List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
              {lang === 'tr' ? `${selectedSeason}. Sezon Bölümleri (${currentEpisodes.length})` : `Season ${selectedSeason} Episodes (${currentEpisodes.length})`}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {currentEpisodes.map((ep) => {
              const isPlaying = activeChannel && activeChannel.id === ep.id;
              const epNum = ep.seriesInfo?.episode || 1;

              return (
                <div
                  key={ep.id}
                  onClick={() => onSelectEpisode(ep)}
                  className={`group relative p-3.5 rounded-2xl cursor-pointer border flex flex-col justify-between transition-all duration-200 ${
                    isPlaying
                      ? 'bg-amber-400/15 border-amber-400 shadow-md'
                      : 'bg-white dark:bg-neutral-900/90 border-neutral-300/80 dark:border-neutral-800 hover:border-amber-400/60 hover:-translate-y-0.5 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-neutral-200 dark:bg-neutral-800 font-black text-xs flex items-center justify-center text-amber-500 shrink-0">
                        {epNum}
                      </span>
                      <div>
                        <span className="text-[11px] font-semibold text-neutral-400 block">
                          {lang === 'tr' ? `${selectedSeason}. Sezon ${epNum}. Bölüm` : `S${selectedSeason} E${epNum}`}
                        </span>
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1" title={ep.name}>
                          {ep.name}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800/80">
                    <span className="text-[10px] text-neutral-500 truncate max-w-[140px]">
                      {ep.tag || (lang === 'tr' ? 'Genel' : 'General')}
                    </span>
                    <button
                      type="button"
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-amber-400 text-neutral-950'
                          : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 group-hover:bg-amber-400 group-hover:text-neutral-950'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{isPlaying ? t('watchingNow') : t('play')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {currentEpisodes.length === 0 && (
            <div className="py-12 text-center text-neutral-500 text-sm">
              {lang === 'tr' ? 'Bu sezona ait bölüm bulunamadı.' : 'No episodes found for this season.'}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
