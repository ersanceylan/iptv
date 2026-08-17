/**
 * Theme Manager for StreamPulse IPTV V2
 * Supports 'system', 'dark', 'light'.
 * Follows system preference by default, and updates HTML class.
 */

const THEME_KEY = 'streampulse_theme_preference';

export function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) || 'system';
}

export function applyTheme(theme) {
  const root = document.documentElement;
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  let isDark = false;
  if (theme === 'dark') {
    isDark = true;
  } else if (theme === 'light') {
    isDark = false;
  } else {
    // system
    isDark = systemPrefersDark;
  }

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  return isDark;
}

export function setThemePreference(theme) {
  if (theme === 'system') {
    localStorage.removeItem(THEME_KEY);
  } else {
    localStorage.setItem(THEME_KEY, theme);
  }
  return applyTheme(theme);
}

export function initTheme() {
  const currentTheme = getStoredTheme();
  applyTheme(currentTheme);

  // Listen for system theme changes if using system preference
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const listener = (e) => {
    if (getStoredTheme() === 'system') {
      applyTheme('system');
    }
  };

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', listener);
  } else if (mediaQuery.addListener) {
    mediaQuery.addListener(listener);
  }
}
