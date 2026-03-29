import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppBadge } from '@/components/ui/app-badge';
import { AppSelect } from '@/components/ui/app-select';
import { TableSearch } from '@/components/tables/table-search';
import { TablePagination } from '@/components/tables/table-pagination';
import { EmptyState } from '@/components/feedback/empty-state';
import { useLocale } from '@/hooks/use-locale';

function StatCard({ title, value }) {
    return (
        <AppCard>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
        </AppCard>
    );
}

export default function GuarantorsIndex({ guarantors, filters, stats, customers }) {
    const { t } = useLocale();
    const { props } = usePage();

    const applyFilters = (next = {}) => {
        router.get('/guarantors', { ...filters, ...next }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const exportUrl = useMemo(() => {
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.status && filters.status !== 'all') params.set('status', filters.status);
        if (filters.customer_id && filters.customer_id !== 'all') params.set('customer_id', filters.customer_id);
        return `/guarantors-export${params.toString() ? `?${params.toString()}` : ''}`;
    }, [filters]);

    return (
        <>
            <Head title={t('guarantors.title')} />
            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={t('guarantors.listTitle')}
                        description={t('guarantors.listSubtitle')}
                        actions={<div className="flex flex-wrap gap-2"><a href={exportUrl}><AppButton variant="outline">{t('common.exportCsv')}</AppButton></a><Link href="/guarantors/create"><AppButton>{t('guarantors.addGuarantor')}</AppButton></Link></div>}
                    />

                    {props.flash?.success ? <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">{props.flash.success}</div> : null}

                    <div className="mb-6 grid gap-4 md:grid-cols-3">
                        <StatCard title={t('guarantors.totalGuarantors')} value={stats.total} />
                        <StatCard title={t('guarantors.activeGuarantors')} value={stats.active} />
                        <StatCard title={t('guarantors.inactiveGuarantors')} value={stats.inactive} />
                    </div>

                    <AppCard>
                        <div className="grid gap-4 md:grid-cols-3">
                            <TableSearch value={filters.search ?? ''} placeholder={t('guarantors.searchPlaceholder')} onChange={(value) => applyFilters({ search: value, page: 1 })} />
                            <AppSelect value={filters.status ?? 'all'} onChange={(e) => applyFilters({ status: e.target.value, page: 1 })}>
                                <option value="all">{t('guarantors.allStatus')}</option>
                                <option value="active">{t('guarantors.active')}</option>
                                <option value="inactive">{t('guarantors.inactive')}</option>
                            </AppSelect>
                            <AppSelect value={filters.customer_id ?? 'all'} onChange={(e) => applyFilters({ customer_id: e.target.value, page: 1 })}>
                                <option value="all">{t('guarantors.allCustomers')}</option>
                                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} ({customer.customer_code})</option>)}
                            </AppSelect>
                        </div>

                        {guarantors.data.length ? (
                            <div className="mt-6 overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                                    <thead>
                                        <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                            <th className="px-4 py-3">{t('guarantors.guarantorCode')}</th>
                                            <th className="px-4 py-3">{t('guarantors.name')}</th>
                                            <th className="px-4 py-3">{t('guarantors.customer')}</th>
                                            <th className="px-4 py-3">{t('guarantors.relationship')}</th>
                                            <th className="px-4 py-3">{t('guarantors.status')}</th>
                                            <th className="px-4 py-3">{t('guarantors.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 text-sm dark:divide-slate-800">
                                        {guarantors.data.map((guarantor) => (
                                            <tr key={guarantor.id}>
                                                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{guarantor.guarantor_code}</td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-slate-900 dark:text-slate-100">{guarantor.name}</p>
                                                    <p className="text-slate-500 dark:text-slate-400">{guarantor.phone}</p>
                                                </td>
                                                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{guarantor.customer ? `${guarantor.customer.name} (${guarantor.customer.customer_code})` : '-'}</td>
                                                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{guarantor.relationship || '-'}</td>
                                                <td className="px-4 py-3"><AppBadge variant={guarantor.status === 'active' ? 'success' : 'warning'}>{guarantor.status === 'active' ? t('guarantors.active') : t('guarantors.inactive')}</AppBadge></td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        <Link href={`/guarantors/${guarantor.id}`}><AppButton variant="outline" size="sm">{t('guarantors.viewGuarantor')}</AppButton></Link>
                                                        <Link href={`/guarantors/${guarantor.id}/edit`}><AppButton variant="outline" size="sm">{t('guarantors.editGuarantor')}</AppButton></Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="mt-6"><EmptyState title={t('guarantors.noGuarantors')} description={t('guarantors.listSubtitle')} /></div>
                        )}

                        <TablePagination links={guarantors.links} from={guarantors.from} to={guarantors.to} total={guarantors.total} previousPageUrl={guarantors.prev_page_url} nextPageUrl={guarantors.next_page_url} itemLabel="guarantors" />
                    </AppCard>
                </PageContainer>
            </AppLayout>
        </>
    );
}
