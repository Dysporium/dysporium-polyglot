import type {
  Locale,
  TranslationKey,
  TranslationValue,
  LocaleTranslations,
  TranslationsMap,
} from './types';

export class TranslationStore {
  private translations: TranslationsMap = {};

  constructor(initialTranslations?: TranslationsMap) {
    if (initialTranslations) {
      this.translations = this.deepClone(initialTranslations);
    }
  }

  get(locale: Locale, key: TranslationKey): string | undefined {
    const localeTranslations = this.translations[locale];
    if (!localeTranslations) {
      return undefined;
    }
    return this.resolveNestedKey(localeTranslations, key);
  }

  has(locale: Locale, key: TranslationKey): boolean {
    return this.get(locale, key) !== undefined;
  }

  getLocale(locale: Locale): LocaleTranslations | undefined {
    return this.translations[locale];
  }

  getAvailableLocales(): Locale[] {
    return Object.keys(this.translations);
  }

  setLocale(locale: Locale, translations: LocaleTranslations): void {
    this.translations[locale] = this.deepClone(translations);
  }

  mergeLocale(locale: Locale, translations: LocaleTranslations): void {
    if (!this.translations[locale]) {
      this.translations[locale] = {};
    }
    this.deepMerge(this.translations[locale], translations);
  }

  set(locale: Locale, key: TranslationKey, value: string): void {
    if (!this.translations[locale]) {
      this.translations[locale] = {};
    }
    this.setNestedKey(this.translations[locale], key, value);
  }

  remove(locale: Locale, key: TranslationKey): boolean {
    const localeTranslations = this.translations[locale];
    if (!localeTranslations) {
      return false;
    }
    return this.removeNestedKey(localeTranslations, key);
  }

  removeLocale(locale: Locale): boolean {
    if (this.translations[locale]) {
      delete this.translations[locale];
      return true;
    }
    return false;
  }

  clear(): void {
    this.translations = {};
  }

  count(locale: Locale): number {
    const localeTranslations = this.translations[locale];
    if (!localeTranslations) {
      return 0;
    }
    return this.countKeys(localeTranslations);
  }

  export(): TranslationsMap {
    return this.deepClone(this.translations);
  }

  import(translations: TranslationsMap, merge = false): void {
    if (merge) {
      for (const [locale, localeTranslations] of Object.entries(translations)) {
        this.mergeLocale(locale, localeTranslations);
      }
    } else {
      this.translations = this.deepClone(translations);
    }
  }

  private resolveNestedKey(
    obj: LocaleTranslations,
    key: TranslationKey
  ): string | undefined {
    const keys = key.split('.');
    let current: TranslationValue = obj;
    for (const k of keys) {
      if (current === undefined || current === null || typeof current === 'string') {
        return undefined;
      }
      current = (current as LocaleTranslations)[k];
    }
    return typeof current === 'string' ? current : undefined;
  }

  private setNestedKey(
    obj: LocaleTranslations,
    key: TranslationKey,
    value: string
  ): void {
    const keys = key.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!current[k] || typeof current[k] === 'string') {
        current[k] = {};
      }
      current = current[k] as LocaleTranslations;
    }
    current[keys[keys.length - 1]] = value;
  }

  private removeNestedKey(obj: LocaleTranslations, key: TranslationKey): boolean {
    const keys = key.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!current[k] || typeof current[k] === 'string') {
        return false;
      }
      current = current[k] as LocaleTranslations;
    }
    const lastKey = keys[keys.length - 1];
    if (lastKey in current) {
      delete current[lastKey];
      return true;
    }
    return false;
  }

  private countKeys(obj: LocaleTranslations): number {
    let count = 0;
    for (const value of Object.values(obj)) {
      if (typeof value === 'string') {
        count++;
      } else {
        count += this.countKeys(value);
      }
    }
    return count;
  }

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  private deepMerge(
    target: LocaleTranslations,
    source: LocaleTranslations
  ): void {
    for (const [key, value] of Object.entries(source)) {
      if (
        typeof value === 'object' &&
        value !== null &&
        typeof target[key] === 'object' &&
        target[key] !== null
      ) {
        this.deepMerge(
          target[key] as LocaleTranslations,
          value as LocaleTranslations
        );
      } else {
        target[key] = this.deepClone(value);
      }
    }
  }
}
