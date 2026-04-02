
import bn from './bn';
import en from './en';
import type { AppLocale } from '@/types/common';

const messages = {
    en,
    bn,
};

const legacyKeyAliases: Record<string, string> = {
    'staffWorkflow.title': 'staff.title',
    'staffWorkflow.subtitle': 'staff.subtitle',
    'staffWorkflow.allStaff': 'staff.allStaff',
    'staffWorkflow.allRoles': 'staff.allRoles',
    'staffWorkflow.totalStaff': 'staff.totalStaff',
    'staffWorkflow.activeStaff': 'staff.activeStaff',
    'staffWorkflow.todayCollections': 'staff.todayCollections',
    'staffWorkflow.monthCollections': 'staff.monthCollections',
};

function resolveMessage(locale: AppLocale, path: string): string | null {
    const keys = path.split('.');
    let current: unknown = messages[locale];

    for (const key of keys) {
        if (typeof current !== 'object' || current === null || !(key in current)) {
            return null;
        }
        current = (current as Record<string, unknown>)[key];
    }

    return typeof current === 'string' ? current : null;
}

function prettifyKey(path: string): string {
    const last = path.split('.').pop() ?? path;

    return last
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .replace(/^./, (char) => char.toUpperCase());
}

export function translate(locale: AppLocale, path: string, params: Record<string, string | number> = {}): string {
    const alias = legacyKeyAliases[path];
    const template = resolveMessage(locale, path)
        ?? (alias ? resolveMessage(locale, alias) : null)
        ?? resolveMessage('en', path)
        ?? (alias ? resolveMessage('en', alias) : null)
        ?? prettifyKey(path);

    return template.replace(/\{(\w+)\}/g, (_, token: string) => String(params[token] ?? `{${token}}`));
}
