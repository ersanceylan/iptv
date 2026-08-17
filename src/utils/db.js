/**
 * IndexedDB helper for StreamPulse IPTV V2
 * Safely stores massive playlists, watch history and user favorites in client browser.
 */

const DB_NAME = 'StreamPulseIPTV_V2_DB';
const DB_VERSION = 2;
const STORE_CHANNELS = 'channels';
const STORE_HISTORY = 'history';

export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_CHANNELS)) {
        db.createObjectStore(STORE_CHANNELS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_HISTORY)) {
        db.createObjectStore(STORE_HISTORY, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e);
  });
}

/**
 * Save channel array to IndexedDB
 */
export async function saveChannelsToDB(channels) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_CHANNELS, 'readwrite');
    const store = tx.objectStore(STORE_CHANNELS);
    
    await new Promise((res, rej) => {
      const clearReq = store.clear();
      clearReq.onsuccess = res;
      clearReq.onerror = rej;
    });

    for (let i = 0; i < channels.length; i++) {
      store.put(channels[i]);
    }

    return new Promise((res, rej) => {
      tx.oncomplete = () => res(true);
      tx.onerror = (e) => rej(e);
    });
  } catch (err) {
    console.error('IndexedDB save failed:', err);
    return false;
  }
}

/**
 * Load all channels from IndexedDB
 */
export async function loadChannelsFromDB() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_CHANNELS, 'readonly');
    const store = tx.objectStore(STORE_CHANNELS);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = (e) => reject(e);
    });
  } catch (err) {
    console.error('IndexedDB load failed:', err);
    return [];
  }
}

/**
 * Record a channel play event in history
 */
export async function recordHistory(channel) {
  if (!channel || !channel.id) return;
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_HISTORY, 'readwrite');
    const store = tx.objectStore(STORE_HISTORY);

    const getReq = store.get(channel.id);
    getReq.onsuccess = () => {
      const existing = getReq.result;
      const watchCount = (existing ? existing.watchCount : 0) + 1;
      const historyItem = {
        id: channel.id,
        name: channel.name,
        logo: channel.logo,
        tag: channel.tag,
        mainCategory: channel.mainCategory,
        seriesInfo: channel.seriesInfo || null,
        url: channel.url,
        lastPlayed: Date.now(),
        watchCount
      };
      store.put(historyItem);
    };
  } catch (e) {
    console.warn('History recording error:', e);
  }
}

/**
 * Load watch history ordered by most watched or recently watched
 */
export async function loadHistory() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_HISTORY, 'readonly');
    const store = tx.objectStore(STORE_HISTORY);
    const req = store.getAll();

    return new Promise((resolve) => {
      req.onsuccess = () => {
        const items = req.result || [];
        // Sort by watchCount desc, then lastPlayed desc
        items.sort((a, b) => (b.watchCount - a.watchCount) || (b.lastPlayed - a.lastPlayed));
        resolve(items);
      };
      req.onerror = () => resolve([]);
    });
  } catch (e) {
    return [];
  }
}

/**
 * Clear all playlist data and history
 */
export async function clearAllData() {
  try {
    const db = await openDB();
    const tx = db.transaction([STORE_CHANNELS, STORE_HISTORY], 'readwrite');
    tx.objectStore(STORE_CHANNELS).clear();
    tx.objectStore(STORE_HISTORY).clear();
    return new Promise((res) => {
      tx.oncomplete = () => res(true);
      tx.onerror = () => res(false);
    });
  } catch (e) {
    return false;
  }
}
