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

const money = (value, locale = 'en') => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 2 }).format(Number(value || 0));

export default function InstallmentsIndex({ installments, filters, stats }) {
    const { t, locale } = useLocale();

    const exportUrl = useMemo(() => {
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.status && filters.status !== 'all') params.set('status', filters.status);
        if (filters.date_from) params.set('date_from', filters.date_from);
        if (filters.date_to) params.set('date_to', filters.date_to);
        return `/installments-export${params.toString() ? `?${params.toString()}` : ''}`;
    }, [filters]);
    const updateFilter = (key, value) => {
        router.get('/installments', { ...filters, [key]: value }, { preserveState: true, replace: true });
    };
    const clearFilters = () => router.get('/installments', { search: '', status: 'all', date_from: '', date_to: '' }, { preserveState: true, replace: true });

    return (
        <>
            <Head title={t('installments.title')} />
            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={t('installments.listTitle')}
                        description={t('installments.listSubtitle')}
                        actions={<div className="flex flex-wrap gap-2"><a href={exportUrl}><AppButton variant="outline">{t('common.exportCsv')}</AppButton></a><Link href="/installments/create"><AppButton>{t('installments.generateSchedule')}</AppButton></Link></div>}
                    />

                    <div className="grid gap-4 md:grid-cols-4 mb-6">
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('installments.totalInstallments')}</p><p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.total}</p></AppCard>
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('installments.pendingInstallments')}</p><p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.pending}</p></AppCard>
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('installments.paidInstallments')}</p><p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.paid}</p></AppCard>
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('installments.overdueInstallments')}</p><p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.overdue}</p></AppCard>
                    </div>

                    <AppCard className="mb-6">
                        <div className="grid gap-4 md:grid-cols-4">
                            <AppInput value={filters.search ?? ''} onChange={(e) => updateFilter('search', e.target.value)} placeholder={t('installments.searchPlaceholder')} />
                            <AppSelect value={filters.status ?? 'all'} onChange={(e) => updateFilter('status', e.target.value)}>
                                <option value="all">{t('installments.allStatus')}</option>
                                <option value="pending">{t('installments.pending')}</option>
                                <option value="partial">{t('installments.partial')}</option>
                                <option value="paid">{t('installments.paid')}</option>
                                <option value="overdue">{t('installments.overdue')}</option>
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
                                        {[t('installments.loan'), t('installments.customer'), t('installments.installmentNo'), t('installments.dueDate'), t('installments.amount'), t('installments.paid'), t('installments.status'), t('installments.actions')].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{h}</th>)}
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
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{item.status}</td>
                                            <td className="px-4 py-3 text-sm"><Link href={`/loans/${item.loan?.id}/installments`} className="text-indigo-600">{t('installments.viewSchedule')}</Link></td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="8" className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">{t('installments.noInstallments')}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4"><TablePagination links={installments.links} from={installments.from} to={installments.to} total={installments.total} previousPageUrl={installments.prev_page_url} nextPageUrl={installments.next_page_url} itemLabel="installments" /></div>
                    </AppCard>
                </PageContainer>
            </AppLayout>
        </>
    );
}
