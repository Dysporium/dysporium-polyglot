export type Locale = string;
export type TranslationKey = string;
export type TranslationValue = string | TranslationRecord;
export interface TranslationRecord {
  [key: string]: TranslationValue;
}
export interface LocaleTranslations {
  [key: string]: TranslationValue;
}
export interface TranslationsMap {
  [locale: Locale]: LocaleTranslations;
}
export interface PolyglotConfig {
  defaultLocale: Locale;
  currentLocale?: Locale;
  supportedLocales?: Locale[];
  translations?: TranslationsMap;
  detectLocale?: boolean;
  fallbackLocales?: Locale[];
  debug?: boolean;
  onMissingTranslation?: MissingTranslationHandler;
  interpolation?: InterpolationConfig;
  pluralization?: PluralizationConfig;
}
export interface InterpolationConfig {
  prefix?: string;
  suffix?: string;
  escapeHtml?: boolean;
}
export interface PluralizationConfig {
  rules?: Record<Locale, PluralRule>;
}
export type MissingTranslationHandler = (
  key: TranslationKey,
  locale: Locale,
  options?: TranslateOptions
) => string;
export type PluralRule = (count: number) => number;
export interface TranslateOptions {
  values?: Record<string, string | number>;
  count?: number;
  locale?: Locale;
  defaultValue?: string;
  context?: string;
}
export interface TranslationLoader {
  readonly name: string;
  load(locale: Locale): Promise<LocaleTranslations>;
  supports?(locale: Locale): boolean;
}
export interface RemoteLoaderConfig {
  baseUrl: string;
  pattern?: string;
  headers?: Record<string, string>;
  timeout?: number;
  fetch?: typeof fetch;
}
export interface JSONLoaderConfig {
  path: string;
  resolver?: (locale: Locale) => Promise<LocaleTranslations>;
}
export type PolyglotEvent = 
  | 'localeChanged'
  | 'translationsLoaded'
  | 'translationMissing'
  | 'error';
export interface LocaleChangedEvent {
  previousLocale: Locale;
  newLocale: Locale;
}
export interface TranslationsLoadedEvent {
  locale: Locale;
  count: number;
}
export interface TranslationMissingEvent {
  key: TranslationKey;
  locale: Locale;
}
export interface ErrorEvent {
  error: Error;
  context?: string;
}
export type EventListener<T = unknown> = (payload: T) => void;
export interface DOMTranslatorConfig {
  attribute?: string;
  countAttribute?: string;
  valuesAttribute?: string;
  root?: Element | null;
  observe?: boolean;
}
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${K}` | `${K}.${NestedKeyOf<T[K]>}`
        : `${K}`;
    }[keyof T & string]
  : never;
