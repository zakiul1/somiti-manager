import { Head, Link, router } from '@inertiajs/react';
import { useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppCard } from '@/components/ui/app-card';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { AppSelect } from '@/components/ui/app-select';
import { TablePagination } from '@/components/tables/table-pagination';
import { useLocale } from '@/hooks/use-locale';
import { InstallmentStatusBadge } from '@/components/installments/installment-status-badge';
import InstallmentDashboard from './partials/installment-dashboard';
import DueOverduePanel from './partials/due-overdue-panel';

const money = (value, locale = 'en') => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 2 }).format(Number(value || 0));

function SummaryCard({ label, value, hint = null }) {
    return (
        <AppCard>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
            {hint ? <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
        </AppCard>
    );
}

export default function InstallmentsIndex({ installments, filters, stats, overview }) {
    const { t, locale } = useLocale();
    const activeTab = filters.tab || 'overview';

    const exportUrl = useMemo(() => {
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.status && filters.status !== 'all') params.set('status', filters.status);
        if (filters.date_from) params.set('date_from', filters.date_from);
        if (filters.date_to) params.set('date_to', filters.date_to);
        return `/installments-export${params.toString() ? `?${params.toString()}` : ''}`;
    }, [filters]);

    const updateFilter = (key, value) => {
        router.get(route('installments.index'), { ...filters, [key]: value, tab: 'all' }, { preserveState: true, replace: true, preserveScroll: true });
    };

    const switchTab = (tab) => {
        router.get(route('installments.index'), { ...filters, tab }, { preserveState: true, replace: true, preserveScroll: true });
    };

    const clearFilters = () => router.get(route('installments.index'), { search: '', status: 'all', date_from: '', date_to: '', tab: 'all' }, { preserveState: true, replace: true, preserveScroll: true });

    const dueItems = [...(overview.overdue_items || []), ...(overview.due_today_items || [])]
        .sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''));

    return (
        <>
            <Head title={t('installments.title')} />
            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={t('installments.listTitle')}
                        description={t('installments.listSubtitle')}
                        actions={<div className="flex flex-wrap gap-2"><a href={exportUrl}><AppButton variant="outline">{t('common.exportCsv')}</AppButton></a><Link href={route('installments.create')}><AppButton>{t('installments.generateSchedule')}</AppButton></Link></div>}
                    />

                    <div className="mb-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
                        <SummaryCard label={t('installments.totalInstallments')} value={stats.total} />
                        <SummaryCard label={t('installments.pendingInstallments')} value={stats.pending} />
                        <SummaryCard label={t('installments.paidInstallments')} value={stats.paid} />
                        <SummaryCard label={t('installments.overdueInstallments')} value={stats.overdue} />
                        <SummaryCard label={t('installments.dueToday')} value={stats.due_today} />
                        <SummaryCard label={t('installments.customersWithOpenInstallments')} value={stats.customers_with_open} />
                    </div>

                    <AppCard className="mb-6 p-2">
                        <div className="flex flex-wrap gap-2">
                            {[
                                ['overview', t('installments.overview')],
                                ['due', t('installments.dueOverdue')],
                                ['customers', t('installments.customersTab')],
                                ['all', t('installments.allInstallmentsTab')],
                            ].map(([key, label]) => key === 'customers' ? (
                                <Link key={key} href={route('installments.customers')} className={`rounded-xl px-4 py-2 text-sm font-medium ${activeTab === key ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                                    {label}
                                </Link>
                            ) : (
                                <button key={key} type="button" onClick={() => switchTab(key)} className={`rounded-xl px-4 py-2 text-sm font-medium ${activeTab === key ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </AppCard>

                    {activeTab === 'overview' ? <InstallmentDashboard overview={overview} /> : null}

                    {activeTab === 'due' ? <DueOverduePanel items={dueItems} /> : null}

                    {activeTab === 'all' ? (
                        <>
                            <AppCard className="mb-6">
                                <div className="grid gap-4 md:grid-cols-4">
                                    <AppInput value={filters.search ?? ''} onChange={(e) => updateFilter('search', e.target.value)} placeholder={t('installments.searchPlaceholder')} />
                                    <AppSelect value={filters.status ?? 'all'} onChange={(e) => updateFilter('status', e.target.value)}>
                                        <option value="all">{t('installments.allStatus')}</option>
                                        <option value="pending">{t('installments.pending')}</option>
                                        <option value="partial">{t('installments.partial')}</option>
                                        <option value="paid">{t('installments.paidStatus')}</option>
                                        <option value="overdue">{t('installments.overdue')}</option>
                                        <option value="due_today">{t('installments.dueToday')}</option>
                                    </AppSelect>
                                    <AppInput type="date" value={filters.date_from ?? ''} onChange={(e) => updateFilter('date_from', e.target.value)} />
                                    <div className="flex gap-2"><AppInput type="date" value={filters.date_to ?? ''} onChange={(e) => updateFilter('date_to', e.target.value)} /><AppButton variant="outline" onClick={clearFilters}>{t('common.clearFilters')}</AppButton></div>
                                </div>
                            </AppCard>

                            <AppCard className="overflow-hidden p-0">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                                        <thead className="bg-slate-50 dark:bg-slate-950/50">
                                            <tr>
                                                {[t('installments.loan'), t('installments.customer'), t('installments.installmentNo'), t('installments.dueDate'), t('installments.amount'), t('installments.paid'), t('installments.outstanding'), t('installments.status'), t('installments.actions')].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{h}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                            {installments.data.length ? installments.data.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">{item.loan?.loan_code ?? '-'}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">{item.customer?.name ?? '-'}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{item.installment_no}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{item.due_date}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{money(item.installment_amount, locale)}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{money(item.paid_amount, locale)}</td>
                                                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">{money(item.outstanding_amount, locale)}</td>
                                                    <td className="px-4 py-3 text-sm"><InstallmentStatusBadge status={item.status} /></td>
                                                    <td className="px-4 py-3 text-sm"><div className="flex flex-wrap gap-2"><Link href={route('payments.create', { installment_id: item.id })} className="text-indigo-600">{t('installments.collectPayment')}</Link><Link href={route('installments.customers.show', item.customer?.id)} className="text-slate-600 dark:text-slate-300">{t('installments.viewCustomer')}</Link></div></td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="9" className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">{t('installments.noInstallments')}</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-4"><TablePagination links={installments.links} from={installments.from} to={installments.to} total={installments.total} previousPageUrl={installments.prev_page_url} nextPageUrl={installments.next_page_url} itemLabel="installments" /></div>
                            </AppCard>
                        </>
                    ) : null}
                </PageContainer>
            </AppLayout>
        </>
    );
}
