import { Link, router } from '@inertiajs/react';
import CustomerPortalLayout from '@/layouts/customer-portal-layout';
import { AppCard } from '@/components/ui/app-card';
import PortalSummaryStrip from '@/components/portal/portal-summary-strip';
import { useLocale } from '@/hooks/use-locale';
import { formatDate, formatMoney } from '@/lib/formatters';

function StatusPill({ value }) {
    const styles = {
        active: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
        closed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
        defaulted: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
    };

    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[value] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>{value}</span>;
}

export default function PortalLoansIndex({ summary, filters, loans }) {
    const { t, locale } = useLocale();

    return (
        <CustomerPortalLayout title={t('portal.loans')}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('portal.loans')}</h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t('portal.loansSubtitle')}</p>
                </div>
                <PortalSummaryStrip summary={summary} />
                <AppCard>
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <select value={filters.status} onChange={(e) => router.get(route('portal.loans'), { status: e.target.value }, { preserveState: true, replace: true })} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
                            <option value="all">{t('portal.allStatuses')}</option>
                            <option value="active">{t('portal.statusActive')}</option>
                            <option value="closed">{t('portal.statusClosed')}</option>
                            <option value="defaulted">{t('portal.statusDefaulted')}</option>
                        </select>
                    </div>
                    <div className="space-y-4">
                        {loans.length ? loans.map((loan) => (
                            <div key={loan.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                    <div className="min-w-0 space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="font-semibold text-slate-900 dark:text-slate-100">{loan.loan_code}</h2>
                                            <StatusPill value={loan.status} />
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('portal.startDate')}: {formatDate(loan.start_date, locale)} • {t('portal.collectionFrequency')}: {loan.collection_frequency || '-'}</p>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:min-w-[520px]">
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('portal.totalPayable')}</p>
                                            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{formatMoney(loan.total_payable, locale)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('portal.totalPaid')}</p>
                                            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{formatMoney(loan.total_paid, locale)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('portal.remainingBalance')}</p>
                                            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{formatMoney(loan.outstanding, locale)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('portal.nextDueAmount')}</p>
                                            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{formatMoney(loan.next_due_amount || 0, locale)}</p>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDate(loan.next_due_date, locale)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-900">
                                    <div className="text-sm text-slate-500 dark:text-slate-400">{t('portal.openInstallments')}: {loan.open_installments || 0} • {t('portal.overdueAmount')}: {formatMoney(loan.overdue_amount || 0, locale)}</div>
                                    <div className="flex flex-wrap gap-2">
                                        <Link href={route('print.loan-statement', { loan: loan.id, locale })} className="inline-flex rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">{t('portal.viewStatement')}</Link>
                                        <Link href={route('print.installment-schedule', { loan: loan.id, locale })} className="inline-flex rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">{t('portal.installmentSchedule')}</Link>
                                    </div>
                                </div>
                            </div>
                        )) : <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">{t('portal.noLoans')}</div>}
                    </div>
                </AppCard>
            </div>
        </CustomerPortalLayout>
    );
}
