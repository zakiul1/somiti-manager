
import { Link } from '@inertiajs/react';
import { Plus, UserPlus, Wallet } from 'lucide-react';
import { AppCard } from '@/components/ui/app-card';
import { AppButton } from '@/components/ui/app-button';
import { useLocale } from '@/hooks/use-locale';

type QuickActionsProps = {
    title: string;
};

export function QuickActions({ title }: QuickActionsProps) {
    const { t } = useLocale();

    return (
        <AppCard>
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>

            <div className="grid gap-3 sm:grid-cols-3">
                <Link href="/loans/create"><AppButton className="justify-start"><Plus size={18} />{t('dashboard.newLoan')}</AppButton></Link>
                <Link href="/customers/create"><AppButton variant="secondary" className="justify-start"><UserPlus size={18} />{t('dashboard.addCustomer')}</AppButton></Link>
                <Link href="/payments/create"><AppButton variant="outline" className="justify-start"><Wallet size={18} />{t('dashboard.collectPayment')}</AppButton></Link>
            </div>
        </AppCard>
    );
}
