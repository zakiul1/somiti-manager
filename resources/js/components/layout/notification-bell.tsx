import { useLocale } from '@/hooks/use-locale';
import { Bell } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { AppButton } from '@/components/ui/app-button';

export function NotificationBell() {
    const { t } = useLocale();

    return (
        <Link href="/notifications">
            <AppButton variant="ghost" size="sm" aria-label={t('common.notifications')}>
                <Bell size={18} />
            </AppButton>
        </Link>
    );
}
