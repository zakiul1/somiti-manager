import { useLocale } from '@/hooks/use-locale';

const badgeMap = {
    paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    overdue: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    partial: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    pending: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export function InstallmentStatusBadge({ status }) {
    const { t } = useLocale();
    const labelMap = {
        paid: t('installments.paidStatus'),
        overdue: t('installments.overdue'),
        partial: t('installments.partial'),
        pending: t('installments.pending'),
    };

    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${badgeMap[status] || badgeMap.pending}`}>
            {labelMap[status] || status}
        </span>
    );
}
