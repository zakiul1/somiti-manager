import { Moon, Sun } from 'lucide-react';
import { AppButton } from '@/components/ui/app-button';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/hooks/use-locale';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const { t } = useLocale();

    const isDark = theme === 'dark';

    return (
        <AppButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-md transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-700/90 dark:hover:text-white"
        >
            {isDark ? (
                <Sun size={18} className="shrink-0 text-amber-500 dark:text-amber-300" />
            ) : (
                <Moon size={18} className="shrink-0 text-slate-700 dark:text-slate-200" />
            )}

            <span className="hidden sm:inline">
                {isDark ? t('common.lightMode') : t('common.darkMode')}
            </span>
        </AppButton>
    );
}