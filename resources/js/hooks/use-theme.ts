import { useAppPreferences } from '@/providers/app-preferences-provider';

export function useTheme() {
    const { theme, toggleTheme, setTheme } = useAppPreferences();

    return {
        theme,
        toggleTheme,
        setTheme,
    };
}
