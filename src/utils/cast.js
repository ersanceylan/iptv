/**
 * Robust HLS URL converter & Google Cast Framework Utility for VOD Series and Live Streams
 */

export function getHlsUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;
  let converted = rawUrl.trim();

  // Progressive direct video files - leave unchanged
  const lower = converted.toLowerCase();
  if (lower.endsWith('.mp4') || lower.endsWith('.mkv') || lower.endsWith('.webm') || lower.endsWith('.avi') || lower.endsWith('.ogg')) {
    return rawUrl;
  }

  // Rule 1: Replace output=mpegts or output=ts parameter with output=hls
  if (converted.includes('output=mpegts')) {
    converted = converted.replace('output=mpegts', 'output=hls');
  } else if (converted.includes('output=ts')) {
    converted = converted.replace('output=ts', 'output=m3u8');
  }

  // Rule 2: If URL contains .ts? or ends in .ts, change extension to .m3u8
  if (converted.includes('.ts?')) {
    converted = converted.replace('.ts?', '.m3u8?');
  } else if (converted.endsWith('.ts')) {
    converted = converted.slice(0, -3) + '.m3u8';
  } 
  // Rule 3: For /play/ or /live/ Xtream Codes links without extension
  else if (!converted.includes('.m3u8')) {
    if (converted.includes('?')) {
      const [base, query] = converted.split('?');
      if (!base.endsWith('.m3u8')) {
        converted = `${base}.m3u8?${query}`;
      }
    } else {
      converted = `${converted}.m3u8`;
    }
  }

  return converted;
}

// Alias for backwards compatibility
export const getHlsUrlForChromecast = getHlsUrl;

export function setupCastListeners(onStateChange) {
  const checkInterval = setInterval(() => {
    if (window.cast && window.cast.framework) {
      try {
        const instance = window.cast.framework.CastContext.getInstance();
        
        // Listen for session state changes
        instance.addEventListener(
          window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
          (event) => {
            const SessionState = window.cast.framework.SessionState;
            const isCasting =
              event.sessionState === SessionState.SESSION_STARTED ||
              event.sessionState === SessionState.SESSION_RESUMED;
            
            if (onStateChange) onStateChange(isCasting);
          }
        );

        const currentSession = instance.getCurrentSession();
        if (currentSession && onStateChange) {
          onStateChange(true);
        }

        clearInterval(checkInterval);
      } catch (e) {
        // Retry until loaded
      }
    }
  }, 300);

  setTimeout(() => clearInterval(checkInterval), 10000); // 10s stop check
}

export function triggerCastPrompt() {
  if (window.cast && window.cast.framework) {
    try {
      const instance = window.cast.framework.CastContext.getInstance();
      return instance.requestSession();
    } catch (e) {
      console.error('Request session error:', e);
      return Promise.reject(e);
    }
  }
  return Promise.reject(new Error('Google Cast SDK henüz yüklenmedi veya tarayıcınız (Chrome/Edge) Chromecast desteklemiyor.'));
}

export function castChannelMedia(channel) {
  if (!channel || !channel.url) return Promise.resolve(false);

  if (window.cast && window.cast.framework && window.chrome && window.chrome.cast) {
    try {
      const castSession = window.cast.framework.CastContext.getInstance().getCurrentSession();
      if (!castSession) return Promise.resolve(false);

      const rawUrl = channel.url;
      const lowerUrl = rawUrl.toLowerCase();

      // Check if progressive video file (VOD Series/Movie) vs Live TV Stream
      const isVodFile = lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.mkv') || lowerUrl.endsWith('.webm') || lowerUrl.endsWith('.avi');

      // Generate Chromecast-compatible HLS URL for Live TV streams (.ts -> .m3u8)
      const castMediaUrl = isVodFile ? rawUrl : getHlsUrlForChromecast(rawUrl);

      // Chromecast Default Receiver MediaInfo configuration
      const contentType = isVodFile ? 'video/mp4' : 'application/x-mpegurl';
      const streamType = isVodFile 
        ? window.chrome.cast.media.StreamType.BUFFERED 
        : window.chrome.cast.media.StreamType.LIVE;

      console.log(`[Cast] Transmitting stream to Chromecast:`, { castMediaUrl, contentType, streamType });

      const mediaInfo = new window.chrome.cast.media.MediaInfo(castMediaUrl, contentType);
      mediaInfo.streamType = streamType;
      mediaInfo.metadata = new window.chrome.cast.media.GenericMediaMetadata();
      mediaInfo.metadata.title = channel.name || 'IPTV Canlı Yayın';
      mediaInfo.metadata.subtitle = `${channel.category || 'Canlı TV'} • IPTV Player`;

      if (channel.logo) {
        mediaInfo.metadata.images = [{ url: channel.logo }];
      }

      const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
      request.autoplay = true;

      return castSession.loadMedia(request);
    } catch (e) {
      console.error('Cast loadMedia exception:', e);
    }
  }
  return Promise.resolve(false);
}

export function endCastSession() {
  if (window.cast && window.cast.framework) {
    try {
      const castSession = window.cast.framework.CastContext.getInstance().getCurrentSession();
      if (castSession) {
        castSession.endSession(true);
      }
    } catch (e) {
      console.error('End session error:', e);
    }
  }
}
