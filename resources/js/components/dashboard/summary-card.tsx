import type { ReactNode } from 'react';
import { AppCard } from '@/components/ui/app-card';

type SummaryCardProps = {
    title: string;
    value: string;
    icon: ReactNode;
    hint?: string;
};

export function SummaryCard({ title, value, icon, hint }: SummaryCardProps) {
    return (
        <AppCard className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                <h3 className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</h3>
                {hint ? <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
            </div>

            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                {icon}
            </div>
        </AppCard>
    );
}
