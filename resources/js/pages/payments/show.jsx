import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppCard } from '@/components/ui/app-card';
import { AppButton } from '@/components/ui/app-button';
import { AppBadge } from '@/components/ui/app-badge';
import { useLocale } from '@/hooks/use-locale';

const money = (value, locale = 'en') => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 2 }).format(Number(value || 0));

function DetailItem({ label, value }) {
    return <div className="min-w-0"><p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p><p className="mt-1 break-words text-sm text-slate-900 dark:text-slate-100">{value || '-'}</p></div>;
}

function SmallRow({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 py-2 text-sm last:border-b-0 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">{label}</span>
            <span className="text-right text-slate-900 dark:text-slate-100">{value || '-'}</span>
        </div>
    );
}

export default function PaymentsShow({ payment, relatedBatchPayments = [], recentLoanPayments = [] }) {
    const { t, locale } = useLocale();
    const isSettlement = payment.payment_type === 'full_settlement';

    return (
        <>
            <Head title={payment.payment_code} />
            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={payment.payment_code}
                        description={t('payments.receiptSubtitle')}
                        actions={<div className="flex gap-2 flex-wrap"><Link href="/payments"><AppButton variant="outline">{t('payments.backToPayments')}</AppButton></Link>{payment.loan ? <Link href={`/loans/${payment.loan.id}`}><AppButton variant="outline">{t('payments.viewLoan')}</AppButton></Link> : null}<Link href={route('print.payment-receipt', { payment: payment.id, locale })}><AppButton variant="outline">{t('print.receipt')}</AppButton></Link></div>}
                    />

                    <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('payments.amount')}</p><p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{money(payment.amount, locale)}</p></AppCard>
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('payments.paymentMode')}</p><div className="mt-2"><AppBadge variant={isSettlement ? 'warning' : 'success'}>{isSettlement ? t('payments.fullSettlement') : t('payments.regularCollection')}</AppBadge></div></AppCard>
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('payments.paymentDate')}</p><p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{payment.payment_date}</p></AppCard>
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('payments.receiptAndProof')}</p><p className="mt-2 text-sm text-slate-900 dark:text-slate-100">{payment.reference_no || payment.batch_reference || '-'}</p></AppCard>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-3">
                        <div className="space-y-6 xl:col-span-2">
                            <AppCard>
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('payments.paymentDetails')}</h2>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <AppBadge variant={payment.payment_method === 'cash' ? 'success' : payment.payment_method === 'bank' ? 'default' : 'warning'}>{t(`payments.${payment.payment_method}`)}</AppBadge>
                                        <AppBadge variant={isSettlement ? 'warning' : 'default'}>{isSettlement ? t('payments.fullSettlement') : t('payments.regularCollection')}</AppBadge>
                                    </div>
                                </div>
                                <div className="mt-5 grid gap-5 md:grid-cols-2">
                                    <DetailItem label={t('payments.paymentCode')} value={payment.payment_code} />
                                    <DetailItem label={t('payments.collectedBy')} value={payment.collector?.name} />
                                    <DetailItem label={t('payments.referenceNo')} value={payment.reference_no} />
                                    <DetailItem label={t('payments.batchReference')} value={payment.batch_reference} />
                                    <DetailItem label={t('payments.createdAt')} value={payment.created_at} />
                                    <DetailItem label={t('payments.updatedAt')} value={payment.updated_at} />
                                </div>
                            </AppCard>

                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('payments.collectionHistory')}</h2>
                                <div className="mt-5 grid gap-5 md:grid-cols-2">
                                    <DetailItem label={t('payments.customer')} value={payment.customer ? `${payment.customer.name} (${payment.customer.customer_code})` : '-'} />
                                    <DetailItem label={t('payments.loan')} value={payment.loan?.loan_code} />
                                    <DetailItem label={t('payments.installment')} value={payment.installment ? `#${payment.installment.installment_no}` : '-'} />
                                    <DetailItem label={t('payments.dueDate')} value={payment.installment?.due_date} />
                                    <DetailItem label={t('payments.installmentAmount')} value={money(payment.installment?.installment_amount, locale)} />
                                    <DetailItem label={t('payments.totalPaidOnInstallment')} value={money(payment.installment?.paid_amount, locale)} />
                                </div>
                            </AppCard>

                            {relatedBatchPayments.length ? (
                                <AppCard>
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('payments.batchCollectionHistory')}</h2>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('payments.batchCollectionHistoryHint')}</p>
                                    <div className="mt-4 overflow-x-auto">
                                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                                            <thead className="bg-slate-50 dark:bg-slate-950/50">
                                                <tr>
                                                    {[t('payments.paymentCode'), t('reports.date'), t('payments.amount'), t('payments.collectedBy')].map((header) => (
                                                        <th key={header} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{header}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                                {relatedBatchPayments.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="px-3 py-2 text-sm text-slate-900 dark:text-slate-100"><Link href={`/payments/${item.id}`} className="text-indigo-600 dark:text-indigo-400">{item.payment_code}</Link></td>
                                                        <td className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300">{item.payment_date}</td>
                                                        <td className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300">{money(item.amount, locale)}</td>
                                                        <td className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300">{item.collector || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </AppCard>
                            ) : null}

                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('payments.notesAndProof')}</h2>
                                <div className="mt-4 grid gap-5 md:grid-cols-2">
                                    <DetailItem label={t('payments.referenceNo')} value={payment.reference_no} />
                                    <DetailItem label={t('payments.batchReference')} value={payment.batch_reference} />
                                </div>
                                <p className="mt-4 whitespace-pre-wrap break-words rounded-2xl border border-slate-200 p-4 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-300">{payment.notes || '-'}</p>
                            </AppCard>
                        </div>

                        <div className="space-y-6">
                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('payments.recordSummary')}</h2>
                                <div className="mt-4">
                                    <SmallRow label={t('payments.installmentStatus')} value={payment.installment?.status ? t(`installments.${payment.installment.status}`) : '-'} />
                                    <SmallRow label={t('loans.status')} value={payment.loan?.status ? t(`loans.${payment.loan.status}`) : '-'} />
                                    <SmallRow label={t('payments.paymentMethod')} value={payment.payment_method ? t(`payments.${payment.payment_method}`) : '-'} />
                                    <SmallRow label={t('payments.paymentMode')} value={isSettlement ? t('payments.fullSettlement') : t('payments.regularCollection')} />
                                </div>
                            </AppCard>

                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('payments.recentLoanPayments')}</h2>
                                {recentLoanPayments.length ? (
                                    <div className="mt-4 space-y-3">
                                        {recentLoanPayments.map((item) => (
                                            <div key={item.id} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <Link href={`/payments/${item.id}`} className="font-medium text-indigo-600 dark:text-indigo-400">{item.payment_code}</Link>
                                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.payment_date}</p>
                                                        {item.reference_no ? <p className="mt-1 break-words text-xs text-slate-500 dark:text-slate-400">{item.reference_no}</p> : null}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{money(item.amount, locale)}</p>
                                                        <div className="mt-1"><AppBadge variant={item.payment_type === 'full_settlement' ? 'warning' : 'default'}>{item.payment_type === 'full_settlement' ? t('payments.fullSettlement') : t('payments.regularCollection')}</AppBadge></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{t('payments.noRecentLoanPayments')}</p>}
                            </AppCard>
                        </div>
                    </div>
                </PageContainer>
            </AppLayout>
        </>
    );
}
