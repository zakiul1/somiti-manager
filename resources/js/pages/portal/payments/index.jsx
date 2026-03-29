import { Link, router } from '@inertiajs/react';
import CustomerPortalLayout from '@/layouts/customer-portal-layout';
import { AppCard } from '@/components/ui/app-card';
import PortalSummaryStrip from '@/components/portal/portal-summary-strip';
import { useLocale } from '@/hooks/use-locale';
import { formatDate, formatMoney } from '@/lib/formatters';

export default function PortalPaymentsIndex({ summary, filters, payments }) {
    const { t, locale } = useLocale();

    return (
        <CustomerPortalLayout title={t('portal.payments')}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('portal.payments')}</h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t('portal.paymentsSubtitle')}</p>
                </div>
                <PortalSummaryStrip summary={summary} />
                <AppCard>
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <select value={filters.method} onChange={(e) => router.get(route('portal.payments'), { method: e.target.value }, { preserveState: true, replace: true })} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
                            <option value="all">{t('portal.allMethods')}</option>
                            <option value="cash">{t('payments.cash')}</option>
                            <option value="bank">{t('payments.bank')}</option>
                            <option value="mobile_banking">{t('payments.mobileBanking')}</option>
                        </select>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                    <th className="px-3 py-3">{t('payments.paymentCode')}</th>
                                    <th className="px-3 py-3">{t('loans.loanCode')}</th>
                                    <th className="px-3 py-3">{t('installments.installmentNo')}</th>
                                    <th className="px-3 py-3">{t('payments.paymentDate')}</th>
                                    <th className="px-3 py-3">{t('payments.paymentMethod')}</th>
                                    <th className="px-3 py-3">{t('payments.amount')}</th>
                                    <th className="px-3 py-3">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.length ? payments.map((item) => (
                                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-900">
                                        <td className="px-3 py-3 font-medium text-slate-900 dark:text-slate-100">{item.payment_code}</td>
                                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{item.loan_code}</td>
                                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300">#{item.installment_no}</td>
                                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{formatDate(item.payment_date, locale)}</td>
                                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{item.payment_method || '-'}</td>
                                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{formatMoney(item.amount, locale)}</td>
                                        <td className="px-3 py-3">
                                            <Link href={route('print.payment-receipt', { payment: item.id, locale })} className="inline-flex rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">{t('portal.viewReceipt')}</Link>
                                        </td>
                                    </tr>
                                )) : <tr><td className="px-3 py-8 text-center text-slate-500 dark:text-slate-400" colSpan="7">{t('portal.noPayments')}</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </AppCard>
            </div>
        </CustomerPortalLayout>
    );
}
