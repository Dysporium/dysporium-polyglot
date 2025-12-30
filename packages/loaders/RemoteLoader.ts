
import type { Locale, LocaleTranslations, RemoteLoaderConfig } from '../types';
import { BaseLoader } from './Loader';

const DEFAULT_CONFIG: Required<Omit<RemoteLoaderConfig, 'fetch'>> & { fetch: typeof fetch | null } = {
  baseUrl: '',
  pattern: '{locale}.json',
  headers: {},
  timeout: 10000,
  fetch: null,
};

export class RemoteLoader extends BaseLoader {
  readonly name = 'remote';
  private config: Required<Omit<RemoteLoaderConfig, 'fetch'>> & { fetch: typeof fetch | null };
  private supportedLocales: Set<Locale> = new Set();

  constructor(config: RemoteLoaderConfig) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async load(locale: Locale): Promise<LocaleTranslations> {
    const url = this.buildUrl(locale);
    const fetchFn = this.config.fetch ?? fetch;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetchFn(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...this.config.headers,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const translations = await response.json();
      return translations as LocaleTranslations;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout loading translations for locale: ${locale}`);
      }
      throw new Error(`Failed to load translations for locale "${locale}": ${error}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  setSupportedLocales(locales: Locale[]): void {
    this.supportedLocales = new Set(locales);
  }

  supports(locale: Locale): boolean {
    if (this.supportedLocales.size === 0) {
      return true;
    }
    return this.supportedLocales.has(locale);
  }

  setConfig(config: Partial<RemoteLoaderConfig>): void {
    Object.assign(this.config, config);
  }

  private buildUrl(locale: Locale): string {
    const path = this.config.pattern.replace('{locale}', locale);
    const baseUrl = this.config.baseUrl.endsWith('/')
      ? this.config.baseUrl.slice(0, -1)
      : this.config.baseUrl;
    
    return `${baseUrl}/${path}`;
  }
}

export function createRemoteLoader(baseUrl: string, options?: Partial<RemoteLoaderConfig>): RemoteLoader {
  return new RemoteLoader({
    baseUrl,
    ...options,
  });
}

