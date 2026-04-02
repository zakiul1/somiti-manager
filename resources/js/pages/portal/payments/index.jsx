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
                    <div className="space-y-3">
                        {payments.length ? payments.map((item) => (
                            <div key={item.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-slate-900 dark:text-slate-100">{item.payment_code}</p>
                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.loan_code} • {formatDate(item.payment_date, locale)}</p>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('portal.paymentMode')}: {t(`payments.${item.payment_type === 'full_settlement' ? 'fullSettlement' : 'regularCollection'}`)}</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 md:justify-end">
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{formatMoney(item.amount, locale)}</p>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.payment_method || '-'}</p>
                                        </div>
                                        <Link href={route('print.payment-receipt', { payment: item.id, locale })} className="inline-flex rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">{t('portal.viewReceipt')}</Link>
                                    </div>
                                </div>
                                {(item.reference_no || item.batch_reference) ? (
                                    <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-900 dark:text-slate-400">
                                        {item.reference_no ? <span>{t('payments.referenceNo')}: {item.reference_no}</span> : null}
                                        {item.reference_no && item.batch_reference ? <span> • </span> : null}
                                        {item.batch_reference ? <span>{t('payments.batchReference')}: {item.batch_reference}</span> : null}
                                    </div>
                                ) : null}
                            </div>
                        )) : <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">{t('portal.noPayments')}</div>}
                    </div>
                </AppCard>
            </div>
        </CustomerPortalLayout>
    );
}
