import React, { useState, useEffect, useMemo } from 'react';
import FloatingSettingsButton from './components/FloatingSettingsButton';
import SettingsModal from './components/SettingsModal';
import BigCategoryHero from './components/BigCategoryHero';
import StickyCategoryBar from './components/StickyCategoryBar';
import CategoryHistorySection from './components/CategoryHistorySection';
import MultiPlayerSection from './components/MultiPlayerSection';
import ChannelGrid from './components/ChannelGrid';
import SeriesGrid from './components/SeriesGrid';
import LabelsModal from './components/LabelsModal';
import HistorySection from './components/HistorySection';
import OnboardingModal from './components/OnboardingModal';
import { loadChannelsFromDB, saveChannelsToDB, loadHistory, recordHistory, clearAllData } from './utils/db';
import { initTheme } from './utils/theme';
import { useTranslation } from './utils/i18n';
import { Tv, Heart, Clapperboard, Film } from 'lucide-react';

export default function App() {
  const [channels, setChannels] = useState([]);
  
  // Multi-Player State (Slot 1 & Slot 2)
  const [channel1, setChannel1] = useState(null);
  const [channel2, setChannel2] = useState(null);
  const [focusedSlot, setFocusedSlot] = useState(1);
  const [userInitiated, setUserInitiated] = useState(false);
  
  // null = Home state (shows 3 big category boxes + favorites + history)
  // 'live' | 'movie' | 'series' | 'favs' = Browsing state (shows sticky category bar, massive search, chips & grid)
  const [activeCategory, setActiveCategory] = useState(null);
  
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('streampulse_v2_favs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState([]);
  const [isM3uModalOpen, setIsM3uModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLabelsModalOpen, setIsLabelsModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize theme & load database
  useEffect(() => {
    initTheme();

    async function loadData() {
      try {
        const [dbChannels, dbHistory] = await Promise.all([
          loadChannelsFromDB(),
          loadHistory()
        ]);

        if (dbChannels && dbChannels.length > 0) {
          setChannels(dbChannels);
        }
        if (dbHistory) {
          setHistory(dbHistory);
        }
      } catch (err) {
        console.error('Veri yükleme hatası:', err);
      } finally {
        setIsLoaded(true);
      }
    }

    loadData();
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('streampulse_v2_favs', JSON.stringify(favorites));
  }, [favorites]);

  // Toggle favorite status
  const handleToggleFavorite = (channelId) => {
    setFavorites((prev) =>
      prev.includes(channelId) ? prev.filter((id) => id !== channelId) : [...prev, channelId]
    );
  };

  // Channel Selection (Updates currently focused player slot)
  const handleSelectChannel = (channel) => {
    setUserInitiated(true);
    if (channel2) {
      // In dual player mode, update the active focused slot
      if (focusedSlot === 2) {
        setChannel2(channel);
      } else {
        setChannel1(channel);
      }
    } else {
      setChannel1(channel);
      setFocusedSlot(1);
    }

    // If not in category mode, set category to channel's mainCategory
    if (!activeCategory && channel.mainCategory) {
      setActiveCategory(channel.mainCategory);
    }
    recordHistory(channel);
    setTimeout(() => {
      loadHistory().then(setHistory);
    }, 500);
  };

  // Add 2nd Player (Dual-Screen / Multi-View)
  const handleAddSecondPlayer = () => {
    // Pick another channel or current one
    const alternativeChannel = channels.find(c => c.id !== channel1?.id) || channel1;
    setChannel2(alternativeChannel);
    setFocusedSlot(2);
  };

  // Close Slot 1
  const handleCloseSlot1 = () => {
    if (channel2) {
      setChannel1(channel2);
      setChannel2(null);
      setFocusedSlot(1);
    } else {
      setChannel1(null);
    }
  };

  // Close Slot 2
  const handleCloseSlot2 = () => {
    setChannel2(null);
    setFocusedSlot(1);
  };

  // Add new channels from M3U
  const handleAddChannels = async (newChannels) => {
    setChannels(newChannels);
    setUserInitiated(false);
    setChannel1(null);
    setChannel2(null);
    setActiveCategory(null);
    await saveChannelsToDB(newChannels);
  };

  // Clear all playlist data
  const handleClearPlaylist = async () => {
    if (window.confirm('Tüm çalma listenizi ve geçmişinizi silmek istediğinize emin misiniz?')) {
      await clearAllData();
      setChannels([]);
      setChannel1(null);
      setChannel2(null);
      setActiveCategory(null);
      setHistory([]);
      setFavorites([]);
      setSelectedTag(null);
    }
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    let live = 0;
    let movies = 0;
    let series = 0;

    for (let i = 0; i < channels.length; i++) {
      const cat = channels[i].mainCategory;
      if (cat === 'series') series++;
      else if (cat === 'movie') movies++;
      else live++;
    }

    return { total: channels.length, live, movies, series };
  }, [channels]);

  // Favorite channels list for home display
  const favoriteChannels = useMemo(() => {
    if (favorites.length === 0) return [];
    const favSet = new Set(favorites);
    return channels.filter((ch) => favSet.has(ch.id));
  }, [channels, favorites]);

  // Filter channels based on active main category
  const currentCategoryChannels = useMemo(() => {
    if (!activeCategory) return [];
    if (activeCategory === 'favs') {
      return favoriteChannels;
    }
    return channels.filter((ch) => ch.mainCategory === activeCategory);
  }, [channels, activeCategory, favoriteChannels]);

  // Extract publisher tags for current active category
  const { availableTags, tagCounts } = useMemo(() => {
    const counts = { all: currentCategoryChannels.length };
    const set = new Set();

    for (let i = 0; i < currentCategoryChannels.length; i++) {
      const tag = currentCategoryChannels[i].tag || 'Genel';
      counts[tag] = (counts[tag] || 0) + 1;
      set.add(tag);
    }

    return {
      availableTags: Array.from(set),
      tagCounts: counts
    };
  }, [currentCategoryChannels]);

  // Filtered channel list for display
  const filteredChannels = useMemo(() => {
    if (!activeCategory) return [];
    const query = searchQuery.trim().toLowerCase();
    const hasTag = Boolean(selectedTag);
    const hasQuery = query.length >= 2;

    // If neither tag is selected nor query >= 2 chars, return empty array
    if (!hasTag && !hasQuery) {
      return [];
    }

    return currentCategoryChannels.filter((ch) => {
      // Publisher tag filter
      if (hasTag && (ch.tag || 'Genel') !== selectedTag) {
        return false;
      }

      // Search query filter
      if (hasQuery) {
        const matchName = ch.name && ch.name.toLowerCase().includes(query);
        const matchTag = ch.tag && ch.tag.toLowerCase().includes(query);
        const matchSeries = ch.seriesInfo?.seriesTitle && ch.seriesInfo.seriesTitle.toLowerCase().includes(query);
        if (!matchName && !matchTag && !matchSeries) return false;
      }

      return true;
    });
  }, [currentCategoryChannels, activeCategory, selectedTag, searchQuery]);

  // Category change handler
  const handleSelectCategory = (cat) => {
    setActiveCategory(cat);
    setSelectedTag(null);
    setSearchQuery('');
  };

  const handleGoHome = () => {
    setActiveCategory(null);
    setChannel1(null);
    setChannel2(null);
    setSelectedTag(null);
    setSearchQuery('');
  };

  const hasAnyPlayerActive = Boolean(channel1 || channel2);
  const { t } = useTranslation();
  const isNoChannels = isLoaded && channels.length === 0;

  return (
    <div className="min-h-screen bg-[#eeeeee] dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Fixed Top-Right Hamburger Menu / Settings Button */}
      <FloatingSettingsButton
        onClick={() => setIsSettingsModalOpen(true)}
      />

      {/* Multi-View Video Player (Spans entire width, 10px side padding) */}
      {hasAnyPlayerActive && (
        <section className="w-full px-[10px] pt-3 pb-2">
          <MultiPlayerSection
            channel1={channel1}
            channel2={channel2}
            userInitiated={userInitiated}
            focusedSlot={focusedSlot}
            onSetFocusedSlot={setFocusedSlot}
            onAddSecondPlayer={handleAddSecondPlayer}
            onCloseSlot1={handleCloseSlot1}
            onCloseSlot2={handleCloseSlot2}
            allChannels={channels}
            onSelectChannel={handleSelectChannel}
          />
        </section>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 flex-1 w-full pb-12">
        
        {/* If Channels Exist */}
        {channels.length > 0 ? (
          <>
            {/* STATE 1: HOMEPAGE (No category selected) */}
            {!activeCategory ? (
              <div className="space-y-6 max-w-5xl mx-auto py-8">
                {/* 3 Big Category Boxes */}
                <BigCategoryHero
                  onSelectCategory={handleSelectCategory}
                  liveCount={categoryCounts.live}
                  moviesCount={categoryCounts.movies}
                  seriesCount={categoryCounts.series}
                />

                {/* Underneath: Favorites & History (Smaller lists) */}
                <HistorySection
                  historyItems={history}
                  favoriteChannels={favoriteChannels}
                  onSelectChannel={handleSelectChannel}
                />
              </div>
            ) : (
              /* STATE 2: CATEGORY SELECTED (Sticky Bar, Search, Chips, Grid, History at bottom) */
              <div className="space-y-6">
                {/* Sticky Category Bar with Massive Search Input & Chips */}
                <StickyCategoryBar
                  activeCategory={activeCategory}
                  onSelectCategory={handleSelectCategory}
                  liveCount={categoryCounts.live}
                  moviesCount={categoryCounts.movies}
                  seriesCount={categoryCounts.series}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  availableTags={availableTags}
                  tagCounts={tagCounts}
                  selectedTag={selectedTag}
                  onSelectTag={setSelectedTag}
                  onOpenLabelsModal={() => setIsLabelsModalOpen(true)}
                />

                {/* Content Grid (Series Grid or Channel Grid) */}
                <section className="pb-8">
                  {activeCategory === 'series' ? (
                    <SeriesGrid
                      seriesChannels={filteredChannels}
                      activeChannel={focusedSlot === 2 ? channel2 : channel1}
                      onSelectEpisode={handleSelectChannel}
                      searchQuery={searchQuery}
                      selectedTag={selectedTag}
                    />
                  ) : (
                    <ChannelGrid
                      channels={filteredChannels}
                      activeChannel={focusedSlot === 2 ? channel2 : channel1}
                      onSelectChannel={handleSelectChannel}
                      favorites={favorites}
                      onToggleFavorite={handleToggleFavorite}
                      mainCategory={activeCategory}
                      searchQuery={searchQuery}
                      selectedTag={selectedTag}
                    />
                  )}
                </section>

                {/* Category-Specific History & Favorites - ALWAYS AT THE BOTTOM OF THE PAGE */}
                <section className="pb-16 border-t border-neutral-300/60 dark:border-neutral-800/80 pt-6">
                  <CategoryHistorySection
                    activeCategory={activeCategory}
                    historyItems={history}
                    favoriteChannels={favoriteChannels}
                    allChannels={channels}
                    activeChannel={focusedSlot === 2 ? channel2 : channel1}
                    onSelectChannel={handleSelectChannel}
                  />
                </section>

              </div>
            )}
          </>
        ) : isLoaded ? (
          /* Empty State (Prompt to Add Playlist) */
          <div className="py-24 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-500 shadow-glow mb-6">
              <Tv className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              {t('welcomeTitle')}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
              {t('welcomeSubtitle')}
            </p>
            <button
              onClick={() => setIsM3uModalOpen(true)}
              className="mt-6 px-8 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-extrabold text-sm shadow-md transition-all cursor-pointer"
            >
              {t('loadPlaylist')}
            </button>
          </div>
        ) : null}

      </main>

      {/* Settings & Profile Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        totalChannels={channels.length}
        liveCount={categoryCounts.live}
        moviesCount={categoryCounts.movies}
        seriesCount={categoryCounts.series}
        onOpenM3uModal={() => setIsM3uModalOpen(true)}
        onClearPlaylist={handleClearPlaylist}
      />

      {/* Onboarding / Register / M3U Modal */}
      <OnboardingModal
        isOpen={isM3uModalOpen || isNoChannels}
        isMandatory={isNoChannels}
        onClose={() => setIsM3uModalOpen(false)}
        onAddChannels={handleAddChannels}
      />

      {/* Labels / Tags Popup Modal */}
      <LabelsModal
        isOpen={isLabelsModalOpen}
        onClose={() => setIsLabelsModalOpen(false)}
        tags={availableTags}
        tagCounts={tagCounts}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
      />

    </div>
  );
}
