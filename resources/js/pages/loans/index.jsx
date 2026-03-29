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

function money(value) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(value ?? 0);
}

export default function LoansIndex({ loans, filters, stats, customers }) {
    const { t } = useLocale();
    const { props } = usePage();

    const applyFilters = (next = {}) => {
        router.get('/loans', { ...filters, ...next }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const exportUrl = useMemo(() => {
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.status && filters.status !== 'all') params.set('status', filters.status);
        if (filters.customer_id && filters.customer_id !== 'all') params.set('customer_id', filters.customer_id);
        return `/loans-export${params.toString() ? `?${params.toString()}` : ''}`;
    }, [filters]);

    return (
        <>
            <Head title={t('loans.title')} />
            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={t('loans.listTitle')}
                        description={t('loans.listSubtitle')}
                        actions={<div className="flex flex-wrap gap-2"><a href={exportUrl}><AppButton variant="outline">{t('common.exportCsv')}</AppButton></a><Link href="/loans/create"><AppButton>{t('loans.addLoan')}</AppButton></Link></div>}
                    />

                    {props.flash?.success ? <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">{props.flash.success}</div> : null}

                    <div className="mb-6 grid gap-4 md:grid-cols-4">
                        <StatCard title={t('loans.totalLoans')} value={stats.total} />
                        <StatCard title={t('loans.activeLoans')} value={stats.active} />
                        <StatCard title={t('loans.draftLoans')} value={stats.draft} />
                        <StatCard title={t('loans.approvedLoans')} value={stats.approved} />
                        <StatCard title={t('loans.closedLoans')} value={stats.closed} />
                    </div>

                    <AppCard>
                        <div className="grid gap-4 md:grid-cols-3">
                            <TableSearch value={filters.search ?? ''} placeholder={t('loans.searchPlaceholder')} onChange={(value) => applyFilters({ search: value, page: 1 })} />
                            <AppSelect value={filters.status ?? 'all'} onChange={(e) => applyFilters({ status: e.target.value, page: 1 })}>
                                <option value="all">{t('loans.allStatus')}</option>
                                <option value="draft">{t('loans.draft')}</option>
                                <option value="approved">{t('loans.approved')}</option>
                                <option value="active">{t('loans.active')}</option>
                                <option value="closed">{t('loans.closed')}</option>
                                <option value="defaulted">{t('loans.defaulted')}</option>
                            </AppSelect>
                            <AppSelect value={filters.customer_id ?? 'all'} onChange={(e) => applyFilters({ customer_id: e.target.value, page: 1 })}>
                                <option value="all">{t('loans.allCustomers')}</option>
                                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} ({customer.customer_code})</option>)}
                            </AppSelect>
                        </div>

                        {loans.data.length ? (
                            <div className="mt-6 overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                                    <thead>
                                        <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                            <th className="px-4 py-3">{t('loans.loanCode')}</th>
                                            <th className="px-4 py-3">{t('loans.customer')}</th>
                                            <th className="px-4 py-3">{t('loans.principalAmount')}</th>
                                            <th className="px-4 py-3">{t('loans.totalPayable')}</th>
                                            <th className="px-4 py-3">{t('loans.frequency')}</th>
                                            <th className="px-4 py-3">{t('loans.status')}</th>
                                            <th className="px-4 py-3">{t('loans.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 text-sm dark:divide-slate-800">
                                        {loans.data.map((loan) => (
                                            <tr key={loan.id}>
                                                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                                                    <p className="font-medium text-slate-900 dark:text-slate-100">{loan.loan_code}</p>
                                                    <p className="text-slate-500 dark:text-slate-400">{loan.duration_label}</p>
                                                </td>
                                                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                                                    {loan.customer ? `${loan.customer.name} (${loan.customer.customer_code})` : '-'}
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{loan.guarantor_count} {t('loans.guarantorsLinked')}</p>
                                                </td>
                                                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{money(loan.principal_amount)}</td>
                                                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{money(loan.total_payable)}<p className="text-xs text-slate-500 dark:text-slate-400">{loan.disbursed_at ? `${t('loans.disbursedOn')}: ${loan.disbursed_at}` : loan.approved_at ? `${t('loans.approvedOn')}: ${loan.approved_at}` : t('loans.notDisbursedYet')}</p></td>
                                                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{t(`loans.${loan.collection_frequency}`)}</td>
                                                <td className="px-4 py-3"><AppBadge variant={loan.status === 'active' ? 'success' : loan.status === 'approved' ? 'default' : loan.status === 'closed' ? 'default' : loan.status === 'defaulted' ? 'danger' : 'warning'}>{t(`loans.${loan.status}`)}</AppBadge></td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        <Link href={`/loans/${loan.id}`}><AppButton variant="outline" size="sm">{t('loans.viewLoan')}</AppButton></Link>
                                                        <Link href={`/loans/${loan.id}/edit`}><AppButton variant="outline" size="sm">{t('loans.editLoan')}</AppButton></Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="mt-6">
                                <EmptyState title={t('loans.noLoans')} description={t('loans.listSubtitle')} actionLabel={t('loans.addLoan')} onAction={() => router.visit('/loans/create')} />
                            </div>
                        )}

                        <TablePagination links={loans.links} from={loans.from} to={loans.to} total={loans.total} previousPageUrl={loans.prev_page_url} nextPageUrl={loans.next_page_url} itemLabel="loans" />
                    </AppCard>
                </PageContainer>
            </AppLayout>
        </>
    );
}
