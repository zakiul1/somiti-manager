import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { AppLocale, AppTheme } from '@/types/common';
import { translate } from '@/i18n';

type AppPreferencesContextValue = {
    locale: AppLocale;
    theme: AppTheme;
    changeLocale: (nextLocale: AppLocale) => void;
    toggleTheme: () => void;
    setTheme: (nextTheme: AppTheme) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
};

const LOCALE_STORAGE_KEY = 'somiti-locale';
const THEME_STORAGE_KEY = 'somiti-theme';

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null);

function normalizeLocale(value: string | null | undefined, fallback: AppLocale): AppLocale {
    return value === 'bn' || value === 'en' ? value : fallback;
}

function normalizeTheme(value: string | null | undefined, fallback: AppTheme): AppTheme {
    return value === 'dark' || value === 'light' ? value : fallback;
}

export function AppPreferencesProvider({
    children,
    initialLocale = 'en',
    initialTheme = 'light',
}: PropsWithChildren<{ initialLocale?: AppLocale; initialTheme?: AppTheme }>) {
    const [locale, setLocale] = useState<AppLocale>(() => {
        if (typeof window === 'undefined') return initialLocale;
        return normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY), initialLocale);
    });
    const [theme, setThemeState] = useState<AppTheme>(() => {
        if (typeof window === 'undefined') return initialTheme;
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : initialTheme;
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
        document.cookie = `somiti_theme=${theme}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    }, [theme]);

    useEffect(() => {
        document.documentElement.lang = locale;
        document.documentElement.dir = 'ltr';
        window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
        document.cookie = `somiti_locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    }, [locale]);

    useEffect(() => {
        const onStorage = (event: StorageEvent) => {
            if (event.key === LOCALE_STORAGE_KEY) {
                setLocale((current) => normalizeLocale(event.newValue, current));
            }
            if (event.key === THEME_STORAGE_KEY) {
                setThemeState((current) => normalizeTheme(event.newValue, current));
            }
        };

        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const value = useMemo<AppPreferencesContextValue>(() => ({
        locale,
        theme,
        changeLocale: (nextLocale) => setLocale(nextLocale),
        toggleTheme: () => setThemeState((current) => current === 'dark' ? 'light' : 'dark'),
        setTheme: (nextTheme) => setThemeState(nextTheme),
        t: (key, params) => translate(locale, key, params),
    }), [locale, theme]);

    return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>;
}

export function useAppPreferences() {
    const context = useContext(AppPreferencesContext);

    if (! context) {
        throw new Error('useAppPreferences must be used within AppPreferencesProvider');
    }

    return context;
}
