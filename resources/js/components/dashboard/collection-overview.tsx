
import { BarChart3 } from 'lucide-react';
import { AppCard } from '@/components/ui/app-card';
import { useLocale } from '@/hooks/use-locale';

type CollectionOverviewProps = {
    title: string;
};

export function CollectionOverview({ title }: CollectionOverviewProps) {
    const { t } = useLocale();

    return (
        <AppCard>
            <div className="mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-emerald-600 dark:text-emerald-300" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            </div>

            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.chartPlaceholder')}</p>
            </div>
        </AppCard>
    );
}
