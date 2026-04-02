import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppBadge } from '@/components/ui/app-badge';
import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
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

export default function DocumentsShow({ document }) {
    const { t } = useLocale();
    const { props } = usePage();
    const [showDelete, setShowDelete] = useState(false);
    const badgeVariant = { active: 'success', expired: 'danger', archived: 'warning', draft: 'default' }[document.status] ?? 'default';

    return (
        <>
            <Head title={document.document_code} />
            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={document.title}
                        description={document.document_code}
                        actions={<div className="flex flex-wrap gap-2">
                            <AppBadge variant={badgeVariant}>{t(`documents.${document.status}`)}</AppBadge>
                            {document.file_url ? <a href={document.file_url} target="_blank" rel="noreferrer"><AppButton variant="ghost">{t('documents.downloadFile')}</AppButton></a> : null}
                            <Link href={`/documents/${document.id}/edit`}><AppButton variant="outline">{t('documents.editDocument')}</AppButton></Link>
                            <AppButton variant="danger" onClick={() => setShowDelete(true)}>{t('documents.deleteDocument')}</AppButton>
                        </div>}
                    />

                    {props.flash?.success ? <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">{props.flash.success}</div> : null}

                    <div className="grid gap-6 xl:grid-cols-3">
                        <div className="space-y-6 xl:col-span-2">
                            <AppCard>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <DetailItem label={t('documents.documentType')} value={document.document_type} />
                                    <DetailItem label={t('documents.linkWith')} value={t(`documents.${document.entity_type}`)} />
                                    <DetailItem label={t('documents.issueDate')} value={document.issue_date} />
                                    <DetailItem label={t('documents.expiryDate')} value={document.expiry_date} />
                                    <DetailItem label={t('documents.fileReference')} value={document.file_reference} />
                                    <DetailItem label={t('documents.notes')} value={document.notes} />
                                </div>
                            </AppCard>

                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('documents.fileStorage')}</h2>
                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    <DetailItem label={t('documents.storageStatus')} value={document.has_file ? t('documents.fileStored') : t('documents.noFileStored')} />
                                    <DetailItem label={t('documents.fileName')} value={document.original_file_name} />
                                    <DetailItem label={t('documents.fileType')} value={document.mime_type} />
                                    <DetailItem label={t('documents.fileSize')} value={document.readable_file_size} />
                                </div>
                            </AppCard>

                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('documents.linkedRecord')}</h2>
                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    {document.customer ? (
                                        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{document.customer.name}</p>
                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{document.customer.customer_code}</p>
                                            <Link href={`/customers/${document.customer.id}`} className="mt-3 inline-block text-sm text-indigo-600 dark:text-indigo-400">{t('documents.openCustomer')}</Link>
                                        </div>
                                    ) : null}
                                    {document.loan ? (
                                        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{document.loan.loan_code}</p>
                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t(`loans.${document.loan.status}`)}</p>
                                            <Link href={`/loans/${document.loan.id}`} className="mt-3 inline-block text-sm text-indigo-600 dark:text-indigo-400">{t('documents.openLoan')}</Link>
                                        </div>
                                    ) : null}
                                </div>
                            </AppCard>
                        </div>

                        <AppCard>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('documents.recordSummary')}</h2>
                            <div className="mt-4 space-y-4">
                                <DetailItem label={t('documents.createdAt')} value={document.created_at} />
                                <DetailItem label={t('documents.updatedAt')} value={document.updated_at} />
                            </div>
                        </AppCard>
                    </div>

                    <ConfirmDeleteModal
                        open={showDelete}
                        title={t('documents.deleteDocument')}
                        description={t('documents.deleteConfirm')}
                        onClose={() => setShowDelete(false)}
                        onConfirm={() => router.delete(`/documents/${document.id}`)}
                    />
                </PageContainer>
            </AppLayout>
        </>
    );
}
