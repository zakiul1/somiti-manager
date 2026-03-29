import { Head, Link, router, usePage } from '@inertiajs/react';
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
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{value || '-'}</p>
        </div>
    );
}

function money(value, locale = 'en') {
    return new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(Number(value ?? 0));
}

export default function LoansShow({ loan }) {
    const { t, locale } = useLocale();
    const { props } = usePage();
    const [showDelete, setShowDelete] = useState(false);

    return (
        <>
            <Head title={loan.loan_code} />
            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={loan.loan_code}
                        description={t('loans.recordSummarySubtitle')}
                        actions={<div className="flex flex-wrap items-center gap-2">
                            <AppBadge variant={loan.status === 'active' ? 'success' : loan.status === 'approved' ? 'default' : loan.status === 'closed' ? 'default' : loan.status === 'defaulted' ? 'danger' : 'warning'}>{t(`loans.${loan.status}`)}</AppBadge>
                            {loan.status === 'draft' ? <AppButton variant="secondary" onClick={() => router.post(`/loans/${loan.id}/approve`)}>{t('loans.approveLoan')}</AppButton> : null}
                            {loan.status === 'approved' ? <Link href={`/loans/${loan.id}/disburse`}><AppButton variant="secondary">{t('loans.disburseLoan')}</AppButton></Link> : null}
                            <Link href={`/loans/${loan.id}/statement?locale=${locale}`}><AppButton variant="outline">{t('print.loanStatement')}</AppButton></Link>
                            <Link href={`/documents/create?entity_type=loan&loan_id=${loan.id}`}><AppButton variant="secondary">{t('documents.addDocument')}</AppButton></Link>
                            <Link href={`/loans/${loan.id}/edit`}><AppButton variant="outline">{t('loans.editLoan')}</AppButton></Link>
                            <AppButton variant="danger" onClick={() => setShowDelete(true)}>{t('loans.deleteLoan')}</AppButton>
                        </div>}
                    />

                    {props.flash?.success ? <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">{props.flash.success}</div> : null}

                    <div className="grid gap-6 xl:grid-cols-3">
                        <div className="space-y-6 xl:col-span-2">
                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('loans.approvalAndDisbursement')}</h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('loans.approvalAndDisbursementSubtitle')}</p>
                                <div className="mt-5 grid gap-5 md:grid-cols-2">
                                    <DetailItem label={t('loans.approvedAt')} value={loan.approved_at} />
                                    <DetailItem label={t('loans.approvedBy')} value={loan.approver?.name} />
                                    <DetailItem label={t('loans.disbursedAt')} value={loan.disbursed_at} />
                                    <DetailItem label={t('loans.disbursedBy')} value={loan.disburser?.name} />
                                    <DetailItem label={t('loans.disbursementAmount')} value={loan.disbursement_amount ? money(loan.disbursement_amount, locale) : '-'} />
                                    <DetailItem label={t('loans.disbursementMethod')} value={loan.disbursement_method ? t(`payments.${loan.disbursement_method}`) : '-'} />
                                    <DetailItem label={t('loans.disbursementReference')} value={loan.disbursement_reference} />
                                    <DetailItem label={t('loans.approvalNotes')} value={loan.approval_notes} />
                                </div>
                                {loan.disbursement_notes ? (
                                    <div className="mt-4 rounded-2xl border border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
                                        <p className="font-medium text-slate-900 dark:text-slate-100">{t('loans.disbursementNotes')}</p>
                                        <p className="mt-2">{loan.disbursement_notes}</p>
                                    </div>
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
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('loans.guarantorCoverage')}</h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('loans.guarantorCoverageSubtitle')}</p>
                                <div className="mt-5">
                                    {loan.guarantors?.length ? (
                                        <div className="space-y-3">
                                            {loan.guarantors.map((guarantor) => (
                                                <div key={guarantor.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                                        <div>
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

                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('print.installmentSchedule')}</h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('installments.scheduleSubtitle')}</p>
                                <div className="mt-4 flex items-center justify-between gap-4">
                                    <div className="grid gap-4 md:grid-cols-4 flex-1">
                                        <div><p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('installments.totalInstallments')}</p><p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{loan.installment_summary?.count ?? 0}</p></div>
                                        <div><p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('installments.pending')}</p><p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{loan.installment_summary?.pending ?? 0}</p></div>
                                        <div><p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('installments.paidLabel')}</p><p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{loan.installment_summary?.paid ?? 0}</p></div>
                                        <div><p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('payments.dueDate')}</p><p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{loan.installment_summary?.next_due_date ?? '-'}</p></div>
                                    </div>
                                    {loan.installment_summary?.count ? (
                                        <Link href={`/loans/${loan.id}/installments`}><AppButton variant="outline" size="sm">{t('installments.viewSchedule')}</AppButton></Link>
                                    ) : (
                                        <Link href={`/installments/create?loan_id=${loan.id}`}><AppButton size="sm">{t('installments.generateInstallments')}</AppButton></Link>
                                    )}
                                </div>
                            </AppCard>

                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('loans.notes')}</h2>
                                <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{loan.notes || '-'}</p>
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
