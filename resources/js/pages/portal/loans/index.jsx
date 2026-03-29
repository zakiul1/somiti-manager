import { Link, router } from '@inertiajs/react';
import CustomerPortalLayout from '@/layouts/customer-portal-layout';
import { AppCard } from '@/components/ui/app-card';
import PortalSummaryStrip from '@/components/portal/portal-summary-strip';
import { useLocale } from '@/hooks/use-locale';
import { formatDate, formatMoney, formatNumber } from '@/lib/formatters';

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
                            <option value="draft">{t('portal.statusDraft')}</option>
                            <option value="approved">{t('portal.statusApproved')}</option>
                            <option value="active">{t('portal.statusActive')}</option>
                            <option value="closed">{t('portal.statusClosed')}</option>
                        </select>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                    <th className="px-3 py-3">{t('loans.loanCode')}</th>
                                    <th className="px-3 py-3">{t('loans.startDate')}</th>
                                    <th className="px-3 py-3">{t('portal.installments')}</th>
                                    <th className="px-3 py-3">{t('portal.totalPaid')}</th>
                                    <th className="px-3 py-3">{t('portal.outstanding')}</th>
                                    <th className="px-3 py-3">{t('loans.status')}</th>
                                    <th className="px-3 py-3">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loans.length ? loans.map((loan) => (
                                    <tr key={loan.id} className="border-b border-slate-100 dark:border-slate-900">
                                        <td className="px-3 py-3 font-medium text-slate-900 dark:text-slate-100">{loan.loan_code}</td>
                                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{formatDate(loan.start_date, locale)}</td>
                                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{formatNumber(loan.installments_count, locale)}</td>
                                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{formatMoney(loan.total_paid, locale)}</td>
                                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{formatMoney(loan.outstanding, locale)}</td>
                                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{loan.status}</td>
                                        <td className="px-3 py-3">
                                            <div className="flex flex-wrap gap-2">
                                                <Link href={route('print.loan-statement', { loan: loan.id, locale })} className="inline-flex rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">{t('portal.viewStatement')}</Link>
                                                <Link href={route('print.installment-schedule', { loan: loan.id, locale })} className="inline-flex rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">{t('portal.installmentSchedule')}</Link>
                                            </div>
                                        </td>
                                    </tr>
                                )) : <tr><td className="px-3 py-8 text-center text-slate-500 dark:text-slate-400" colSpan="7">{t('portal.noLoans')}</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </AppCard>
            </div>
        </CustomerPortalLayout>
    );
}
