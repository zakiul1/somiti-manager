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

export default function GuarantorsShow({ guarantor }) {
    const { t } = useLocale();
    const { props } = usePage();
    const [showDelete, setShowDelete] = useState(false);

    return (
        <>
            <Head title={guarantor.name} />
            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={guarantor.name}
                        description={t('guarantors.recordSummarySubtitle')}
                        actions={<div className="flex flex-wrap items-center gap-2">
                            <AppBadge variant={guarantor.status === 'active' ? 'success' : 'warning'}>{guarantor.status === 'active' ? t('guarantors.active') : t('guarantors.inactive')}</AppBadge>
                            <Link href={`/guarantors/${guarantor.id}/edit`}><AppButton variant="outline">{t('guarantors.editGuarantor')}</AppButton></Link>
                            <AppButton variant="secondary" onClick={() => router.patch(`/guarantors/${guarantor.id}/archive`, {}, { preserveScroll: true })}>{guarantor.status === 'active' ? t('guarantors.archiveGuarantor') : t('guarantors.activateGuarantor')}</AppButton>
                            <AppButton variant="danger" onClick={() => setShowDelete(true)}>{t('guarantors.deleteGuarantor')}</AppButton>
                        </div>}
                    />

                    {props.flash?.success ? <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">{props.flash.success}</div> : null}

                    <div className="grid gap-6 xl:grid-cols-3">
                        <div className="space-y-6 xl:col-span-2">
                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('guarantors.basicInfo')}</h2>
                                <div className="mt-5 grid gap-5 md:grid-cols-2">
                                    <DetailItem label={t('guarantors.name')} value={guarantor.name} />
                                    <DetailItem label={t('guarantors.phone')} value={guarantor.phone} />
                                    <DetailItem label={t('guarantors.email')} value={guarantor.email} />
                                    <DetailItem label={t('guarantors.nidNumber')} value={guarantor.nid_number} />
                                    <DetailItem label={t('guarantors.dateOfBirth')} value={guarantor.date_of_birth} />
                                    <DetailItem label={t('guarantors.gender')} value={guarantor.gender ? t(`guarantors.${guarantor.gender}`) : '-'} />
                                    <DetailItem label={t('guarantors.occupation')} value={guarantor.occupation} />
                                    <DetailItem label={t('guarantors.status')} value={guarantor.status === 'active' ? t('guarantors.active') : t('guarantors.inactive')} />
                                </div>
                            </AppCard>

                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('guarantors.connectionInfo')}</h2>
                                <div className="mt-5 grid gap-5 md:grid-cols-2">
                                    <DetailItem label={t('guarantors.relationship')} value={guarantor.relationship} />
                                    <DetailItem label={t('guarantors.customer')} value={guarantor.customer ? `${guarantor.customer.name} (${guarantor.customer.customer_code})` : '-'} />
                                    <DetailItem label={t('guarantors.address')} value={guarantor.address} />
                                    <DetailItem label={t('guarantors.notes')} value={guarantor.notes} />
                                </div>
                            </AppCard>

                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('guarantors.loanConnections')}</h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('guarantors.loanConnectionsSubtitle')}</p>
                                <div className="mt-5">
                                    {guarantor.loans?.length ? (
                                        <div className="space-y-3">
                                            {guarantor.loans.map((loan) => (
                                                <div key={loan.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                                        <div>
                                                            <p className="font-medium text-slate-900 dark:text-slate-100">{loan.loan_code}</p>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">{loan.start_date} • {loan.principal_amount} / {loan.total_payable}</p>
                                                        </div>
                                                        <Link href={`/loans/${loan.id}`}><AppButton variant="outline" size="sm">{t('guarantors.viewLoan')}</AppButton></Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState title={t('guarantors.noLoansLinked')} description={t('guarantors.loanConnectionsSubtitle')} />
                                    )}
                                </div>
                            </AppCard>

                        </div>

                        <div>
                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('guarantors.recordSummary')}</h2>
                                <div className="mt-5 space-y-5">
                                    <DetailItem label={t('guarantors.guarantorCode')} value={guarantor.guarantor_code} />
                                    <DetailItem label={t('guarantors.createdAt')} value={guarantor.created_at} />
                                    <DetailItem label={t('guarantors.updatedAt')} value={guarantor.updated_at} />
                                    {guarantor.customer ? <Link href={`/customers/${guarantor.customer.id}`} className="inline-flex"><AppButton variant="outline">{t('guarantors.viewCustomer')}</AppButton></Link> : null}
                                </div>
                            </AppCard>
                        </div>
                    </div>
                </PageContainer>
            </AppLayout>

            <ConfirmDeleteModal show={showDelete} title={t('guarantors.deleteGuarantor')} description={t('guarantors.deleteConfirm')} onClose={() => setShowDelete(false)} onConfirm={() => router.delete(`/guarantors/${guarantor.id}`, { preserveScroll: true, onSuccess: () => setShowDelete(false) })} />
        </>
    );
}
