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
    return <div><p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p><p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{value || '-'}</p></div>;
}

export default function PaymentsShow({ payment }) {
    const { t, locale } = useLocale();

    return (
        <>
            <Head title={payment.payment_code} />
            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={payment.payment_code}
                        description={t('payments.receiptSubtitle')}
                        actions={<div className="flex gap-2 flex-wrap"><Link href="/payments"><AppButton variant="outline">{t('payments.backToPayments')}</AppButton></Link>{payment.loan ? <Link href={`/loans/${payment.loan.id}`}><AppButton variant="outline">{t('payments.viewLoan')}</AppButton></Link> : null}<Link href={`/payments/${payment.id}/receipt?locale=${locale}`}><AppButton variant="outline">{t('print.receipt')}</AppButton></Link></div>}
                    />

                    <div className="grid gap-6 xl:grid-cols-3">
                        <div className="space-y-6 xl:col-span-2">
                            <AppCard>
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('payments.paymentDetails')}</h2>
                                    <AppBadge variant={payment.payment_method === 'cash' ? 'success' : payment.payment_method === 'bank' ? 'default' : 'warning'}>{t(`payments.${payment.payment_method}`)}</AppBadge>
                                </div>
                                <div className="mt-5 grid gap-5 md:grid-cols-2">
                                    <DetailItem label={t('payments.amount')} value={money(payment.amount, locale)} />
                                    <DetailItem label={t('payments.paymentDate')} value={payment.payment_date} />
                                    <DetailItem label={t('payments.referenceNo')} value={payment.reference_no} />
                                    <DetailItem label={t('payments.collectedBy')} value={payment.collector?.name} />
                                </div>
                            </AppCard>

                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('payments.installment')}</h2>
                                <div className="mt-5 grid gap-5 md:grid-cols-2">
                                    <DetailItem label={t('payments.loan')} value={payment.loan?.loan_code} />
                                    <DetailItem label={t('payments.customer')} value={payment.customer ? `${payment.customer.name} (${payment.customer.customer_code})` : '-'} />
                                    <DetailItem label={t('payments.installment')} value={payment.installment ? `#${payment.installment.installment_no}` : '-'} />
                                    <DetailItem label={t('payments.dueDate')} value={payment.installment?.due_date} />
                                    <DetailItem label={t('payments.installmentAmount')} value={money(payment.installment?.installment_amount, locale)} />
                                    <DetailItem label={t('payments.totalPaidOnInstallment')} value={money(payment.installment?.paid_amount, locale)} />
                                </div>
                            </AppCard>

                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('payments.notes')}</h2>
                                <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{payment.notes || '-'}</p>
                            </AppCard>
                        </div>

                        <div>
                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('payments.recordSummary')}</h2>
                                <div className="mt-5 space-y-5">
                                    <DetailItem label={t('payments.paymentCode')} value={payment.payment_code} />
                                    <DetailItem label={t('payments.installmentStatus')} value={payment.installment?.status ? t(`installments.${payment.installment.status}`) : '-'} />
                                    <DetailItem label={t('payments.createdAt')} value={payment.created_at} />
                                    <DetailItem label={t('payments.updatedAt')} value={payment.updated_at} />
                                </div>
                            </AppCard>
                        </div>
                    </div>
                </PageContainer>
            </AppLayout>
        </>
    );
}
