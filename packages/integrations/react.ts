import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  createElement,
  type ReactNode,
  type FC,
} from 'react';
import type { Translator, TranslationKey, TranslateOptions, Locale } from '../core/src';

interface TranslationContextValue {
  translator: Translator;
  locale: Locale;
  t: (key: TranslationKey, options?: TranslateOptions) => string;
  setLocale: (locale: Locale) => Promise<void>;
}

const TranslationContext = createContext<TranslationContextValue | null>(null);

interface TranslationProviderProps {
  translator: Translator;
  children: ReactNode;
}

export const TranslationProvider: FC<TranslationProviderProps> = ({
  translator,
  children,
}) => {
  const [locale, setLocaleState] = useState(translator.getLocale());

  useEffect(() => {
    const unsubscribe = translator.on('localeChanged', ({ newLocale }) => {
      setLocaleState(newLocale);
    });

    return unsubscribe;
  }, [translator]);

  const t = useCallback(
    (key: TranslationKey, options?: TranslateOptions) => {
      return translator.t(key, options);
    },
    [translator, locale]
  );

  const setLocale = useCallback(
    async (newLocale: Locale) => {
      await translator.setLocale(newLocale);
    },
    [translator]
  );

  const value = useMemo(
    () => ({
      translator,
      locale,
      t,
      setLocale,
    }),
    [translator, locale, t, setLocale]
  );

  return createElement(TranslationContext.Provider, { value }, children);
};

export function useTranslation() {
  const context = useContext(TranslationContext);
  
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  
  return context;
}

export function useT() {
  const { t } = useTranslation();
  return t;
}

export function useLocale(): Locale {
  const { locale } = useTranslation();
  return locale;
}

export function useTranslator(): Translator {
  const { translator } = useTranslation();
  return translator;
}

interface TransProps {
  i18nKey: TranslationKey;
  values?: Record<string, string | number>;
  count?: number;
  defaultValue?: string;
  as?: keyof JSX.IntrinsicElements;
  [key: string]: unknown;
}

export const Trans: FC<TransProps> = ({
  i18nKey,
  values,
  count,
  defaultValue,
  as = 'span',
  ...rest
}) => {
  const { t } = useTranslation();
  
  const translation = t(i18nKey, {
    values,
    count,
    defaultValue,
  });
  
  return createElement(as, rest, translation);
};

interface WithTranslationProps {
  t: (key: TranslationKey, options?: TranslateOptions) => string;
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
}

export function withTranslation<P extends WithTranslationProps>(
  Component: React.ComponentType<P>
): FC<Omit<P, keyof WithTranslationProps>> {
  const WrappedComponent: FC<Omit<P, keyof WithTranslationProps>> = (props) => {
    const translationProps = useTranslation();
    return createElement(Component, {
      ...props,
      ...translationProps,
    } as unknown as P);
  };

  WrappedComponent.displayName = `withTranslation(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}

export function useTranslationsLoading(): boolean {
  const { translator } = useTranslation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribeLoaded = translator.on('translationsLoaded', () => {
      setLoading(false);
    });

    const unsubscribeError = translator.on('error', () => {
      setLoading(false);
    });

    return () => {
      unsubscribeLoaded();
      unsubscribeError();
    };
  }, [translator]);

  return loading;
}

export function useLoadTranslations(locales: Locale[]): {
  loading: boolean;
  error: Error | null;
} {
  const { translator } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        await translator.preloadTranslations(locales);
        if (mounted) {
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [translator, locales.join(',')]);

  return { loading, error };
}

export type {
  TranslationContextValue,
  TranslationProviderProps,
  TransProps,
  WithTranslationProps,
};
