import { Head, Link, router } from '@inertiajs/react';
import { useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppCard } from '@/components/ui/app-card';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { AppSelect } from '@/components/ui/app-select';
import { AppBadge } from '@/components/ui/app-badge';
import { TablePagination } from '@/components/tables/table-pagination';
import { useLocale } from '@/hooks/use-locale';

const money = (value, locale = 'en') => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 2 }).format(Number(value || 0));

export default function PaymentsIndex({ payments, filters, stats, collectorOptions = [] }) {
    const { t, locale } = useLocale();

    const exportUrl = useMemo(() => {
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.payment_method && filters.payment_method !== 'all') params.set('payment_method', filters.payment_method);
        if (filters.collector_id && filters.collector_id !== 'all') params.set('collector_id', filters.collector_id);
        if (filters.date_from) params.set('date_from', filters.date_from);
        if (filters.date_to) params.set('date_to', filters.date_to);
        return `/payments-export${params.toString() ? `?${params.toString()}` : ''}`;
    }, [filters]);

    const updateFilter = (key, value) => {
        router.get('/payments', { ...filters, [key]: value }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        router.get('/payments', { search: '', payment_method: 'all', collector_id: 'all', date_from: '', date_to: '' }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title={t('payments.title')} />
            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={t('payments.listTitle')}
                        description={t('payments.listSubtitle')}
                        actions={<div className="flex flex-wrap gap-2"><a href={exportUrl}><AppButton variant="outline">{t('common.exportCsv')}</AppButton></a><Link href="/payments/create"><AppButton>{t('payments.collectPayment')}</AppButton></Link></div>}
                    />

                    <div className="mb-6 grid gap-4 md:grid-cols-4">
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('payments.totalPayments')}</p><p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.total}</p></AppCard>
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('payments.totalCollected')}</p><p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{money(stats.total_amount, locale)}</p></AppCard>
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('payments.collectedToday')}</p><p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{money(stats.today_amount, locale)}</p></AppCard>
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('payments.cashPayments')}</p><p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.cash_count}</p></AppCard>
                    </div>

                    <AppCard className="mb-6">
                        <div className="grid gap-4 md:grid-cols-5">
                            <AppInput value={filters.search ?? ''} onChange={(e) => updateFilter('search', e.target.value)} placeholder={t('payments.searchPlaceholder')} />
                            <AppSelect value={filters.payment_method ?? 'all'} onChange={(e) => updateFilter('payment_method', e.target.value)}>
                                <option value="all">{t('payments.allMethods')}</option>
                                <option value="cash">{t('payments.cash')}</option>
                                <option value="bank">{t('payments.bank')}</option>
                                <option value="mobile_banking">{t('payments.mobileBanking')}</option>
                            </AppSelect>
                            <AppSelect value={filters.collector_id ?? 'all'} onChange={(e) => updateFilter('collector_id', e.target.value)}>
                                <option value="all">{t('staffWorkflow.allStaff')}</option>
                                {collectorOptions.map((collector) => <option key={collector.id} value={collector.id}>{collector.name}</option>)}
                            </AppSelect>
                            <AppInput type="date" value={filters.date_from ?? ''} onChange={(e) => updateFilter('date_from', e.target.value)} />
                            <div className="flex gap-2">
                                <AppInput type="date" value={filters.date_to ?? ''} onChange={(e) => updateFilter('date_to', e.target.value)} />
                                <AppButton variant="outline" onClick={clearFilters}>{t('common.clearFilters')}</AppButton>
                            </div>
                        </div>
                    </AppCard>

                    <AppCard className="overflow-hidden p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                                <thead className="bg-slate-50 dark:bg-slate-950/50">
                                    <tr>
                                        {[t('payments.paymentCode'), t('payments.loan'), t('payments.customer'), t('payments.installment'), t('reports.date'), t('payments.paymentMethod'), t('staffWorkflow.collectedBy'), t('payments.amount'), t('customers.actions')].map((header) => (
                                            <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {payments.data.length ? payments.data.map((payment) => (
                                        <tr key={payment.id}>
                                            <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">{payment.payment_code}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{payment.loan?.loan_code ?? '-'}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{payment.customer?.name ?? '-'}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">#{payment.installment?.installment_no ?? '-'}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{payment.payment_date}</td>
                                            <td className="px-4 py-3 text-sm"><AppBadge variant={payment.payment_method === 'cash' ? 'success' : payment.payment_method === 'bank' ? 'default' : 'warning'}>{t(`payments.${payment.payment_method}`)}</AppBadge></td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{payment.collector ?? '-'}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{money(payment.amount, locale)}</td>
                                            <td className="px-4 py-3 text-sm"><Link href={`/payments/${payment.id}`} className="text-indigo-600 dark:text-indigo-400">{t('payments.viewPayment')}</Link></td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="9" className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">{t('payments.noPayments')}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4"><TablePagination links={payments.links} from={payments.from} to={payments.to} total={payments.total} previousPageUrl={payments.prev_page_url} nextPageUrl={payments.next_page_url} itemLabel="payments" /></div>
                    </AppCard>
                </PageContainer>
            </AppLayout>
        </>
    );
}
