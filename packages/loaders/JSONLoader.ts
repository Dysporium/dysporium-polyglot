import type { Locale, LocaleTranslations, JSONLoaderConfig } from '../types';
import { BaseLoader } from './Loader';

export class JSONLoader extends BaseLoader {
  readonly name = 'json';
  private translations: Map<Locale, LocaleTranslations> = new Map();
  private pathPattern: string | null = null;
  private customResolver: ((locale: Locale) => Promise<LocaleTranslations>) | null = null;

  constructor(config?: JSONLoaderConfig) {
    super();
    if (config?.path) {
      this.pathPattern = config.path;
    }
    if (config?.resolver) {
      this.customResolver = config.resolver;
    }
  }

  async load(locale: Locale): Promise<LocaleTranslations> {
    if (this.translations.has(locale)) {
      return this.translations.get(locale)!;
    }
    if (this.customResolver) {
      return this.customResolver(locale);
    }
    if (this.pathPattern) {
      const path = this.pathPattern.replace('{locale}', locale);
      return this.fetchFromPath(path);
    }
    throw new Error(`No translations found for locale: ${locale}`);
  }

  addTranslations(locale: Locale, translations: LocaleTranslations): void {
    this.translations.set(locale, translations);
  }

  addMultipleTranslations(translations: Record<Locale, LocaleTranslations>): void {
    for (const [locale, localeTranslations] of Object.entries(translations)) {
      this.translations.set(locale, localeTranslations);
    }
  }

  supports(locale: Locale): boolean {
    return this.translations.has(locale) || !!this.pathPattern || !!this.customResolver;
  }

  private async fetchFromPath(path: string): Promise<LocaleTranslations> {
    if (typeof window !== 'undefined') {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load translations from ${path}: ${response.statusText}`);
      }
      return response.json();
    }
    throw new Error('File system loading not supported. Use a custom resolver for Node.js.');
  }
}

export function createJSONLoader(
  translations: Record<Locale, LocaleTranslations>
): JSONLoader {
  const loader = new JSONLoader();
  loader.addMultipleTranslations(translations);
  return loader;
}
