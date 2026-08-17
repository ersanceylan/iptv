import React, { useState, useMemo } from 'react';
import { Search, Tag, X, Check } from 'lucide-react';
import { useTranslation } from '../utils/i18n';

export default function LabelsModal({
  isOpen,
  onClose,
  tags = [],
  tagCounts = {},
  selectedTag = null,
  onSelectTag
}) {
  const [search, setSearch] = useState('');
  const { t, lang } = useTranslation();

  const filteredTags = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tags;
    return tags.filter((t) => t.toLowerCase().includes(q));
  }, [tags, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-xl max-h-[85vh] flex flex-col bg-[#f5f5f5] dark:bg-[#121212] rounded-3xl border border-neutral-300 dark:border-neutral-800 shadow-2xl overflow-hidden transition-colors">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-300 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-500">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                {t('allPublisherLabels')}
              </h3>
              <p className="text-xs text-neutral-500">
                {lang === 'tr' ? `Listelemek için bir etiket seçin (${tags.length} etiket)` : `Select a tag to browse (${tags.length} tags)`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title={t('close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search inside Modal */}
        <div className="p-4 border-b border-neutral-300 dark:border-neutral-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchLabelPlaceholder')}
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none text-neutral-900 dark:text-white placeholder-neutral-400"
            />
          </div>
        </div>

        {/* Tags List (Scrollable Grid) */}
        <div className="p-4 overflow-y-auto max-h-[50vh] grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Option to clear selection */}
          {selectedTag !== null && (
            <button
              type="button"
              onClick={() => {
                onSelectTag(null);
                onClose();
              }}
              className="p-3 rounded-2xl flex items-center justify-between text-left transition-all bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold text-xs cursor-pointer"
            >
              <span>{lang === 'tr' ? 'Etiket Seçimini Kaldır' : 'Clear Tag Filter'}</span>
              <X className="w-4 h-4" />
            </button>
          )}

          {filteredTags.map((tag) => {
            const count = tagCounts[tag] || 0;
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  onSelectTag(tag);
                  onClose();
                }}
                className={`p-3 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-neutral-950 font-bold shadow-md'
                    : 'bg-white dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300/60 dark:border-neutral-800'
                }`}
              >
                <span className="text-xs font-medium truncate pr-2" title={tag}>
                  {tag}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-neutral-950/20 text-neutral-950 font-bold' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                  }`}>
                    {count}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>
            );
          })}

          {filteredTags.length === 0 && (
            <div className="col-span-full py-8 text-center text-neutral-500 text-xs">
              {t('noContentFoundTitle')}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
