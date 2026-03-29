import { useAppPreferences } from '@/providers/app-preferences-provider';

export function useLocale() {
    const { locale, changeLocale, t } = useAppPreferences();

    return {
        locale,
        changeLocale,
        t,
    };
}
