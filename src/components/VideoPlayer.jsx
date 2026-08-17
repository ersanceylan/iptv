import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Hls from 'hls.js';
import mpegts from 'mpegts.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  AlertCircle,
  RefreshCw,
  Tv,
  Cast,
  Settings,
  Check,
  Film,
  Clapperboard,
  X,
  ShieldCheck,
  Zap,
  RotateCw,
  Radio,
  Sliders
} from 'lucide-react';
import { setupCastListeners, triggerCastPrompt, castChannelMedia, endCastSession } from '../utils/cast';
import { findChannelQualityVariants } from '../utils/qualityHelper';
import { useTranslation } from '../utils/i18n';

const STANDARD_QUALITIES = [
  { id: -1, label: 'Otomatik (Orijinal)' },
  { id: 1080, label: '1080p Full HD' },
  { id: 720, label: '720p HD' },
  { id: 480, label: '480p SD' },
  { id: 360, label: '360p' }
];

// Audio diagnostic logger
function logAudio(tag, video) {
  if (!video) return;
  const info = {
    muted: video.muted,
    volume: video.volume,
    paused: video.paused,
    readyState: video.readyState,
    networkState: video.networkState,
    currentTime: video.currentTime?.toFixed(2),
    audioDecodedBytes: video.webkitAudioDecodedByteCount || 'N/A',
    videoDecodedBytes: video.webkitVideoDecodedByteCount || 'N/A',
    audioTracks: video.audioTracks?.length ?? 'API unavailable',
    error: video.error ? `code:${video.error.code} msg:${video.error.message}` : null,
  };
  console.log(`[AudioDiag:${tag}]`, info);
}

