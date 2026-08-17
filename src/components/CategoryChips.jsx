import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { useTranslation } from '../utils/i18n';

export default function CategoryChips({
  tags = [],
  tagCounts = {},
  selectedTag = null,
  onSelectTag,
  onOpenLabelsModal
}) {
  const scrollContainerRef = useRef(null);
  const { t, lang } = useTranslation();

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleTagClick = (tag) => {
    // If clicking the same tag, toggle it off (null), otherwise select the new tag
    if (selectedTag === tag) {
      onSelectTag(null);
    } else {
      onSelectTag(tag);
    }
  };

  return (
    <div className="relative flex items-center gap-2 py-1">
      {/* Scroll Left Button */}
      <button
        type="button"
        onClick={() => handleScroll('left')}
        className="hidden sm:flex items-center justify-center w-8 h-8 rounded-xl bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors shrink-0 shadow-sm cursor-pointer"
        title="Scroll Left"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Chips Horizontal Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth flex-1"
      >
        {/* Individual Publisher Tag Chips */}
        {tags.map((tag) => {
          const isSelected = selectedTag === tag;
          const count = tagCounts[tag] || 0;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-amber-400 text-neutral-950 font-extrabold shadow-md ring-2 ring-amber-400 ring-offset-1 ring-offset-white dark:ring-offset-neutral-900 scale-105'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-300/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-700'
              }`}
            >
              <span>{tag}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-neutral-950/20 text-neutral-950 font-bold' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      <button
        type="button"
        onClick={() => handleScroll('right')}
        className="hidden sm:flex items-center justify-center w-8 h-8 rounded-xl bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors shrink-0 shadow-sm cursor-pointer"
        title="Scroll Right"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* All Tags / Modal Popup Button */}
      <button
        type="button"
        onClick={onOpenLabelsModal}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-200/90 dark:bg-neutral-800 hover:bg-amber-400 hover:text-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold shrink-0 transition-all shadow-sm cursor-pointer"
        title={t('allPublisherLabels')}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span className="hidden md:inline">{t('allPublisherLabels')} ({tags.length})</span>
      </button>
    </div>
  );
}
