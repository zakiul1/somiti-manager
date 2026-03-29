import type { AppLocale } from '@/types/common';
import { AppButton } from '@/components/ui/app-button';
import { useLocale } from '@/hooks/use-locale';

export function LanguageSwitcher() {
    const { locale, changeLocale, t } = useLocale();

    const handleChange = () => {
        const nextLocale: AppLocale = locale === 'en' ? 'bn' : 'en';
        changeLocale(nextLocale);
    };

    return (
        <AppButton variant="ghost" size="sm" onClick={handleChange} title={t('common.language')}>
            <span>{locale === 'en' ? t('common.bangla') : t('common.english')}</span>
        </AppButton>
    );
}
