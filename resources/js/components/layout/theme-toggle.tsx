import { Moon, Sun } from 'lucide-react';
import { AppButton } from '@/components/ui/app-button';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/hooks/use-locale';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const { t } = useLocale();

    return (
        <AppButton variant="ghost" size="sm" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span className="hidden sm:inline">
                {theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
            </span>
        </AppButton>
    );
}
