import { router } from '@inertiajs/react';
import CustomerPortalLayout from '@/layouts/customer-portal-layout';
import { AppCard } from '@/components/ui/app-card';
import PortalSummaryStrip from '@/components/portal/portal-summary-strip';
import { useLocale } from '@/hooks/use-locale';
import { formatDate, formatMoney } from '@/lib/formatters';

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
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                    <th className="px-3 py-3">{t('loans.loanCode')}</th>
                                    <th className="px-3 py-3">{t('installments.installmentNo')}</th>
                                    <th className="px-3 py-3">{t('installments.dueDate')}</th>
                                    <th className="px-3 py-3">{t('installments.amount')}</th>
                                    <th className="px-3 py-3">{t('portal.outstanding')}</th>
                                    <th className="px-3 py-3">{t('installments.status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {installments.length ? installments.map((item) => (
                                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-900">
                                        <td className="px-3 py-3 font-medium text-slate-900 dark:text-slate-100">{item.loan_code}</td>
                                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300">#{item.installment_no}</td>
                                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{formatDate(item.due_date, locale)}</td>
                                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{formatMoney(item.installment_amount, locale)}</td>
                                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{formatMoney(item.outstanding, locale)}</td>
                                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{item.status}</td>
                                    </tr>
                                )) : <tr><td className="px-3 py-8 text-center text-slate-500 dark:text-slate-400" colSpan="6">{t('portal.noInstallments')}</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </AppCard>
            </div>
        </CustomerPortalLayout>
    );
}
