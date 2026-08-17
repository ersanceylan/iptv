/**
 * StreamPulse IPTV V2 - High Performance M3U / M3U8 Parser & Smart Categorizer
 * Accurately classifies into 'series', 'movie', 'live' and extracts publisher labels and season/episode info.
 */

function getAttributeValue(line, attrName) {
  const key = attrName + '="';
  const startIndex = line.indexOf(key);
  if (startIndex === -1) return '';
  const valStart = startIndex + key.length;
  const valEnd = line.indexOf('"', valStart);
  if (valEnd === -1) return '';
  return line.substring(valStart, valEnd);
}

// Regex patterns for detecting Series Season and Episode
const SXX_EXX_REGEX = /(?:^|[^\w])S(\d{1,3})\s*[-_]?\s*E(\d{1,4})(?:[^\w]|$)/i;
const SEZON_BOLUM_REGEX = /(?:^|[^\w])(\d{1,3})\.\s*Sezon\s*(\d{1,4})\.\s*B[oö]l[uü]m(?:[^\w]|$)/i;
const SEZON_ALT_REGEX = /Sezon\s*(\d{1,3})\s*B[oö]l[uü]m\s*(\d{1,4})/i;
const SEASON_EPISODE_EN_REGEX = /Season\s*(\d{1,3})\s*Episode\s*(\d{1,4})/i;
const SXE_SHORT_REGEX = /(?:^|[^\w])(\d{1,3})x(\d{1,4})(?:[^\w]|$)/i;

/**
 * Classifies an item into 'series', 'movie', or 'live'
 * and extracts series metadata.
 */
export function classifyChannel(name, groupTitle = '', url = '') {
  const lowerName = (name || '').toLowerCase();
  const lowerGroup = (groupTitle || '').toLowerCase();
  const lowerUrl = (url || '').toLowerCase();

  // 1. Check for Series (S01E01, Sezon, Bölüm, /series/ in url)
  let seriesMatch = null;
  let season = 1;
  let episode = 1;
  let cleanSeriesTitle = name;

  if (SXX_EXX_REGEX.test(name)) {
    seriesMatch = name.match(SXX_EXX_REGEX);
    season = parseInt(seriesMatch[1], 10);
    episode = parseInt(seriesMatch[2], 10);
    cleanSeriesTitle = name.replace(SXX_EXX_REGEX, '').trim();
  } else if (SEZON_BOLUM_REGEX.test(name)) {
    seriesMatch = name.match(SEZON_BOLUM_REGEX);
    season = parseInt(seriesMatch[1], 10);
    episode = parseInt(seriesMatch[2], 10);
    cleanSeriesTitle = name.replace(SEZON_BOLUM_REGEX, '').trim();
  } else if (SEZON_ALT_REGEX.test(name)) {
    seriesMatch = name.match(SEZON_ALT_REGEX);
    season = parseInt(seriesMatch[1], 10);
    episode = parseInt(seriesMatch[2], 10);
    cleanSeriesTitle = name.replace(SEZON_ALT_REGEX, '').trim();
  } else if (SEASON_EPISODE_EN_REGEX.test(name)) {
    seriesMatch = name.match(SEASON_EPISODE_EN_REGEX);
    season = parseInt(seriesMatch[1], 10);
    episode = parseInt(seriesMatch[2], 10);
    cleanSeriesTitle = name.replace(SEASON_EPISODE_EN_REGEX, '').trim();
  } else if (SXE_SHORT_REGEX.test(name)) {
    seriesMatch = name.match(SXE_SHORT_REGEX);
    season = parseInt(seriesMatch[1], 10);
    episode = parseInt(seriesMatch[2], 10);
    cleanSeriesTitle = name.replace(SXE_SHORT_REGEX, '').trim();
  }

  // Clean series title artifacts like trailing '-', ':', '[]', '()'
  cleanSeriesTitle = cleanSeriesTitle
    .replace(/^\[.*?\]\s*/, '')
    .replace(/\s*-\s*$/, '')
    .replace(/\s*:\s*$/, '')
    .replace(/\s*\|\s*$/, '')
    .trim();

  const isSeriesGroup = lowerGroup.includes('dizi') || 
                        lowerGroup.includes('series') || 
                        lowerGroup.includes('seri') ||
                        lowerGroup.includes('tv shows') ||
                        lowerUrl.includes('/series/');

  if (seriesMatch || (isSeriesGroup && (lowerName.includes('bölüm') || lowerName.includes('episode') || lowerName.includes('sezon')))) {
    return {
      mainCategory: 'series',
      seriesInfo: {
        seriesTitle: cleanSeriesTitle || name,
        season: isNaN(season) ? 1 : season,
        episode: isNaN(episode) ? 1 : episode
      }
    };
  }

  // 2. Check for Movies (VOD, Film, Movie, Sinema, /movie/ in url)
  const isMovieGroup = lowerGroup.includes('film') ||
                       lowerGroup.includes('movie') ||
                       lowerGroup.includes('vod') ||
                       lowerGroup.includes('sinema') ||
                       lowerGroup.includes('cinema') ||
                       lowerGroup.includes('4k film') ||
                       lowerGroup.includes('1080p film') ||
                       lowerGroup.includes('yerli film') ||
                       lowerGroup.includes('yabanci film') ||
                       lowerGroup.includes('netflix film') ||
                       lowerGroup.includes('disney+') ||
                       lowerGroup.includes('exxen') ||
                       lowerUrl.includes('/movie/');

  const hasYearInTitle = /\((19|20)\d{2}\)/.test(name) || /\[(19|20)\d{2}\]/.test(name);

  if (isMovieGroup || (hasYearInTitle && !lowerGroup.includes('tv') && !lowerGroup.includes('spor') && !lowerGroup.includes('canli'))) {
    return {
      mainCategory: 'movie',
      seriesInfo: null
    };
  }

  // 3. Default: Live TV
  return {
    mainCategory: 'live',
    seriesInfo: null
  };
}

/**
 * Fast Parser for M3U playlist contents
 */
export function parseM3UFast(content) {
  if (!content || typeof content !== 'string') return [];

  const lines = content.split(/\r?\n/);
  const channels = [];
  let currentMeta = null;
  const count = lines.length;

  for (let i = 0; i < count; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      const logo = getAttributeValue(line, 'tvg-logo');
      let groupTitle = getAttributeValue(line, 'group-title');
      if (!groupTitle) groupTitle = 'Genel';

      const xuiId = getAttributeValue(line, 'xui-id');
      const tvgId = getAttributeValue(line, 'tvg-id');

      let name = 'Bilinmeyen Kanal';
      const commaIndex = line.lastIndexOf(',');
      if (commaIndex !== -1) {
        name = line.substring(commaIndex + 1).trim();
      }

      currentMeta = {
        name,
        rawName: name,
        logo: logo || '',
        tag: groupTitle, // Publisher categorization shown as label/tag
        category: groupTitle, // Keep legacy compatibility
        xuiId: xuiId || tvgId
      };
    } else if (!line.startsWith('#') && currentMeta) {
      currentMeta.url = line;
      currentMeta.id = `ch-${channels.length + 1}-${Math.random().toString(36).substring(2, 9)}`;

      // Classify
      const classification = classifyChannel(currentMeta.name, currentMeta.tag, currentMeta.url);
      currentMeta.mainCategory = classification.mainCategory;
      currentMeta.seriesInfo = classification.seriesInfo;

      channels.push(currentMeta);
      currentMeta = null;
    }
  }

  return channels;
}
