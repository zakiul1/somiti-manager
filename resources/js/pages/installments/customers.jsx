import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppCard } from '@/components/ui/app-card';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { TablePagination } from '@/components/tables/table-pagination';
import { useLocale } from '@/hooks/use-locale';

const money = (value, locale = 'en') => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 2 }).format(Number(value || 0));

export default function InstallmentCustomers({ customers, filters }) {
    const { t, locale } = useLocale();

    const updateSearch = (value) => {
        router.get(route('installments.customers'), { search: value }, { preserveState: true, replace: true, preserveScroll: true });
    };

    return (
        <>
            <Head title={t('installments.customersTab')} />
            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={t('installments.customersTab')}
                        description={t('installments.customersSubtitle')}
                        actions={<div className="flex flex-wrap gap-2"><Link href={route('installments.index', { tab: 'overview' })}><AppButton variant="outline">{t('installments.overview')}</AppButton></Link><Link href={route('installments.index', { tab: 'all' })}><AppButton variant="outline">{t('installments.allInstallmentsTab')}</AppButton></Link></div>}
                    />

                    <AppCard className="mb-6">
                        <AppInput value={filters.search ?? ''} onChange={(e) => updateSearch(e.target.value)} placeholder={t('installments.customerSearchPlaceholder')} />
                    </AppCard>

                    <AppCard className="overflow-hidden p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                                <thead className="bg-slate-50 dark:bg-slate-950/50">
                                    <tr>
                                        {[t('installments.customer'), t('customers.customerCode'), t('loans.activeLoans'), t('installments.pendingInstallments'), t('installments.overdueInstallments'), t('installments.overdueAmount'), t('installments.nextDueDate'), t('installments.lastPaymentDate'), t('installments.actions')].map((h) => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {customers.data.length ? customers.data.map((customer) => (
                                        <tr key={customer.id}>
                                            <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">{customer.name}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{customer.customer_code}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{customer.active_loans_count}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{customer.pending_installments_count}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{customer.overdue_installments_count}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">{money(customer.overdue_amount, locale)}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{customer.next_due_date || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{customer.last_payment_date || '-'}</td>
                                            <td className="px-4 py-3 text-sm"><Link href={route('installments.customers.show', customer.id)} className="text-indigo-600">{t('installments.viewInstallments')}</Link></td>
                                        </tr>
                                    )) : <tr><td colSpan="9" className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">{t('installments.noCustomerInstallments')}</td></tr>}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4"><TablePagination links={customers.links} from={customers.from} to={customers.to} total={customers.total} previousPageUrl={customers.prev_page_url} nextPageUrl={customers.next_page_url} itemLabel="customers" /></div>
                    </AppCard>
                </PageContainer>
            </AppLayout>
        </>
    );
}
