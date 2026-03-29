
import bn from './bn';
import en from './en';
import type { AppLocale } from '@/types/common';

const messages = {
    en,
    bn,
};

export function translate(locale: AppLocale, path: string, params: Record<string, string | number> = {}): string {
    const keys = path.split('.');
    let current: unknown = messages[locale];

    for (const key of keys) {
        if (typeof current !== 'object' || current === null || !(key in current)) {
            return path;
        }
        current = (current as Record<string, unknown>)[key];
    }

    if (typeof current !== 'string') {
        return path;
    }

    return current.replace(/\{(\w+)\}/g, (_, token: string) => String(params[token] ?? `{${token}}`));
}
