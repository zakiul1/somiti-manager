import { Link } from '@inertiajs/react';
import { AppCard } from '@/components/ui/app-card';
import { AppButton } from '@/components/ui/app-button';
import { InstallmentStatusBadge } from '@/components/installments/installment-status-badge';
import { useLocale } from '@/hooks/use-locale';

const money = (value, locale = 'en') => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 2 }).format(Number(value || 0));

function QueueCard({ title, description, items, emptyLabel }) {
    const { t, locale } = useLocale();

    return (
        <AppCard className="h-full">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {items.length}
                </span>
            </div>

            <div className="mt-4 space-y-3">
                {items.length ? items.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-slate-100">{item.customer?.name || '-'}</p>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.loan?.loan_code || '-'} · #{item.installment_no}</p>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('installments.dueDate')}: {item.due_date || '-'}</p>
                            </div>
                            <InstallmentStatusBadge status={item.status} />
                        </div>
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('installments.outstanding')}</p>
                                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{money(item.outstanding_amount, locale)}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Link href={route('payments.create', { installment_id: item.id })}>
                                    <AppButton size="sm">{t('installments.collectPayment')}</AppButton>
                                </Link>
                                <Link href={route('installments.customers.show', item.customer?.id)}>
                                    <AppButton variant="outline" size="sm">{t('installments.viewCustomer')}</AppButton>
                                </Link>
                            </div>
                        </div>
                    </div>
                )) : <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">{emptyLabel}</p>}
            </div>
        </AppCard>
    );
}

export default function InstallmentDashboard({ overview }) {
    const { t } = useLocale();

    return (
        <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-3">
                <QueueCard
                    title={t('installments.overdueInstallments')}
                    description={t('installments.overdueSubtitle')}
                    items={overview.overdue_items || []}
                    emptyLabel={t('installments.noOverdueQueue')}
                />
                <QueueCard
                    title={t('installments.dueToday')}
                    description={t('installments.dueTodaySubtitle')}
                    items={overview.due_today_items || []}
                    emptyLabel={t('installments.noDueTodayQueue')}
                />
                <QueueCard
                    title={t('installments.upcoming7Days')}
                    description={t('installments.upcomingSubtitle')}
                    items={overview.upcoming_items || []}
                    emptyLabel={t('installments.noUpcomingQueue')}
                />
            </div>
        </div>
    );
}
