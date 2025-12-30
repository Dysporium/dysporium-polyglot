
import type { Locale, LocaleTranslations, TranslationLoader } from '../types';
export abstract class BaseLoader implements TranslationLoader {
  abstract readonly name: string;
  
  abstract load(locale: Locale): Promise<LocaleTranslations>;
  
  supports(_locale: Locale): boolean {
    return true;
  }
} 
export class CompositeLoader implements TranslationLoader {
  readonly name = 'composite';
  private loaders: TranslationLoader[];

  constructor(loaders: TranslationLoader[]) {
    this.loaders = loaders;
  }

  async load(locale: Locale): Promise<LocaleTranslations> {
    for (const loader of this.loaders) {
      if (loader.supports?.(locale) !== false) {
        try {
          const translations = await loader.load(locale);
          if (translations && Object.keys(translations).length > 0) {
            return translations;
          }
        } catch {
          continue;
        }
      }
    }
    
    throw new Error(`No loader could load translations for locale: ${locale}`);
  }

  supports(locale: Locale): boolean {
    return this.loaders.some((loader) => loader.supports?.(locale) !== false);
  }

  addLoader(loader: TranslationLoader): void {
    this.loaders.push(loader);
  }

  removeLoader(name: string): boolean {
    const index = this.loaders.findIndex((l) => l.name === name);
    if (index !== -1) {
      this.loaders.splice(index, 1);
      return true;
    }
    return false;
  }
}

export class CachedLoader implements TranslationLoader {
  readonly name: string;
  private loader: TranslationLoader;
  private cache: Map<Locale, LocaleTranslations> = new Map();
  private ttl: number;
  private timestamps: Map<Locale, number> = new Map();

  constructor(loader: TranslationLoader, ttlMs = 5 * 60 * 1000) {
    this.name = `cached-${loader.name}`;
    this.loader = loader;
    this.ttl = ttlMs;
  }

  async load(locale: Locale): Promise<LocaleTranslations> {
    const now = Date.now();
    const timestamp = this.timestamps.get(locale);
    
    if (timestamp && now - timestamp < this.ttl && this.cache.has(locale)) {
      return this.cache.get(locale)!;
    }

    const translations = await this.loader.load(locale);
    this.cache.set(locale, translations);
    this.timestamps.set(locale, now);
    
    return translations;
  }

  supports(locale: Locale): boolean {
    return this.loader.supports?.(locale) !== false;
  }

  clearCache(locale?: Locale): void {
    if (locale) {
      this.cache.delete(locale);
      this.timestamps.delete(locale);
    } else {
      this.cache.clear();
      this.timestamps.clear();
    }
  }

  async preload(locales: Locale[]): Promise<void> {
    await Promise.all(locales.map((locale) => this.load(locale)));
  }
}

