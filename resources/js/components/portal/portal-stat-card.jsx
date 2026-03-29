import { AppCard } from '@/components/ui/app-card';

export default function PortalStatCard({ label, value, hint }) {
    return (
        <AppCard>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
            {hint ? <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
        </AppCard>
    );
}
