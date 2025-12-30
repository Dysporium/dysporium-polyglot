
import type { Formatter } from './Formatter';
import type { TranslateOptions, PluralRule, Locale } from '../types';
const PLURAL_RULES: Record<string, PluralRule> = {
  en: (n) => (n === 1 ? 0 : 1),
  de: (n) => (n === 1 ? 0 : 1),
  es: (n) => (n === 1 ? 0 : 1),
  fr: (n) => (n <= 1 ? 0 : 1),
  it: (n) => (n === 1 ? 0 : 1),
  pt: (n) => (n === 1 ? 0 : 1),
  nl: (n) => (n === 1 ? 0 : 1),
  
  ru: (n) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 0;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 1;
    return 2;
  },
  pl: (n) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (n === 1) return 0;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 1;
    return 2;
  },
  
  cs: (n) => {
    if (n === 1) return 0;
    if (n >= 2 && n <= 4) return 1;
    return 2;
  },
  
  ar: (n) => {
    if (n === 0) return 0;
    if (n === 1) return 1;
    if (n === 2) return 2;
    const mod100 = n % 100;
    if (mod100 >= 3 && mod100 <= 10) return 3;
    if (mod100 >= 11) return 4;
    return 5;
  },
  
  zh: () => 0,
  ja: () => 0,
  ko: () => 0,
  vi: () => 0,
};

const PLURAL_SUFFIXES = ['_zero', '_one', '_two', '_few', '_many', '_other'];

export interface PluralFormatterConfig {
  rules?: Record<Locale, PluralRule>;
  locale?: Locale;
}

export class PluralFormatter implements Formatter {
  readonly name = 'plural';
  private rules: Record<Locale, PluralRule>;
  private locale: Locale;

  constructor(config: PluralFormatterConfig = {}) {
    this.rules = { ...PLURAL_RULES, ...config.rules };
    this.locale = config.locale || 'en';
  }

  format(value: string, options: TranslateOptions): string {
    const { count } = options;
    
    if (count === undefined || count === null) {
      return value;
    }

    const locale = options.locale || this.locale;
    
    if (value.includes('|')) {
      return this.selectPluralForm(value, count, locale);
    }

    return value;
  }

  setLocale(locale: Locale): void {
    this.locale = locale;
  }

  addRule(locale: Locale, rule: PluralRule): void {
    this.rules[locale] = rule;
  }

  getPluralFormIndex(count: number, locale: Locale): number {
    const baseLocale = locale.split('-')[0];
    const rule = this.rules[locale] || this.rules[baseLocale] || this.rules['en'];
    return rule(Math.abs(count));
  }

  getPluralKeySuffix(count: number, locale: Locale): string {
    const index = this.getPluralFormIndex(count, locale);
    return PLURAL_SUFFIXES[Math.min(index, PLURAL_SUFFIXES.length - 1)];
  }

  private selectPluralForm(value: string, count: number, locale: Locale): string {
    const forms = value.split('|').map((s) => s.trim());
    const index = this.getPluralFormIndex(count, locale);
    
    return forms[Math.min(index, forms.length - 1)];
  }
}

export function analyzePluralKey(key: string): { baseKey: string; isPluralKey: boolean } {
  for (const suffix of PLURAL_SUFFIXES) {
    if (key.endsWith(suffix)) {
      return {
        baseKey: key.slice(0, -suffix.length),
        isPluralKey: true,
      };
    }
  }
  return { baseKey: key, isPluralKey: false };
}

export function getPluralKeyVariants(baseKey: string): string[] {
  return PLURAL_SUFFIXES.map((suffix) => `${baseKey}${suffix}`);
}

