import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppBadge } from '@/components/ui/app-badge';
import { ConfirmDeleteModal } from '@/components/modals/confirm-delete-modal';
import { EmptyState } from '@/components/feedback/empty-state';
import { useLocale } from '@/hooks/use-locale';

function DetailItem({ label, value }) {
    return (
        <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-1 break-words text-sm text-slate-900 dark:text-slate-100">{value || '-'}</p>
        </div>
    );
}

function money(value, locale = 'en') {
    return new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(Number(value ?? 0));
}

export default function LoansShow({ loan }) {
    const { t, locale } = useLocale();
    const [showDelete, setShowDelete] = useState(false);
    const isClosed = loan.status === 'closed';
    const canSettle = loan.financial_summary?.can_settle;

    return (
        <>
            <Head title={loan.loan_code} />
            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={loan.loan_code}
                        description={isClosed ? t('loans.closedLoanSubtitle') : t('loans.recordSummarySubtitle')}
                        actions={<div className="flex flex-wrap items-center gap-2">
                            <AppBadge variant={isClosed ? 'default' : loan.status === 'active' ? 'success' : loan.status === 'defaulted' ? 'danger' : 'warning'}>
                                {t(`loans.${loan.status}`)}
                            </AppBadge>
                            {!isClosed && loan.next_due_installment ? (
                                <Link href={`/payments/create?installment_id=${loan.next_due_installment.id}`}><AppButton variant="outline">{t('payments.collectPayment')}</AppButton></Link>
                            ) : null}
                            {!isClosed && canSettle ? (
                                <Link href={`/payments/create?loan_id=${loan.id}&payment_mode=full_settlement`}><AppButton>{t('payments.fullSettlement')}</AppButton></Link>
                            ) : null}
                            <Link href={`/loans/${loan.id}/statement?locale=${locale}`}><AppButton variant="outline">{t('print.loanStatement')}</AppButton></Link>
                            <Link href={`/loans/${loan.id}/edit`}><AppButton variant="secondary">{t('loans.editLoan')}</AppButton></Link>
                            <AppButton variant="danger" onClick={() => setShowDelete(true)}>{t('loans.deleteLoan')}</AppButton>
                        </div>}
                    />

                    <div className="grid gap-6 xl:grid-cols-3">
                        <div className="space-y-6 xl:col-span-2">
                            <AppCard>
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    <div><p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('loans.totalPayable')}</p><p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{money(loan.financial_summary?.total_payable, locale)}</p></div>
                                    <div><p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('payments.totalPaid')}</p><p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{money(loan.financial_summary?.total_paid, locale)}</p></div>
                                    <div><p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('payments.remainingBalance')}</p><p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{money(loan.financial_summary?.remaining_balance, locale)}</p></div>
                                    <div><p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('payments.overdueAmount')}</p><p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{money(loan.financial_summary?.overdue_amount, locale)}</p></div>
                                </div>
                            </AppCard>

                            <AppCard>
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('payments.collectionOverview')}</h2>
                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{isClosed ? t('loans.closedLoanHint') : t('payments.collectionOverviewHint')}</p>
                                    </div>
                                    {loan.next_due_installment ? <AppBadge variant="warning">#{loan.next_due_installment.installment_no}</AppBadge> : null}
                                </div>
                                <div className="mt-5 grid gap-5 md:grid-cols-3">
                                    <DetailItem label={t('payments.nextDue')} value={loan.financial_summary?.next_due_date} />
                                    <DetailItem label={t('payments.nextDueAmount')} value={money(loan.financial_summary?.next_due_amount, locale)} />
                                    <DetailItem label={t('payments.openInstallments')} value={String(loan.installment_summary?.open ?? 0)} />
                                </div>
                                {isClosed ? (
                                    <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-200">{t('loans.loanClosedMessage')}</div>
                                ) : null}
                            </AppCard>

                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('loans.loanDetails')}</h2>
                                <div className="mt-5 grid gap-5 md:grid-cols-2">
                                    <DetailItem label={t('loans.customer')} value={loan.customer ? `${loan.customer.name} (${loan.customer.customer_code})` : '-'} />
                                    <DetailItem label={t('loans.principalAmount')} value={money(loan.principal_amount, locale)} />
                                    <DetailItem label={t('loans.interestRate')} value={`${loan.interest_rate}%`} />
                                    <DetailItem label={t('loans.interestAmount')} value={money(loan.interest_amount, locale)} />
                                    <DetailItem label={t('loans.totalPayable')} value={money(loan.total_payable, locale)} />
                                    <DetailItem label={t('loans.duration')} value={`${loan.duration_value} ${t(`loans.${loan.duration_unit}`)}`} />
                                    <DetailItem label={t('loans.frequency')} value={t(`loans.${loan.collection_frequency}`)} />
                                    <DetailItem label={t('loans.startDate')} value={loan.start_date} />
                                    <DetailItem label={t('loans.firstCollectionDate')} value={loan.first_collection_date} />
                                    <DetailItem label={t('loans.status')} value={t(`loans.${loan.status}`)} />
                                </div>
                            </AppCard>

                            <AppCard>
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('print.installmentSchedule')}</h2>
                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('installments.scheduleSubtitle')}</p>
                                    </div>
                                    {loan.installment_summary?.count ? (
                                        <Link href={`/loans/${loan.id}/installments`}><AppButton variant="outline" size="sm">{t('installments.viewSchedule')}</AppButton></Link>
                                    ) : (
                                        <Link href={`/installments/create?loan_id=${loan.id}`}><AppButton size="sm">{t('installments.generateInstallments')}</AppButton></Link>
                                    )}
                                </div>
                                <div className="mt-4 grid gap-4 md:grid-cols-5">
                                    <div><p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('installments.totalInstallments')}</p><p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{loan.installment_summary?.count ?? 0}</p></div>
                                    <div><p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('installments.pending')}</p><p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{loan.installment_summary?.pending ?? 0}</p></div>
                                    <div><p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('installments.partial')}</p><p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{loan.installment_summary?.partial ?? 0}</p></div>
                                    <div><p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('installments.overdue')}</p><p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{loan.installment_summary?.overdue ?? 0}</p></div>
                                    <div><p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('installments.paidLabel')}</p><p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{loan.installment_summary?.paid ?? 0}</p></div>
                                </div>
                            </AppCard>

                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('payments.recentPayments')}</h2>
                                <div className="mt-4 space-y-3">
                                    {loan.recent_payments?.length ? loan.recent_payments.map((payment) => (
                                        <div key={payment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                            <div className="min-w-0">
                                                <p className="font-medium text-slate-900 dark:text-slate-100">{payment.payment_code}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{payment.payment_date} • {t(`payments.${payment.payment_method}`)}</p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <AppBadge variant={payment.payment_type === 'full_settlement' ? 'warning' : 'success'}>{payment.payment_type === 'full_settlement' ? t('payments.fullSettlement') : t('payments.regularCollection')}</AppBadge>
                                                <p className="font-semibold text-slate-900 dark:text-slate-100">{money(payment.amount, locale)}</p>
                                                <Link href={`/payments/${payment.id}`}><AppButton variant="outline" size="sm">{t('payments.viewPayment')}</AppButton></Link>
                                            </div>
                                        </div>
                                    )) : <EmptyState title={t('payments.noPayments')} description={t('payments.receiptSubtitle')} />}
                                </div>
                            </AppCard>

                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('loans.guarantorCoverage')}</h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('loans.guarantorCoverageSubtitle')}</p>
                                <div className="mt-5">
                                    {loan.guarantors?.length ? (
                                        <div className="space-y-3">
                                            {loan.guarantors.map((guarantor) => (
                                                <div key={guarantor.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-slate-900 dark:text-slate-100">{guarantor.name}</p>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">{guarantor.guarantor_code} • {guarantor.phone}</p>
                                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{guarantor.relationship || '-'}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <AppBadge variant={guarantor.status === 'active' ? 'success' : 'warning'}>{guarantor.status === 'active' ? t('loans.active') : t('loans.inactive')}</AppBadge>
                                                            <Link href={`/guarantors/${guarantor.id}`}><AppButton variant="outline" size="sm">{t('loans.viewGuarantor')}</AppButton></Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState title={t('loans.noGuarantorsLinked')} description={t('loans.guarantorCoverageSubtitle')} />
                                    )}
                                </div>
                            </AppCard>
                        </div>

                        <div>
                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('loans.recordSummary')}</h2>
                                <div className="mt-5 space-y-5">
                                    <DetailItem label={t('loans.loanCode')} value={loan.loan_code} />
                                    <DetailItem label={t('loans.createdAt')} value={loan.created_at} />
                                    <DetailItem label={t('loans.updatedAt')} value={loan.updated_at} />
                                    {loan.customer ? <Link href={`/customers/${loan.customer.id}`} className="inline-flex"><AppButton variant="outline">{t('loans.viewCustomer')}</AppButton></Link> : null}
                                </div>
                            </AppCard>
                        </div>
                    </div>
                </PageContainer>
            </AppLayout>

            <ConfirmDeleteModal show={showDelete} title={t('loans.deleteLoan')} description={t('loans.deleteConfirm')} onClose={() => setShowDelete(false)} onConfirm={() => router.delete(`/loans/${loan.id}`)} />
        </>
    );
}