export default function VideoPlayer({
  activeChannel,
  userInitiated = false,
  onChannelEnd,
  onClose,
  allChannels = [],
  onChangeChannel,
  customHeight = null,
  isCompact = false,
  forceMuted = false,
  isDual = false
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(forceMuted);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStalled, setIsStalled] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isIdle, setIsIdle] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const { t, lang } = useTranslation();

  const forceMutedRef = useRef(forceMuted);
  useEffect(() => {
    forceMutedRef.current = forceMuted;
  }, [forceMuted]);

  // Synchronize forceMuted prop changes (e.g. when user switches active audio slot in dual mode)
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = forceMuted;
      setIsMuted(forceMuted);
      if (!forceMuted) {
        video.volume = volume || 1;
      }
    }
  }, [forceMuted, volume]);

  // Quality resolution states
  const [qualityLevels, setQualityLevels] = useState([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  // Buffer Mode state: 'smooth' (Anti-Donma / 512KB buffer) vs 'low-latency' (128KB buffer)
  const [bufferMode, setBufferMode] = useState(() => {
    try {
      return localStorage.getItem('streampulse_buffer_mode') || 'smooth';
    } catch {
      return 'smooth';
    }
  });

  const [activeStreamType, setActiveStreamType] = useState('direct'); // 'hls' | 'mpegts' | 'direct'

  const hlsRef = useRef(null);
  const mpegtsRef = useRef(null);
  const idleTimerRef = useRef(null);
  const loadingTimeoutRef = useRef(null);
  const stallTimeoutRef = useRef(null);
  const autoRetryCountRef = useRef(0);
  const audioCheckTimerRef = useRef(null);
  const reloadKeyRef = useRef(0);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Find playlist quality variants for current channel (e.g. FHD, HD, SD, HEVC)
  const qualityVariants = useMemo(() => {
    return findChannelQualityVariants(activeChannel, allChannels);
  }, [activeChannel, allChannels]);

  // Persist buffer mode change
  const handleToggleBufferMode = (mode) => {
    setBufferMode(mode);
    try {
      localStorage.setItem('streampulse_buffer_mode', mode);
    } catch (e) {}
    // Trigger seamless stream reload with new buffer profile
    setReloadTrigger((prev) => prev + 1);
  };

  // Activity handler to show controls and mouse cursor, then hide after 2.5s
  const handleUserActivity = useCallback(() => {
    setShowControls(true);
    setIsIdle(false);

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    idleTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused && !showQualityMenu) {
        setShowControls(false);
        setIsIdle(true);
      }
    }, 2500);
  }, [showQualityMenu]);

  useEffect(() => {
    setupCastListeners((castingState) => {
      setIsCasting(castingState);
    });
  }, []);

  useEffect(() => {
    if (isCasting && activeChannel) {
      castChannelMedia(activeChannel);
    }
  }, [activeChannel, isCasting]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Force unmute utility - ensures audio is really playing when slot is active
  const forceUnmuteVideo = useCallback((video) => {
    if (!video) return;
    if (forceMutedRef.current) {
      video.muted = true;
      setIsMuted(true);
      return;
    }
    video.muted = false;
    video.volume = volume || 1;
    setIsMuted(false);
  }, [volume]);

  // Safe Playback Method with explicit audio volume and post-play verification
  const safelyPlayVideo = useCallback((video) => {
    if (!video) return;

    logAudio('beforePlay', video);

    const isCurrentlyMuted = forceMutedRef.current;
    if (isCurrentlyMuted) {
      video.muted = true;
      setIsMuted(true);
    } else {
      video.muted = false;
      video.volume = volume || 1;
      setIsMuted(false);
    }

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('[AudioDiag] play() resolved successfully');
          if (forceMutedRef.current) {
            video.muted = true;
            setIsMuted(true);
          } else {
            video.muted = false;
            video.volume = volume || 1;
            setIsMuted(false);
          }
          setIsPlaying(true);
          setIsStalled(false);
        })
        .catch((err) => {
          console.warn('[AudioDiag] play() rejected (autoplay policy):', err.name, err.message);
          video.muted = true;
          setIsMuted(true);
          video.play()
            .then(() => {
              setIsPlaying(true);
            })
            .catch(() => {});
        });
    }
  }, [volume]);

  // Instant Stream Resync / Unfreeze Action
  const handleQuickResync = useCallback(() => {
    console.log('[AudioDiag] User triggered Quick Resync');
    setIsLoading(true);
    setIsStalled(false);
    setError(null);
    setReloadTrigger((prev) => prev + 1);
  }, []);

  // Stream loader
  useEffect(() => {
    if (!activeChannel) return;

    const video = videoRef.current;
    if (!video) return;

    console.log('[AudioDiag] === Loading stream ===', activeChannel.name, activeChannel.url, `BufferMode: ${bufferMode}`);

    setIsLoading(true);
    setIsStalled(false);
    setError(null);
    setIsPlaying(false);
    setQualityLevels([]);
    setShowQualityMenu(false);
    autoRetryCountRef.current = 0;

    // Set video audio attributes according to slot focus
    if (forceMuted) {
      video.muted = true;
      setIsMuted(true);
    } else {
      video.muted = false;
      video.volume = volume || 1;
      setIsMuted(false);
    }

    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    if (stallTimeoutRef.current) clearTimeout(stallTimeoutRef.current);
    if (audioCheckTimerRef.current) clearInterval(audioCheckTimerRef.current);

    loadingTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 15000);

    const cleanupInstances = () => {
      if (hlsRef.current) {
        try { hlsRef.current.destroy(); } catch (e) {}
        hlsRef.current = null;
      }
      if (mpegtsRef.current) {
        try { mpegtsRef.current.destroy(); } catch (e) {}
        mpegtsRef.current = null;
      }
    };

    cleanupInstances();

    const rawSrc = activeChannel.url;
    const lowerSrc = rawSrc.toLowerCase();
    const isDirectMp4 = lowerSrc.endsWith('.mp4') || lowerSrc.endsWith('.webm') || lowerSrc.endsWith('.ogg') || lowerSrc.endsWith('.mkv') || lowerSrc.endsWith('.avi');
    const isHls = lowerSrc.includes('.m3u8') || lowerSrc.includes('output=m3u8') || lowerSrc.includes('output=hls') || lowerSrc.includes('/hls/');

    const loadDirectNativeVideo = (srcToUse = rawSrc) => {
      console.log('[AudioDiag] Loading via native <video> src:', srcToUse);
      setActiveStreamType('direct');
      cleanupInstances();
      video.src = srcToUse;
      video.load();
      forceUnmuteVideo(video);
      setIsLoading(false);
      if (userInitiated && !isCasting) {
        safelyPlayVideo(video);
      }
    };

    const loadMpegTs = (srcToUse = rawSrc) => {
      if (!mpegts.isSupported()) {
        console.warn('[AudioDiag] mpegts not supported in this browser, falling back to native video');
        loadDirectNativeVideo(srcToUse);
        return;
      }
      try {
        setActiveStreamType('mpegts');
        console.log('[AudioDiag] Loading via mpegts.js (MPEG-TS):', srcToUse, `BufferProfile: ${bufferMode}`);
        cleanupInstances();

        // In dual player mode, keep latency chasing disabled and stash buffer healthy to prevent stream fighting
        const isSmooth = bufferMode === 'smooth' || isDual;
        const player = mpegts.createPlayer({
          type: 'mse',
          isLive: true,
          url: srcToUse,
          hasAudio: true,
          hasVideo: true
        }, {
          enableWorker: true,
          lazyLoad: false,
          liveBufferLatencyChasing: false,
          enableStashBuffer: true,
          stashInitialSize: isSmooth ? 512 : 256,
          autoCleanupSourceBuffer: true,
          autoCleanupMaxBackwardDuration: isSmooth ? 90 : 30,
          autoCleanupMinBackwardDuration: isSmooth ? 45 : 15
        });

        mpegtsRef.current = player;

        player.on(mpegts.Events.MEDIA_INFO, (info) => {
          console.log('[AudioDiag:mpegts] MEDIA_INFO:', {
            hasAudio: info?.hasAudio,
            hasVideo: info?.hasVideo,
            audioCodec: info?.audioCodec,
            audioSampleRate: info?.audioSampleRate,
            audioChannelCount: info?.audioChannelCount,
          });
        });

        player.on(mpegts.Events.ERROR, (type, detail, info) => {
          console.error('[AudioDiag:mpegts] ERROR:', type, detail, info);
          // Only fallback to native video if mpegts completely fails on first load
          if (autoRetryCountRef.current < 2) {
            autoRetryCountRef.current++;
            setTimeout(() => {
              if (player && player.load) {
                try { player.load(); } catch (e) {}
              }
            }, 1000);
          }
        });

        player.attachMediaElement(video);
        player.load();
        forceUnmuteVideo(video);

        if (userInitiated && !isCasting) {
          setTimeout(() => {
            forceUnmuteVideo(video);
            video.play()
              .then(() => {
                console.log('[AudioDiag:mpegts] play() resolved');
                forceUnmuteVideo(video);
                setIsPlaying(true);
                setIsLoading(false);
              })
              .catch((err) => {
                console.warn('[AudioDiag:mpegts] play() rejected:', err.name);
                video.muted = true;
                setIsMuted(true);
                video.play().then(() => setIsPlaying(true)).catch(() => {});
                setIsLoading(false);
              });
          }, 300);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('[AudioDiag] mpegts.js failed, falling to native video:', err);
        loadDirectNativeVideo(srcToUse);
      }
    };

    const loadHls = (srcToUse = rawSrc) => {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log('[AudioDiag] Loading via Safari native HLS');
        setActiveStreamType('direct');
        loadDirectNativeVideo(srcToUse);
        return;
      }

      if (Hls.isSupported()) {
        setActiveStreamType('hls');
        console.log('[AudioDiag] Loading via hls.js:', srcToUse);
        cleanupInstances();
        const isSmooth = bufferMode === 'smooth' || isDual;

        const hls = new Hls({
          debug: false,
          enableWorker: true,
          lowLatencyMode: !isSmooth,
          backBufferLength: isSmooth ? 90 : 30,
          maxBufferLength: isSmooth ? 60 : 30,
          maxMaxBufferLength: 300,
          manifestLoadingTimeOut: 15000,
          levelLoadingTimeOut: 15000,
          fragLoadingTimeOut: 15000
        });

        hlsRef.current = hls;
        hls.loadSource(srcToUse);
        hls.attachMedia(video);

        hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (event, data) => {
          console.log('[AudioDiag:hls] AUDIO_TRACKS_UPDATED:', data.audioTracks?.map(t => ({
            id: t.id,
            name: t.name,
            lang: t.lang,
            codec: t.audioCodec || t.codec
          })));
          if (data.audioTracks && data.audioTracks.length > 0 && hls.audioTrack === -1) {
            hls.audioTrack = 0;
          }
        });

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          console.log('[AudioDiag:hls] MANIFEST_PARSED:', {
            levels: data.levels?.length,
            audioTracks: data.audioTracks,
          });

          setIsLoading(false);
          if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);

          if (data.levels && data.levels.length > 1) {
            const lvls = data.levels.map((lvl, index) => ({
              id: index,
              height: lvl.height,
              label: lvl.height ? `${lvl.height}p ${lvl.height >= 1080 ? 'Full HD' : lvl.height >= 720 ? 'HD' : 'SD'}` : `Seviye ${index + 1}`
            }));
            setQualityLevels([{ id: -1, label: 'Otomatik (Önerilen)' }, ...lvls]);
          } else {
            setQualityLevels(STANDARD_QUALITIES);
          }

          forceUnmuteVideo(video);

          if (userInitiated && !isCasting) {
            safelyPlayVideo(video);
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('[AudioDiag:hls] ERROR:', data.type, data.details, data.fatal);

          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                if (autoRetryCountRef.current < 2) {
                  autoRetryCountRef.current++;
                  hls.startLoad();
                } else {
                  console.warn('[AudioDiag] HLS network error, attempting recovery');
                  setTimeout(() => hls.startLoad(), 2000);
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                if (autoRetryCountRef.current < 3) {
                  autoRetryCountRef.current++;
                  hls.recoverMediaError();
                } else {
                  hls.swapAudioCodec();
                  hls.recoverMediaError();
                }
                break;
              default:
                hls.destroy();
                setTimeout(() => loadHls(srcToUse), 1500);
                break;
            }
          }
        });

        return;
      }

      loadDirectNativeVideo(srcToUse);
    };

    // 1. Progressive Video (MP4, MKV, WebM)
    if (isDirectMp4) {
      loadDirectNativeVideo(rawSrc);
      return;
    }

    // 2. HLS Manifests (.m3u8, output=hls)
    if (isHls) {
      loadHls(rawSrc);
      return;
    }

    // 3. Live MPEG-TS Streams (.ts, /play/, /live/, output=mpegts, raw streams)
    loadMpegTs(rawSrc);

    return () => {
      cleanupInstances();
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      if (stallTimeoutRef.current) clearTimeout(stallTimeoutRef.current);
      if (audioCheckTimerRef.current) clearInterval(audioCheckTimerRef.current);
    };
  }, [activeChannel?.id, activeChannel?.url, bufferMode, reloadTrigger]);

  // Periodic audio health monitor (only checks unmuted active slots)
  useEffect(() => {
    if (!isPlaying || forceMuted) return;
    const video = videoRef.current;
    if (!video) return;

    let lastDecodedBytes = video.webkitAudioDecodedByteCount || 0;

    const checkInterval = setInterval(() => {
      if (!video || video.paused || forceMuted) return;
      const currentDecoded = video.webkitAudioDecodedByteCount;
      if (currentDecoded !== undefined) {
        const delta = currentDecoded - lastDecodedBytes;
        if (delta === 0 && currentDecoded > 0) {
          console.warn('[AudioDiag:healthCheck] Audio stalled');
        }
        lastDecodedBytes = currentDecoded;
      }

      if (video.muted && !isMuted && !forceMuted) {
        video.muted = false;
        video.volume = volume || 1;
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [isPlaying, isMuted, volume, forceMuted]);

  // Play / Pause Toggle
  const togglePlay = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn('[AudioDiag] togglePlay resume caught:', err);
          video.muted = true;
          setIsMuted(true);
          video.play().then(() => setIsPlaying(true)).catch(() => {});
        });
      }
    } else {
      video.pause();
      setIsPlaying(false);
      setShowControls(true);
      setIsIdle(false);
    }
  };

  // Mute / Unmute Toggle
  const toggleMute = (e) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);

    if (!nextMuted) {
      const activeVol = volume > 0 ? volume : 1;
      video.volume = activeVol;
      setVolume(activeVol);
    }

    logAudio('toggleMute', video);
  };

  // Volume Slider Handler
  const handleVolumeChange = (e) => {
    e.stopPropagation();
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // HLS Resolution Selection
  const handleSelectQuality = (lvlId) => {
    setCurrentQuality(lvlId);
    setShowQualityMenu(false);

    if (hlsRef.current && qualityLevels.length > 0) {
      hlsRef.current.currentLevel = lvlId;
      console.log('[AudioDiag] Switched HLS level to:', lvlId);
    }
  };

  // Switch to an alternate quality stream of the same channel from the playlist
  const handleSelectVariantChannel = (variantChannel) => {
    setShowQualityMenu(false);
    if (onChangeChannel && variantChannel && variantChannel.id !== activeChannel.id) {
      console.log('[AudioDiag] Switching to channel quality variant:', variantChannel.name);
      onChangeChannel(variantChannel);
    }
  };

  const handleCastToggle = () => {
    if (isCasting) {
      endCastSession();
    } else {
      triggerCastPrompt();
    }
  };

  if (!activeChannel) return null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleUserActivity}
      onMouseDown={handleUserActivity}
      onTouchStart={handleUserActivity}
      style={{
        height: customHeight ? `${customHeight}px` : undefined,
        width: customHeight ? `${Math.round(customHeight * (16 / 9))}px` : '100%',
        maxWidth: '100%',
        aspectRatio: '16 / 9'
      }}
      className={`relative w-full mx-auto rounded-3xl overflow-hidden bg-black border border-neutral-800 shadow-2xl select-none ${
        isIdle && isPlaying ? 'player-idle-hide-cursor' : ''
      }`}
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        playsInline
        preload="auto"
        onClick={togglePlay}
        onPlay={() => {
          setIsPlaying(true);
          setIsStalled(false);
          logAudio('onPlay', videoRef.current);
        }}
        onPause={() => {
          setIsPlaying(false);
          setShowControls(true);
          setIsIdle(false);
        }}
        onWaiting={() => {
          setIsLoading(true);
          setIsStalled(true);
          if (stallTimeoutRef.current) clearTimeout(stallTimeoutRef.current);
          // If stalled for > 12s, attempt gentle buffer recovery to prevent mutual restart collision
          stallTimeoutRef.current = setTimeout(() => {
            console.warn('[AudioDiag] Video stalled for > 12s, attempting buffer resume');
            if (videoRef.current && videoRef.current.paused) {
              videoRef.current.play().catch(() => {});
            } else if (hlsRef.current) {
              hlsRef.current.startLoad();
            } else if (mpegtsRef.current) {
              try { mpegtsRef.current.load(); } catch (e) {}
            }
          }, 12000);
        }}
        onPlaying={() => {
          setIsLoading(false);
          setIsStalled(false);
          if (stallTimeoutRef.current) clearTimeout(stallTimeoutRef.current);
          logAudio('onPlaying', videoRef.current);
        }}
        onLoadedMetadata={() => {
          logAudio('onLoadedMetadata', videoRef.current);
        }}
        onEnded={onChannelEnd}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Top Header Overlay */}
      <div
        className={`absolute top-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 pointer-events-auto ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
            {activeChannel.mainCategory === 'series' ? (
              <Clapperboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : activeChannel.mainCategory === 'movie' ? (
              <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <Tv className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </div>
          <div className="max-w-[140px] sm:max-w-xs">
            <h3 className="font-bold text-xs sm:text-sm text-white truncate">
              {activeChannel.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-neutral-400 truncate">
                {activeChannel.tag || 'Genel Yayın'}
              </span>
              {/* Anti-Freeze Smooth Mode Badge */}
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                bufferMode === 'smooth'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {bufferMode === 'smooth' ? '🛡️ Akıcı Mod' : '⚡ Düşük Gecikme'}
              </span>
            </div>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Resync / Unfreeze Button */}
          <button
            type="button"
            onClick={handleQuickResync}
            className="p-1.5 sm:p-2 rounded-xl bg-black/40 hover:bg-amber-400/20 border border-white/10 hover:border-amber-400/40 text-white/80 hover:text-amber-400 backdrop-blur-sm transition-all cursor-pointer"
            title={t('refreshStream')}
          >
            <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Chromecast Button */}
          <button
            type="button"
            onClick={handleCastToggle}
            className={`p-1.5 sm:p-2 rounded-xl border backdrop-blur-sm transition-all cursor-pointer ${
              isCasting
                ? 'bg-amber-400 border-amber-400 text-neutral-950 shadow-md font-bold'
                : 'bg-black/40 border-white/10 text-white/80 hover:text-white hover:bg-black/60'
            }`}
            title={isCasting ? t('stopCast') : t('castToTv')}
          >
            <Cast className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Quality & Settings Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowQualityMenu(!showQualityMenu)}
              className={`p-1.5 sm:p-2 rounded-xl border backdrop-blur-sm transition-all cursor-pointer ${
                showQualityMenu
                  ? 'bg-amber-400 border-amber-400 text-neutral-950 shadow-md'
                  : 'bg-black/40 hover:bg-black/60 border-white/10 text-white/80 hover:text-white'
              }`}
              title={t('streamSettings')}
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Quality & Buffer Dropdown Menu */}
            {showQualityMenu && (
              <div className="absolute right-0 top-11 z-50 w-64 p-2.5 rounded-2xl bg-neutral-900/95 border border-neutral-700 shadow-2xl backdrop-blur-xl space-y-3">
                
                {/* SECTION 1: ANTI-FREEZE BUFFER ENGINE */}
                <div className="space-y-1">
                  <div className="px-2 py-0.5 text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{t('antiFreezeEngine')}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleBufferMode('smooth')}
                    className={`w-full px-2.5 py-2 rounded-xl text-xs flex items-center justify-between text-left transition-all cursor-pointer ${
                      bufferMode === 'smooth'
                        ? 'bg-amber-400 text-neutral-950 font-bold shadow-md'
                        : 'text-neutral-300 hover:bg-neutral-800/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>{t('smoothBufferTitle')}</span>
                        {bufferMode === 'smooth' && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <p className={`text-[10px] ${bufferMode === 'smooth' ? 'text-neutral-900/80' : 'text-neutral-400'}`}>
                        {t('smoothBufferDesc')}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleBufferMode('low-latency')}
                    className={`w-full px-2.5 py-2 rounded-xl text-xs flex items-center justify-between text-left transition-all cursor-pointer ${
                      bufferMode === 'low-latency'
                        ? 'bg-amber-400 text-neutral-950 font-bold shadow-md'
                        : 'text-neutral-300 hover:bg-neutral-800/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>{t('lowLatencyTitle')}</span>
                        {bufferMode === 'low-latency' && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <p className={`text-[10px] ${bufferMode === 'low-latency' ? 'text-neutral-900/80' : 'text-neutral-400'}`}>
                        {t('lowLatencyDesc')}
                      </p>
                    </div>
                  </button>
                </div>

                {/* SECTION 2: PLAYLIST QUALITY VARIANTS (FHD, HD, SD, HEVC) */}
                {qualityVariants.length > 0 && (
                  <div className="space-y-1 border-t border-neutral-800 pt-2">
                    <div className="px-2 py-0.5 text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <Radio className="w-3 h-3" />
                      <span>{t('altQualities')}</span>
                    </div>
                    {qualityVariants.map((v) => (
                      <button
                        key={v.channel.id}
                        type="button"
                        onClick={() => handleSelectVariantChannel(v.channel)}
                        className={`w-full px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between text-left transition-colors cursor-pointer ${
                          v.isCurrent
                            ? 'bg-amber-400 text-neutral-950 font-bold'
                            : 'text-neutral-300 hover:bg-neutral-800'
                        }`}
                      >
                        <div className="truncate max-w-[170px]">
                          <span className="font-semibold">{v.qualityLabel}</span>
                          <span className={`block text-[10px] truncate ${v.isCurrent ? 'text-neutral-900/80' : 'text-neutral-400'}`}>
                            {v.fullName}
                          </span>
                        </div>
                        {v.isCurrent && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}

                {/* SECTION 3: HLS MULTI-BITRATE RESOLUTIONS (If HLS Stream) */}
                {activeStreamType === 'hls' && qualityLevels.length > 1 && (
                  <div className="space-y-1 border-t border-neutral-800 pt-2">
                    <div className="px-2 py-0.5 text-[10px] font-black text-neutral-400 uppercase tracking-wider">
                      {t('hlsResolution')}
                    </div>
                    {qualityLevels.map((lvl) => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => handleSelectQuality(lvl.id)}
                        className={`w-full px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between text-left transition-colors cursor-pointer ${
                          currentQuality === lvl.id
                            ? 'bg-amber-400 text-neutral-950 font-bold'
                            : 'text-neutral-300 hover:bg-neutral-800'
                        }`}
                      >
                        <span>{lvl.label}</span>
                        {currentQuality === lvl.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}

                {/* SECTION 4: QUICK REFRESH ACTION */}
                <div className="border-t border-neutral-800 pt-2">
                  <button
                    type="button"
                    onClick={handleQuickResync}
                    className="w-full px-2.5 py-2 rounded-xl bg-neutral-800 hover:bg-amber-400 hover:text-neutral-950 text-xs font-bold text-neutral-200 flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{t('resyncStream')}</span>
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* Close Player Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-black/40 hover:bg-rose-500/80 border border-white/10 text-white/80 hover:text-white backdrop-blur-sm transition-all cursor-pointer"
              title={t('closePlayer')}
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </div>


      {/* Stalled / Buffering Banner with Quick Fix */}
      {isStalled && isPlaying && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20">
          <button
            type="button"
            onClick={handleQuickResync}
            className="px-4 py-1.5 rounded-full bg-neutral-900/90 hover:bg-amber-400 hover:text-neutral-950 border border-amber-400/40 text-amber-400 text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer"
            title={t('buffering')}
          >
            <RotateCw className="w-3 h-3 animate-spin" />
            <span>{t('buffering')}</span>
          </button>
        </div>
      )}

      {/* Center Spinner on Loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/30 backdrop-blur-xs">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-3 border-amber-400 border-t-transparent rounded-full animate-spin shadow-glow" />
        </div>
      )}

      {/* Error Card */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
          <div className="max-w-md p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-rose-500/30 text-center space-y-3">
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-rose-500 mx-auto" />
            <h4 className="font-bold text-xs sm:text-sm text-white">{t('streamFailed')}</h4>
            <p className="text-[11px] sm:text-xs text-neutral-400">{error}</p>
            <button
              onClick={handleQuickResync}
              className="px-4 py-2 rounded-xl bg-amber-400 text-neutral-950 text-xs font-bold shadow-md flex items-center gap-1.5 mx-auto hover:bg-amber-300 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('retry')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between transition-opacity duration-300 pointer-events-auto ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Play/Pause & Volume */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-400 text-neutral-950 hover:bg-amber-300 flex items-center justify-center transition-transform hover:scale-105 shadow-md font-bold shrink-0 cursor-pointer"
            title={isPlaying ? t('pause') : t('play')}
          >
            {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-neutral-950" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-neutral-950 ml-0.5" />}
          </button>

          {/* Mute & Volume Slider */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className={`p-1.5 sm:p-2 rounded-xl transition-colors cursor-pointer ${
                isMuted || volume === 0
                  ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              title={isMuted ? t('unmute') : t('mute')}
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 sm:w-24 h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>
        </div>

        {/* Right Action: Fullscreen */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={isFullscreen ? t('exitFullscreen') : t('fullscreen')}
          >
            {isFullscreen ? <Minimize className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </div>

    </div>
  );
}

