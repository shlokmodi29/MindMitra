/**
 * MindMitra - Centralized Internationalization (i18n) Service
 * Supports English, Hindi (हिन्दी), Assamese (অসমীয়া), and Bengali (বাংলা).
 */

import { en } from '../locales/en.js';
import { hi } from '../locales/hi.js';
import { as } from '../locales/as.js';
import { bn } from '../locales/bn.js';

const STORAGE_KEY = 'mindmitra_selected_language';

const AVAILABLE_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', dir: 'ltr', voiceLang: 'en-IN' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', dir: 'ltr', voiceLang: 'hi-IN' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া', dir: 'ltr', voiceLang: 'as-IN' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', dir: 'ltr', voiceLang: 'bn-IN' },
];

const DICTIONARIES = {
  en,
  hi,
  as,
  bn,
};

class I18nService {
  constructor() {
    this.currentLanguage = this.loadPersistedLanguage();
    this.subscribers = new Set();
  }

  /**
   * Load persisted language from localStorage or fallback to English
   */
  loadPersistedLanguage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored && DICTIONARIES[stored]) {
          return stored;
        }
      }
    } catch (_) {}
    return 'en';
  }

  /**
   * Return the current language code ('en' | 'hi' | 'as' | 'bn')
   */
  getLanguage() {
    return this.currentLanguage;
  }

  /**
   * Get metadata for the currently active language
   */
  getCurrentLanguageMeta() {
    return (
      AVAILABLE_LANGUAGES.find((l) => l.code === this.currentLanguage) ||
      AVAILABLE_LANGUAGES[0]
    );
  }

  /**
   * Set new language and notify listeners
   */
  setLanguage(languageCode) {
    if (!DICTIONARIES[languageCode]) {
      console.warn(`[i18n] Unsupported language "${languageCode}", ignoring.`);
      return false;
    }

    if (this.currentLanguage === languageCode) {
      return true;
    }

    this.currentLanguage = languageCode;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, languageCode);
      }
    } catch (_) {}

    this.notifySubscribers();
    return true;
  }

  /**
   * Cycle to the next available language (en -> hi -> as -> bn -> en)
   */
  cycleLanguage() {
    const currentIndex = AVAILABLE_LANGUAGES.findIndex(
      (l) => l.code === this.currentLanguage
    );
    const nextIndex = (currentIndex + 1) % AVAILABLE_LANGUAGES.length;
    const nextCode = AVAILABLE_LANGUAGES[nextIndex].code;
    this.setLanguage(nextCode);
    return nextCode;
  }

  /**
   * Get list of supported languages
   */
  getAvailableLanguages() {
    return [...AVAILABLE_LANGUAGES];
  }

  /**
   * Look up translation string by dot-separated key with strict fallback chain:
   * currentLang -> en -> humanized key (never undefined or raw key)
   */
  t(key, params = {}) {
    if (!key || typeof key !== 'string') return '';

    const path = key.split('.');
    let value = this.resolvePath(DICTIONARIES[this.currentLanguage], path);

    // Fallback to English if not found in current language
    if (value === undefined && this.currentLanguage !== 'en') {
      value = this.resolvePath(DICTIONARIES['en'], path);
    }

    // Never return raw technical key like "home.greeting" or undefined
    if (value === undefined || typeof value !== 'string') {
      const fallbackPart = path[path.length - 1];
      // Convert camelCase to human readable space-separated words
      return fallbackPart.replace(/([A-Z])/g, ' $1').toLowerCase();
    }

    // Replace interpolations e.g. {name}
    if (params && typeof params === 'object') {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match;
      });
    }

    return value;
  }

  /**
   * Helper to traverse nested dictionary objects
   */
  resolvePath(dict, path) {
    if (!dict) return undefined;
    let curr = dict;
    for (const segment of path) {
      if (curr && typeof curr === 'object' && segment in curr) {
        curr = curr[segment];
      } else {
        return undefined;
      }
    }
    return curr;
  }

  /**
   * Subscribe to language change events
   */
  subscribe(callback) {
    if (typeof callback === 'function') {
      this.subscribers.add(callback);
      return () => this.subscribers.delete(callback);
    }
    return () => {};
  }

  /**
   * Notify all registered subscribers
   */
  notifySubscribers() {
    const meta = this.getCurrentLanguageMeta();
    for (const fn of this.subscribers) {
      try {
        fn(this.currentLanguage, meta);
      } catch (err) {
        console.error('[i18n] Error in language subscriber:', err);
      }
    }
  }
}

export const i18nService = new I18nService();
export default i18nService;
