import { router } from '@inertiajs/react';
import CustomerPortalLayout from '@/layouts/customer-portal-layout';
import { AppCard } from '@/components/ui/app-card';
import PortalSummaryStrip from '@/components/portal/portal-summary-strip';
import { useLocale } from '@/hooks/use-locale';
import { formatDate, formatMoney } from '@/lib/formatters';

function StatusPill({ value, t }) {
    const styles = {
        pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
        partial: 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300',
        paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
        overdue: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
    };
    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[value] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>{t(`portal.status${value?.charAt(0)?.toUpperCase()}${value?.slice(1)}`) || value}</span>;
}

export default function PortalInstallmentsIndex({ summary, filters, installments }) {
    const { t, locale } = useLocale();

    return (
        <CustomerPortalLayout title={t('portal.installments')}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('portal.installments')}</h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t('portal.installmentsSubtitle')}</p>
                </div>
                <PortalSummaryStrip summary={summary} />
                <AppCard>
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <select value={filters.status} onChange={(e) => router.get(route('portal.installments'), { status: e.target.value }, { preserveState: true, replace: true })} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
                            <option value="all">{t('portal.allStatuses')}</option>
                            <option value="pending">{t('portal.statusPending')}</option>
                            <option value="partial">{t('portal.statusPartial')}</option>
                            <option value="paid">{t('portal.statusPaid')}</option>
                            <option value="overdue">{t('portal.statusOverdue')}</option>
                        </select>
                    </div>
                    <div className="space-y-3">
                        {installments.length ? installments.map((item) => (
                            <div key={item.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-slate-900 dark:text-slate-100">{item.loan_code} • #{item.installment_no}</p>
                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('installments.dueDate')}: {formatDate(item.due_date, locale)}</p>
                                    </div>
                                    <div className="grid gap-3 text-sm sm:grid-cols-3 md:min-w-[360px]">
                                        <div>
                                            <p className="text-slate-500 dark:text-slate-400">{t('installments.amount')}</p>
                                            <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{formatMoney(item.installment_amount, locale)}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 dark:text-slate-400">{t('payments.paidAmount')}</p>
                                            <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{formatMoney(item.paid_amount, locale)}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 dark:text-slate-400">{t('portal.outstanding')}</p>
                                            <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{formatMoney(item.outstanding, locale)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3"><StatusPill value={item.status} t={t} /></div>
                            </div>
                        )) : <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">{t('portal.noInstallments')}</div>}
                    </div>
                </AppCard>
            </div>
        </CustomerPortalLayout>
    );
}
