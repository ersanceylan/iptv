import React from 'react';
import { Tv, MessageCircle, Github, Heart, ShieldCheck, Layers } from 'lucide-react';
import { useTranslation } from '../utils/i18n';

export default function Footer() {
  const { t, lang } = useTranslation();

  return (
    <footer className="w-full mt-auto border-t border-neutral-300/80 dark:border-neutral-800/80 bg-neutral-200/40 dark:bg-neutral-950/40 backdrop-blur-md transition-colors py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        
        {/* Brand & Client-side Badge */}
        <div className="space-y-1.5 flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center font-black shadow-glow">
              <Tv className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-neutral-900 dark:text-white">
              IPTV <span className="text-amber-500">Player</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30">
              No-Cloud • Multi-View
            </span>
          </div>
          <p className="text-xs text-neutral-500 max-w-md">
            {t('rightsReserved')}
          </p>
        </div>

        {/* Action Links & Telegram Community */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          
          {/* Telegram Personal (Feedback & Suggestions) */}
          <a
            href="https://t.me/ersanceylann"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-sky-500/10 hover:bg-sky-500 text-sky-600 dark:text-sky-400 hover:text-white border border-sky-500/30 font-bold text-xs shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 group/tg"
            title="Telegram - @ersanceylann"
          >
            <MessageCircle className="w-4 h-4 fill-current group-hover/tg:rotate-12 transition-transform" />
            <span>{t('feedbackAndSuggestions')} (Telegram)</span>
          </a>

          {/* GitHub Repository */}
          <a
            href="https://github.com/ersanceylan"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-neutral-200/80 dark:bg-neutral-800/80 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white border border-neutral-300 dark:border-neutral-700 font-semibold text-xs transition-all duration-200 hover:scale-105 active:scale-95"
            title="GitHub - @ersanceylan"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>

        </div>

      </div>
    </footer>
  );
}
