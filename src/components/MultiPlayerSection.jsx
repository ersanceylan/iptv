import React, { useState, useRef, useEffect, useCallback } from 'react';
import VideoPlayer from './VideoPlayer';
import { Plus, GripHorizontal, RotateCcw } from 'lucide-react';
import { useTranslation } from '../utils/i18n';

export default function MultiPlayerSection({
  channel1,
  channel2,
  userInitiated,
  focusedSlot = 1,
  onSetFocusedSlot,
  onAddSecondPlayer,
  onCloseSlot1,
  onCloseSlot2,
  allChannels = [],
  onSelectChannel
}) {
  const isDual = Boolean(channel1 && channel2);
  const { t } = useTranslation();

  // Custom player height state (null = auto 16:9 aspect ratio)
  const [customHeight, setCustomHeight] = useState(() => {
    try {
      const saved = localStorage.getItem('streampulse_player_height');
      const parsed = saved ? parseInt(saved, 10) : null;
      return Number.isFinite(parsed) && parsed >= 150 && parsed <= 1200 ? parsed : null;
    } catch {
      return null;
    }
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragDisplayHeight, setDragDisplayHeight] = useState(null);
  const dragStartYRef = useRef(0);
  const dragStartHeightRef = useRef(0);
  const containerRef = useRef(null);

  // Drag start handler (Mouse & Touch)
  const handleDragStart = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);

    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartYRef.current = clientY;

    let currentH = customHeight;
    if (!currentH && containerRef.current) {
      const firstChild = containerRef.current.querySelector('.aspect-video, [style*="height"]');
      if (firstChild) {
        currentH = Math.round(firstChild.getBoundingClientRect().height);
      }
    }
    dragStartHeightRef.current = currentH || 450;
    setDragDisplayHeight(dragStartHeightRef.current);

    const onMove = (moveEvent) => {
      const currentY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const deltaY = currentY - dragStartYRef.current;
      const minH = 200;
      const maxH = Math.round(Math.min(900, window.innerHeight * 0.85));
      const calculatedH = Math.round(Math.min(maxH, Math.max(minH, dragStartHeightRef.current + deltaY)));
      setDragDisplayHeight(calculatedH);
      setCustomHeight(calculatedH);
    };

    const onEnd = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      document.body.classList.remove('select-none', 'cursor-row-resize');
    };

    window.addEventListener('mousemove', onMove, { passive: false });
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    document.body.classList.add('select-none', 'cursor-row-resize');
  }, [customHeight]);

  // Persist resized height in localStorage
  useEffect(() => {
    if (customHeight) {
      try {
        localStorage.setItem('streampulse_player_height', String(customHeight));
      } catch (err) {}
    }
  }, [customHeight]);

  // Reset custom height to default 16:9 ratio
  const handleResetHeight = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setCustomHeight(null);
    setDragDisplayHeight(null);
    try {
      localStorage.removeItem('streampulse_player_height');
    } catch (err) {}
  }, []);

  const singlePlayerWidth = customHeight ? Math.round(customHeight * (16 / 9)) : null;
  const containerMaxWidth = customHeight
    ? (isDual ? Math.round(singlePlayerWidth * 2 + 24) : singlePlayerWidth)
    : null;

  return (
    <div className="relative w-full">
      {/* Players Container */}
      <div
        ref={containerRef}
        style={{
          maxWidth: containerMaxWidth ? `${containerMaxWidth}px` : undefined
        }}
        className="w-full mx-auto max-w-full"
      >
        <div className={`grid gap-3 sm:gap-4 items-center justify-center w-full ${
          isDual ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
        }`}>
          
          {/* PLAYER 1 */}
          {channel1 && (
            <div
              key="player-slot-1"
              onClick={() => {
                if (focusedSlot !== 1) onSetFocusedSlot(1);
              }}
              className={`relative w-full rounded-3xl cursor-pointer transition-all duration-300 ${
                isDual && focusedSlot === 1
                  ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#eeeeee] dark:ring-offset-[#0a0a0a] shadow-xl shadow-amber-400/25 dark:shadow-[0_0_30px_rgba(251,191,36,0.3)]'
                  : 'shadow-md shadow-black/10 dark:shadow-none'
              }`}
            >
              {isDual && (
                <div className="absolute top-3 left-3 z-30 pointer-events-none">
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md flex items-center gap-1.5 ${
                    focusedSlot === 1
                      ? 'bg-amber-400 text-neutral-950 ring-1 ring-amber-400'
                      : 'bg-black/70 text-white/80'
                  }`}>
                    <span>{t('screen1')} {focusedSlot === 1 ? `• ${t('activeAudio')}` : `• ${t('muted')}`}</span>
                  </span>
                </div>
              )}

              <VideoPlayer
                activeChannel={channel1}
                userInitiated={userInitiated}
                onClose={onCloseSlot1}
                isCompact={false}
                allChannels={allChannels}
                customHeight={customHeight}
                forceMuted={isDual && focusedSlot !== 1}
                isDual={isDual}
                onChangeChannel={(newCh) => {
                  if (onSelectChannel) onSelectChannel(newCh);
                }}
              />
            </div>
          )}

          {/* PLAYER 2 (in Dual Mode) */}
          {channel2 && (
            <div
              key="player-slot-2"
              onClick={() => {
                if (focusedSlot !== 2) onSetFocusedSlot(2);
              }}
              className={`relative w-full rounded-3xl cursor-pointer transition-all duration-300 ${
                focusedSlot === 2
                  ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#eeeeee] dark:ring-offset-[#0a0a0a] shadow-xl shadow-amber-400/25 dark:shadow-[0_0_30px_rgba(251,191,36,0.3)]'
                  : 'shadow-md shadow-black/10 dark:shadow-none'
              }`}
            >
              <div className="absolute top-3 left-3 z-30 pointer-events-none">
                <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md flex items-center gap-1.5 ${
                  focusedSlot === 2
                    ? 'bg-amber-400 text-neutral-950 ring-1 ring-amber-400'
                    : 'bg-black/70 text-white/80'
                }`}>
                  <span>{t('screen2')} {focusedSlot === 2 ? `• ${t('activeAudio')}` : `• ${t('muted')}`}</span>
                </span>
              </div>

              <VideoPlayer
                activeChannel={channel2}
                userInitiated={userInitiated}
                onClose={onCloseSlot2}
                isCompact={false}
                allChannels={allChannels}
                customHeight={customHeight}
                forceMuted={isDual && focusedSlot !== 2}
                isDual={isDual}
                onChangeChannel={(newCh) => {
                  if (onSelectChannel) onSelectChannel(newCh);
                }}
              />
            </div>
          )}

        </div>
      </div>

      {/* Draggable Height Resize Handle Bar below player */}
      <div className="w-full flex items-center justify-center pt-2 pb-0.5 select-none group/resizer">
        <div
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          onDoubleClick={handleResetHeight}
          className={`flex items-center gap-1.5 px-4 py-1 rounded-full border transition-all duration-200 cursor-row-resize shadow-md backdrop-blur-md ${
            isDragging
              ? 'bg-amber-400 border-amber-400 text-neutral-950 shadow-glow scale-105 ring-2 ring-amber-400/50'
              : 'bg-white/80 dark:bg-neutral-900/80 hover:bg-amber-400/10 border-neutral-300/80 dark:border-neutral-800 hover:border-amber-400/60 text-neutral-600 dark:text-neutral-400 hover:text-amber-500'
          }`}
          title={t('adjustSize')}
        >
          <GripHorizontal className={`w-3.5 h-3.5 ${isDragging ? 'stroke-[3]' : 'stroke-[2]'}`} />
          <span className="text-[10px] font-black uppercase tracking-wider">
            {isDragging
              ? `${Math.round((dragDisplayHeight || customHeight) * (16 / 9))} × ${dragDisplayHeight || customHeight}px`
              : customHeight
              ? `${Math.round(customHeight * (16 / 9))} × ${customHeight}px • 16:9`
              : t('adjustSize')}
          </span>
          {customHeight && (
            <button
              type="button"
              onClick={handleResetHeight}
              className="ml-0.5 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
              title={t('resetSize')}
            >
              <RotateCcw className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      {/* Large Hoverable PLUS (+) Button on the right when single player is active */}
      {!isDual && channel1 && (
        <div className="group/plus absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30">
          <button
            type="button"
            onClick={onAddSecondPlayer}
            className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-amber-400/90 hover:bg-amber-300 text-neutral-950 shadow-xl hover:shadow-glow flex flex-col items-center justify-center transition-all duration-300 transform scale-90 sm:scale-95 group-hover/plus:scale-110 active:scale-90 cursor-pointer"
            title={t('addSecondPlayer')}
          >
            <Plus className="w-6 h-6 sm:w-8 sm:h-8 stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
}
