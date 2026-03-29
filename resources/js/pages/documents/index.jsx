import { Head, Link, router } from '@inertiajs/react';
import { useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppBadge } from '@/components/ui/app-badge';
import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppInput } from '@/components/ui/app-input';
import { AppSelect } from '@/components/ui/app-select';
import { TablePagination } from '@/components/tables/table-pagination';
import { useLocale } from '@/hooks/use-locale';

export default function DocumentsIndex({ documents, filters, stats }) {
    const { t } = useLocale();

    const updateFilter = (key, value) => {
        router.get('/documents', { ...filters, [key]: value }, { preserveState: true, replace: true });
    };

    const clearFilters = () => router.get('/documents', { search: '', entity_type: '', status: '', document_type: '' }, { preserveState: true, replace: true });

    const badgeVariant = (status) => ({ active: 'success', expired: 'danger', archived: 'warning', draft: 'default' }[status] ?? 'default');

    const exportUrl = useMemo(() => {
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.entity_type) params.set('entity_type', filters.entity_type);
        if (filters.status) params.set('status', filters.status);
        if (filters.document_type) params.set('document_type', filters.document_type);
        return `/documents-export${params.toString() ? `?${params.toString()}` : ''}`;
    }, [filters]);

    return (
        <>
            <Head title={t('documents.title')} />
            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={t('documents.listTitle')}
                        description={t('documents.listSubtitle')}
                        actions={<div className="flex flex-wrap gap-2"><a href={exportUrl}><AppButton variant="outline">{t('common.exportCsv')}</AppButton></a><Link href="/documents/create"><AppButton>{t('documents.addDocument')}</AppButton></Link></div>}
                    />

                    <div className="mb-6 grid gap-4 md:grid-cols-5">
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('documents.totalDocuments')}</p><p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.total}</p></AppCard>
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('documents.activeDocuments')}</p><p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.active}</p></AppCard>
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('documents.storedFiles')}</p><p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.storedFiles}</p></AppCard>
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('documents.expiringSoon')}</p><p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.expiring}</p></AppCard>
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('documents.expiredDocuments')}</p><p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.expired}</p></AppCard>
                    </div>

                    <AppCard className="mb-6">
                        <div className="grid gap-4 md:grid-cols-4">
                            <div>
                                <AppInput value={filters.search ?? ''} onChange={(e) => updateFilter('search', e.target.value)} placeholder={t('documents.searchPlaceholder')} />
                            </div>
                            <div>
                                <AppSelect value={filters.entity_type ?? ''} onChange={(e) => updateFilter('entity_type', e.target.value)}>
                                    <option value="">{t('documents.allEntities')}</option>
                                    <option value="customer">{t('documents.customer')}</option>
                                    <option value="loan">{t('documents.loan')}</option>
                                </AppSelect>
                            </div>
                            <div>
                                <AppSelect value={filters.status ?? ''} onChange={(e) => updateFilter('status', e.target.value)}>
                                    <option value="">{t('documents.allStatuses')}</option>
                                    <option value="draft">{t('documents.draft')}</option>
                                    <option value="active">{t('documents.active')}</option>
                                    <option value="expired">{t('documents.expired')}</option>
                                    <option value="archived">{t('documents.archived')}</option>
                                </AppSelect>
                            </div>
                            <div className="flex gap-2">
                                <AppInput value={filters.document_type ?? ''} onChange={(e) => updateFilter('document_type', e.target.value)} placeholder={t('documents.documentType')} />
                                <AppButton variant="outline" onClick={clearFilters}>{t('common.clearFilters')}</AppButton>
                            </div>
                        </div>
                    </AppCard>

                    <AppCard className="overflow-hidden p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                                <thead className="bg-slate-50 dark:bg-slate-900/50">
                                    <tr>
                                        {['documentCode', 'titleLabel', 'documentType', 'linkedTo', 'storage', 'status', 'expiryDate', 'actions'].map((key) => (
                                            <th key={key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t(`documents.${key}`)}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
                                    {documents.data.map((document) => (
                                        <tr key={document.id}>
                                            <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">{document.document_code}</td>
                                            <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{document.title}</td>
                                            <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{document.document_type}</td>
                                            <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                                                {document.entity_type === 'customer' && document.customer ? `${document.customer.name} (${document.customer.customer_code})` : null}
                                                {document.entity_type === 'loan' && document.loan ? document.loan.loan_code : null}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                                                {document.has_file ? (
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-slate-100">{document.original_file_name ?? t('documents.fileStored')}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{document.readable_file_size ?? '-'}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 dark:text-slate-500">{t('documents.noFileStored')}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm"><AppBadge variant={badgeVariant(document.status)}>{t(`documents.${document.status}`)}</AppBadge></td>
                                            <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{document.expiry_date ?? '-'}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <div className="flex flex-wrap gap-2">
                                                    <Link href={`/documents/${document.id}`}><AppButton variant="outline" size="sm">{t('documents.viewDocument')}</AppButton></Link>
                                                    {document.file_url ? <a href={document.file_url} target="_blank" rel="noreferrer"><AppButton variant="ghost" size="sm">{t('documents.downloadFile')}</AppButton></a> : null}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {documents.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">{t('documents.emptyState')}</td>
                                        </tr>
                                    ) : null}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4"><TablePagination links={documents.links} from={documents.from} to={documents.to} total={documents.total} previousPageUrl={documents.prev_page_url} nextPageUrl={documents.next_page_url} itemLabel="documents" /></div>
                    </AppCard>
                </PageContainer>
            </AppLayout>
        </>
    );
}
