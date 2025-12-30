import type { Locale } from './types';

export type DetectionSource = 
  'querystring'
  | 'cookie'
  | 'localStorage'
  | 'sessionStorage'
  | 'navigator'
  | 'htmlTag';

export interface LanguageDetectorConfig {
  order?: DetectionSource[];
  queryParam?: string;
  cookieName?: string;
  localStorageKey?: string;
  sessionStorageKey?: string;
  supportedLocales?: Locale[];
  cacheLocale?: boolean;
  cacheTarget?: 'localStorage' | 'sessionStorage' | 'cookie';
}

const DEFAULT_CONFIG: Required<LanguageDetectorConfig> = {
  order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
  queryParam: 'lang',
  cookieName: 'locale',
  localStorageKey: 'polyglot_locale',
  sessionStorageKey: 'polyglot_locale',
  supportedLocales: [],
  cacheLocale: true,
  cacheTarget: 'localStorage',
};

export class LanguageDetector {
  private config: Required<LanguageDetectorConfig>;
  private cachedLocale: Locale | null = null;

  constructor(config: LanguageDetectorConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  detect(): Locale | null {
    if (this.cachedLocale) {
      return this.cachedLocale;
    }

    for (const source of this.config.order) {
      const locale = this.detectFromSource(source);
      if (locale && this.isSupported(locale)) {
        if (this.config.cacheLocale) {
          this.cacheDetectedLocale(locale);
        }
        this.cachedLocale = locale;
        return locale;
      }
    }

    return null;
  }

  setLocale(locale: Locale): void {
    this.cachedLocale = locale;
    if (this.config.cacheLocale) {
      this.cacheDetectedLocale(locale);
    }
  }

  clearCache(): void {
    this.cachedLocale = null;
    this.clearStoredLocale();
  }

  setSupportedLocales(locales: Locale[]): void {
    this.config.supportedLocales = locales;
  }

  private detectFromSource(source: DetectionSource): Locale | null {
    if (typeof window === 'undefined') {
      return null;
    }

    switch (source) {
      case 'querystring':
        return this.detectFromQueryString();
      case 'cookie':
        return this.detectFromCookie();
      case 'localStorage':
        return this.detectFromLocalStorage();
      case 'sessionStorage':
        return this.detectFromSessionStorage();
      case 'navigator':
        return this.detectFromNavigator();
      case 'htmlTag':
        return this.detectFromHtmlTag();
      default:
        return null;
    }
  }

  private detectFromQueryString(): Locale | null {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get(this.config.queryParam);
    } catch {
      return null;
    }
  }

  private detectFromCookie(): Locale | null {
    try {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === this.config.cookieName) {
          return decodeURIComponent(value);
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  private detectFromLocalStorage(): Locale | null {
    try {
      return localStorage.getItem(this.config.localStorageKey);
    } catch {
      return null;
    }
  }

  private detectFromSessionStorage(): Locale | null {
    try {
      return sessionStorage.getItem(this.config.sessionStorageKey);
    } catch {
      return null;
    }
  }

  private detectFromNavigator(): Locale | null {
    try {
      if (navigator.languages && navigator.languages.length > 0) {
        for (const lang of navigator.languages) {
          const normalized = this.normalizeLocale(lang);
          if (this.isSupported(normalized)) {
            return normalized;
          }
        }
        return this.normalizeLocale(navigator.languages[0]);
      }
      if (navigator.language) {
        return this.normalizeLocale(navigator.language);
      }
      return null;
    } catch {
      return null;
    }
  }

  private detectFromHtmlTag(): Locale | null {
    try {
      const lang = document.documentElement.lang;
      return lang || null;
    } catch {
      return null;
    }
  }

  private cacheDetectedLocale(locale: Locale): void {
    try {
      switch (this.config.cacheTarget) {
        case 'localStorage':
          localStorage.setItem(this.config.localStorageKey, locale);
          break;
        case 'sessionStorage':
          sessionStorage.setItem(this.config.sessionStorageKey, locale);
          break;
        case 'cookie':
          document.cookie = `${this.config.cookieName}=${encodeURIComponent(locale)};path=/;max-age=31536000`;
          break;
      }
    } catch {
    }
  }

  private clearStoredLocale(): void {
    try {
      localStorage.removeItem(this.config.localStorageKey);
      sessionStorage.removeItem(this.config.sessionStorageKey);
      document.cookie = `${this.config.cookieName}=;path=/;max-age=0`;
    } catch {
    }
  }

  private isSupported(locale: Locale): boolean {
    if (this.config.supportedLocales.length === 0) {
      return true;
    }
    if (this.config.supportedLocales.includes(locale)) {
      return true;
    }
    const baseLang = locale.split('-')[0];
    return this.config.supportedLocales.some(
      (supported) => supported === baseLang || supported.split('-')[0] === baseLang
    );
  }

  private normalizeLocale(locale: string): Locale {
    return locale.toLowerCase().replace('_', '-');
  }
}
