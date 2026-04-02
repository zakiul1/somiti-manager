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

function StatCard({ title, value, hint }) {
    return (
        <AppCard>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
            {hint ? <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
        </AppCard>
    );
}

function StatusBadge({ status, t }) {
    const variant = status === 'active' ? 'success' : status === 'closed' ? 'default' : 'danger';
    return <AppBadge variant={variant}>{t(`loans.${status}`)}</AppBadge>;
}

function money(value, locale = 'en') {
    return new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value || 0));
}

export default function LoansIndex({ loans, filters, stats, customers }) {
    const { t, locale } = useLocale();
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

                    <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <StatCard title={t('loans.totalLoans')} value={stats.total} hint={t('loans.totalLoansHint')} />
                        <StatCard title={t('loans.activeLoans')} value={stats.active} hint={t('loans.activeLoansHint')} />
                        <StatCard title={t('loans.closedLoans')} value={stats.closed} hint={t('loans.closedLoansHint')} />
                        <StatCard title={t('loans.defaultedLoans')} value={stats.defaulted} hint={t('loans.defaultedLoansHint')} />
                    </div>

                    <AppCard>
                        <div className="grid gap-4 md:grid-cols-3">
                            <TableSearch value={filters.search ?? ''} placeholder={t('loans.searchPlaceholder')} onChange={(value) => applyFilters({ search: value, page: 1 })} />
                            <AppSelect value={filters.status ?? 'all'} onChange={(e) => applyFilters({ status: e.target.value, page: 1 })}>
                                <option value="all">{t('loans.allStatus')}</option>
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
                            <div className="mt-6 space-y-4">
                                {loans.data.map((loan) => (
                                    <div key={loan.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{loan.loan_code}</h3>
                                                    <StatusBadge status={loan.status} t={t} />
                                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">{t(`loans.${loan.collection_frequency}`)}</span>
                                                </div>

                                                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                                    <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                                                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('loans.customer')}</p>
                                                        <p className="mt-2 truncate font-medium text-slate-900 dark:text-slate-100">{loan.customer ? loan.customer.name : '-'}</p>
                                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{loan.customer ? `${loan.customer.customer_code} • ${loan.customer.phone || '-'}` : '-'}</p>
                                                    </div>

                                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                                                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('loans.portfolioSummary')}</p>
                                                        <p className="mt-2 font-medium text-slate-900 dark:text-slate-100">{money(loan.principal_amount, locale)}</p>
                                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('loans.totalPayable')}: {money(loan.total_payable, locale)}</p>
                                                    </div>

                                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                                                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('payments.remainingBalance')}</p>
                                                        <p className="mt-2 font-medium text-slate-900 dark:text-slate-100">{money(loan.financial_summary?.remaining_balance, locale)}</p>
                                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('payments.totalPaid')}: {money(loan.financial_summary?.total_paid, locale)}</p>
                                                    </div>

                                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                                                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('loans.nextCollection')}</p>
                                                        <p className="mt-2 font-medium text-slate-900 dark:text-slate-100">{loan.financial_summary?.next_due_date || t('loans.noNextCollection')}</p>
                                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('payments.nextDueAmount')}: {money(loan.financial_summary?.next_due_amount, locale)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 xl:justify-end">
                                                <Link href={`/loans/${loan.id}`}><AppButton variant="outline" size="sm">{t('loans.viewLoan')}</AppButton></Link>
                                                <Link href={`/loans/${loan.id}/edit`}><AppButton variant="outline" size="sm">{t('loans.editLoan')}</AppButton></Link>
                                                {loan.status !== 'closed' ? <Link href={`/payments/create?loan_id=${loan.id}`}><AppButton size="sm">{t('payments.collectPayment')}</AppButton></Link> : null}
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('loans.guarantorCoverage')}</p>
                                                <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{loan.guarantor_count}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{t('loans.guarantorsLinked')}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('payments.openInstallments')}</p>
                                                <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{loan.installment_summary?.open ?? 0}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{t('installments.overdue')}: {loan.installment_summary?.overdue ?? 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('payments.overdueAmount')}</p>
                                                <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{money(loan.financial_summary?.overdue_amount, locale)}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{loan.duration_label}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('loans.assignedStaff')}</p>
                                                <p className="mt-2 truncate text-base font-semibold text-slate-900 dark:text-slate-100">{loan.assigned_staff?.name || t('common.unassigned')}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{loan.start_date || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
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
