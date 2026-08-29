import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { localStorageUtil } from '@/utils/localStorage.util';

export type Language = 'en' | 'rw' | 'fr';

type Messages = Record<string, string>;

export type I18nContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const STORAGE_KEY = 'language';

const isLanguage = (value: unknown): value is Language =>
  value === 'en' || value === 'rw' || value === 'fr';

const getBrowserLanguage = (): Language => {
  const raw = (navigator.language || 'en').toLowerCase();
  if (raw.startsWith('fr')) return 'fr';
  if (raw.startsWith('rw')) return 'rw';
  return 'en';
};

const interpolate = (template: string, vars?: Record<string, string | number>) => {
  if (!vars) return template;
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
    template
  );
};

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider = ({
  children,
  messages,
}: {
  children: React.ReactNode;
  messages: Record<Language, Messages>;
}) => {
  const stored = localStorageUtil.getItem(STORAGE_KEY);
  const initialLanguage: Language = isLanguage(stored) ? stored : getBrowserLanguage();
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorageUtil.setItem(STORAGE_KEY, lang);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const msg =
        messages?.[language]?.[key] ??
        messages?.en?.[key] ??
        key;
      return interpolate(msg, vars);
    },
    [language, messages]
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useI18n = (): I18nContextValue => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
};
