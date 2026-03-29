import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppButton } from '@/components/ui/app-button';
import { AppBadge } from '@/components/ui/app-badge';
import { AppCard } from '@/components/ui/app-card';
import { EmptyState } from '@/components/feedback/empty-state';
import { ConfirmDeleteModal } from '@/components/modals/confirm-delete-modal';
import { useLocale } from '@/hooks/use-locale';

function DetailItem({ label, value }) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{value || '-'}</p>
        </div>
    );
}

function PlaceholderAssetCard({ title, description, ready = false }) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-300 p-4 dark:border-slate-700">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
                </div>
                <AppBadge variant={ready ? 'success' : 'default'}>{ready ? 'Ready' : 'Pending'}</AppBadge>
            </div>
        </div>
    );
}

export default function CustomerShow({ customer }) {
    const { t } = useLocale();
    const { props } = usePage();
    const [showDelete, setShowDelete] = useState(false);

    return (
        <>
            <Head title={customer.name} />

            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={customer.name}
                        description={t('customers.recordSummarySubtitle')}
                        actions={
                            <div className="flex flex-wrap items-center gap-2">
                                <AppBadge variant={customer.status === 'active' ? 'success' : 'warning'}>
                                    {customer.status === 'active' ? t('customers.active') : t('customers.inactive')}
                                </AppBadge>
                                <Link href={`/documents/create?entity_type=customer&customer_id=${customer.id}`}><AppButton variant="secondary">{t('documents.addDocument')}</AppButton></Link>
                                {customer.portal_account ? (
                                    <Link href={`/customers/${customer.id}/portal-account/edit`}>
                                        <AppButton variant="secondary">{t('portal.managePortalAccess')}</AppButton>
                                    </Link>
                                ) : (
                                    <Link href={`/customers/${customer.id}/portal-account/create`}>
                                        <AppButton variant="secondary">{t('portal.createPortalAccount')}</AppButton>
                                    </Link>
                                )}
                                <Link href={`/customers/login`} target="_blank"> 
                                    <AppButton variant="outline">{t('portal.customerLoginTitle')}</AppButton>
                                </Link>
                                <Link href={`/customers/${customer.id}/edit`}>
                                    <AppButton variant="outline">{t('customers.editCustomer')}</AppButton>
                                </Link>
                                <AppButton
                                    variant="secondary"
                                    onClick={() => router.patch(`/customers/${customer.id}/archive`, {}, { preserveScroll: true })}
                                >
                                    {customer.status === 'active' ? t('customers.archiveCustomer') : t('customers.activateCustomer')}
                                </AppButton>
                                <AppButton variant="danger" onClick={() => setShowDelete(true)}>
                                    {t('customers.deleteCustomer')}
                                </AppButton>
                            </div>
                        }
                    />

                    {props.flash?.success ? (
                        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                            {props.flash.success}
                        </div>
                    ) : null}

                    <div className="grid gap-6 xl:grid-cols-3">
                        <div className="space-y-6 xl:col-span-2">
                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('customers.basicInfo')}</h2>
                                <div className="mt-5 grid gap-5 md:grid-cols-2">
                                    <DetailItem label={t('customers.name')} value={customer.name} />
                                    <DetailItem label={t('customers.phone')} value={customer.phone} />
                                    <DetailItem label={t('customers.email')} value={customer.email} />
                                    <DetailItem label={t('customers.nidNumber')} value={customer.nid_number} />
                                    <DetailItem label={t('customers.dateOfBirth')} value={customer.date_of_birth} />
                                    <DetailItem label={t('customers.gender')} value={customer.gender ? t(`customers.${customer.gender}`) : '-'} />
                                    <DetailItem label={t('customers.occupation')} value={customer.occupation} />
                                    <DetailItem label={t('customers.status')} value={customer.status === 'active' ? t('customers.active') : t('customers.inactive')} />
                                </div>
                            </AppCard>

                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('customers.familyInfo')}</h2>
                                <div className="mt-5 grid gap-5 md:grid-cols-2">
                                    <DetailItem label={t('customers.fatherName')} value={customer.father_name} />
                                    <DetailItem label={t('customers.motherName')} value={customer.mother_name} />
                                    <DetailItem label={t('customers.spouseName')} value={customer.spouse_name} />
                                </div>
                            </AppCard>

                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('customers.addressInfo')}</h2>
                                <div className="mt-5 grid gap-5 md:grid-cols-2">
                                    <DetailItem label={t('customers.presentAddress')} value={customer.present_address} />
                                    <DetailItem label={t('customers.permanentAddress')} value={customer.permanent_address} />
                                </div>
                            </AppCard>

                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('customers.additionalInfo')}</h2>
                                <div className="mt-5 grid gap-5">
                                    <DetailItem label={t('customers.notes')} value={customer.notes} />
                                </div>
                            </AppCard>

                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('customers.assetPreparation')}</h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('customers.assetPreparationSubtitle')}</p>
                                <div className="mt-5 grid gap-4 md:grid-cols-2">
                                    <PlaceholderAssetCard title={t('customers.customerPhoto')} description={t('customers.customerPhotoHelp')} ready={Boolean(customer.photo_path)} />
                                    <PlaceholderAssetCard title={t('customers.nidFront')} description={t('customers.nidFrontHelp')} ready={Boolean(customer.nid_front_path)} />
                                    <PlaceholderAssetCard title={t('customers.nidBack')} description={t('customers.nidBackHelp')} ready={Boolean(customer.nid_back_path)} />
                                </div>
                            </AppCard>


                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('customers.loanPreparation')}</h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('customers.loanPreparationSubtitle')}</p>
                                <div className="mt-5">
                                    {customer.documents?.length ? (
                                <AppCard>
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('documents.title')}</h2>
                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('documents.listSubtitle')}</p>
                                        </div>
                                        <Link href={`/documents/create?entity_type=customer&customer_id=${customer.id}`}><AppButton variant="outline">{t('documents.addDocument')}</AppButton></Link>
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        {customer.documents.map((document) => (
                                            <div key={document.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{document.title}</p>
                                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{document.document_code} · {document.document_type}</p>
                                                </div>
                                                <Link href={`/documents/${document.id}`} className="text-sm text-indigo-600 dark:text-indigo-400">{t('documents.viewDocument')}</Link>
                                            </div>
                                        ))}
                                    </div>
                                </AppCard>
                            ) : null}

                            {customer.loans?.length ? (
                                        <div className="space-y-3">
                                            <div className="flex justify-end">
                                                <Link href={`/loans/create?customer_id=${customer.id}`}><AppButton size="sm">{t('customers.addLoan')}</AppButton></Link>
                                            </div>
                                            {customer.loans.map((loan) => (
                                                <div key={loan.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                                        <div>
                                                            <p className="font-medium text-slate-900 dark:text-slate-100">{loan.loan_code}</p>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">{loan.start_date} • {loan.principal_amount} / {loan.total_payable}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <AppBadge variant={loan.status === 'active' ? 'success' : loan.status === 'closed' ? 'default' : 'warning'}>{t(`loans.${loan.status}`)}</AppBadge>
                                                            <Link href={`/loans/${loan.id}`}><AppButton variant="outline" size="sm">{t('customers.viewLoan')}</AppButton></Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <EmptyState
                                                title={t('customers.noLoanLinked')}
                                                description={t('customers.loanPreparationSubtitle')}
                                            />
                                            <div className="flex justify-start">
                                                <Link href={`/loans/create?customer_id=${customer.id}`}><AppButton>{t('customers.addLoan')}</AppButton></Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </AppCard>

                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('customers.guarantorPreparation')}</h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('customers.guarantorPreparationSubtitle')}</p>
                                <div className="mt-5">
                                    {customer.guarantors?.length ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{t('customers.linkedGuarantorsCount')}: {customer.guarantor_summary?.linked_count ?? customer.guarantors.length}</p>
                                                <Link href={`/guarantors/create?customer_id=${customer.id}`}><AppButton size="sm">{t('customers.addGuarantor')}</AppButton></Link>
                                            </div>
                                            {customer.guarantors.map((guarantor) => (
                                                <div key={guarantor.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                                        <div>
                                                            <p className="font-medium text-slate-900 dark:text-slate-100">{guarantor.name}</p>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">{guarantor.guarantor_code} • {guarantor.phone}</p>
                                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{guarantor.relationship || '-'}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <AppBadge variant={guarantor.status === 'active' ? 'success' : 'warning'}>{guarantor.status === 'active' ? t('customers.active') : t('customers.inactive')}</AppBadge>
                                                            <Link href={`/guarantors/${guarantor.id}`}><AppButton variant="outline" size="sm">{t('customers.viewGuarantor')}</AppButton></Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <EmptyState
                                                title={t('customers.noGuarantorLinked')}
                                                description={customer.guarantor_summary?.note ?? t('customers.guarantorPreparationSubtitle')}
                                            />
                                            <div className="flex justify-start">
                                                <Link href={`/guarantors/create?customer_id=${customer.id}`}><AppButton>{t('customers.addGuarantor')}</AppButton></Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </AppCard>
                        </div>

                        <div>
                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('customers.recordSummary')}</h2>
                                <div className="mt-5 space-y-5">
                                    <DetailItem label={t('customers.customerCode')} value={customer.customer_code} />
                                    <DetailItem label={t('customers.createdAt')} value={customer.created_at} />
                                    <DetailItem label={t('customers.updatedAt')} value={customer.updated_at} />
                                </div>
                            </AppCard>
                        </div>
                    </div>
                </PageContainer>
            </AppLayout>

            <ConfirmDeleteModal
                show={showDelete}
                title={t('customers.deleteCustomer')}
                description={t('customers.deleteConfirm')}
                onClose={() => setShowDelete(false)}
                onConfirm={() => router.delete(`/customers/${customer.id}`, { preserveScroll: true, onSuccess: () => setShowDelete(false) })}
            />
        </>
    );
}
