import { Bell } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { AppButton } from '@/components/ui/app-button';

export function NotificationBell() {
    return (
        <Link href="/notifications">
            <AppButton variant="ghost" size="sm" aria-label="Notifications">
                <Bell size={18} />
            </AppButton>
        </Link>
    );
}
