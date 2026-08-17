import React from 'react';
import { Settings } from 'lucide-react';

export default function FloatingSettingsButton({ onClick }) {
  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2">
      {/* Floating Settings (Cog) Button */}
      <button
        type="button"
        onClick={onClick}
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/90 dark:bg-neutral-900/90 hover:bg-white dark:hover:bg-neutral-800 border border-neutral-300/80 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-amber-500 dark:hover:text-amber-400 shadow-2xl backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 group/cog"
        title="Ayarlar & Profil"
      >
        <Settings className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-500 group-hover/cog:rotate-90" />
      </button>
    </div>
  );
}
