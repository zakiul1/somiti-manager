import { Activity } from 'lucide-react';
import { AppCard } from '@/components/ui/app-card';

type RecentActivityProps = {
    title: string;
    emptyText: string;
};

export function RecentActivity({ title, emptyText }: RecentActivityProps) {
    return (
        <AppCard>
            <div className="mb-4 flex items-center gap-2">
                <Activity size={18} className="text-indigo-600 dark:text-indigo-300" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            </div>

            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">{emptyText}</p>
            </div>
        </AppCard>
    );
}
