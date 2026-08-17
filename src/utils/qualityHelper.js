/**
 * Smart Quality Variant Finder for IPTV Channels
 * Identifies alternate quality streams for the same channel (e.g., FHD, HD, SD, HEVC, 4K)
 */

const QUALITY_REGEX = /\b(fhd|1080p|1080i|hd|720p|sd|480p|360p|4k|uhd|hevc|h265|h\.265|raw|50fps|60fps)\b|\[(fhd|hd|sd|hevc|4k)\]|\((fhd|hd|sd|hevc|4k)\)/gi;

export function normalizeChannelName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(QUALITY_REGEX, '')
    .replace(/[\[\]\(\)\-\:\_\*]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractQualityLabel(name) {
  if (!name) return 'Standart';
  const lower = name.toLowerCase();

  if (lower.includes('4k') || lower.includes('uhd')) return '4K Ultra HD';
  if (lower.includes('fhd') || lower.includes('1080p')) return '1080p Full HD';
  if (lower.includes('720p') || lower.includes('hd')) return '720p HD';
  if (lower.includes('480p') || lower.includes('sd')) return '480p SD (Düşük Kota)';
  if (lower.includes('360p')) return '360p Düşük Çözünürlük';
  if (lower.includes('hevc') || lower.includes('h265') || lower.includes('h.265')) return 'HEVC (Yüksek Sıkıştırma)';
  
  return 'Standart Yayın';
}

export function findChannelQualityVariants(currentChannel, allChannels = []) {
  if (!currentChannel || !allChannels || allChannels.length === 0) {
    return [];
  }

  const currentNorm = normalizeChannelName(currentChannel.name);
  if (!currentNorm || currentNorm.length < 2) return [];

  const variants = [];

  for (let i = 0; i < allChannels.length; i++) {
    const ch = allChannels[i];
    if (ch.mainCategory === currentChannel.mainCategory) {
      const chNorm = normalizeChannelName(ch.name);
      if (chNorm === currentNorm) {
        variants.push({
          channel: ch,
          isCurrent: ch.id === currentChannel.id,
          qualityLabel: extractQualityLabel(ch.name),
          fullName: ch.name
        });
      }
    }
  }

  // If only 1 found (the current channel itself), return empty variants list
  if (variants.length <= 1) {
    return [];
  }

  // Sort: 4K -> FHD -> HD -> SD -> HEVC -> others
  const order = {
    '4K Ultra HD': 1,
    '1080p Full HD': 2,
    '720p HD': 3,
    '480p SD (Düşük Kota)': 4,
    '360p Düşük Çözünürlük': 5,
    'HEVC (Yüksek Sıkıştırma)': 6,
    'Standart Yayın': 7
  };

  variants.sort((a, b) => (order[a.qualityLabel] || 99) - (order[b.qualityLabel] || 99));

  return variants;
}
