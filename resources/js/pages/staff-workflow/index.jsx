import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppCard } from '@/components/ui/app-card';
import { AppInput } from '@/components/ui/app-input';
import { AppSelect } from '@/components/ui/app-select';
import { useLocale } from '@/hooks/use-locale';

const money = (value, locale = 'en') => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 2 }).format(Number(value || 0));

export default function StaffWorkflowIndex({ staff, filters, stats }) {
    const { t, locale } = useLocale();

    const updateFilter = (key, value) => {
        router.get('/staff-workflow', { ...filters, [key]: value }, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <>
            <Head title={t('staff.title')} />
            <AppLayout>
                <PageContainer>
                    <PageHeader title={t('staff.title')} description={t('staff.subtitle')} />

                    <div className="mb-6 grid gap-4 md:grid-cols-4">
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('staff.totalStaff')}</p><p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.staff_count}</p></AppCard>
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('staff.assignedCustomers')}</p><p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.assigned_customers}</p></AppCard>
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('staff.assignedLoans')}</p><p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.assigned_loans}</p></AppCard>
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('staff.todayCollections')}</p><p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{money(stats.today_collection, locale)}</p></AppCard>
                    </div>

                    <AppCard className="mb-6 grid gap-4 md:grid-cols-2">
                        <AppInput value={filters.search || ''} onChange={(e) => updateFilter('search', e.target.value)} placeholder={t('staff.searchPlaceholder')} />
                        <AppSelect value={filters.role || 'all'} onChange={(e) => updateFilter('role', e.target.value)}>
                            <option value="all">{t('staff.allRoles')}</option>
                            <option value="super-admin">{t('adminUsers.superAdmin')}</option>
                            <option value="admin">{t('staff.admin')}</option>
                        </AppSelect>
                    </AppCard>

                    <div className="grid gap-4 xl:grid-cols-2">
                        {staff.map((member) => (
                            <AppCard key={member.id} className="space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{member.name}</h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{member.email}</p>
                                    </div>
                                    <div className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">{member.roles?.join(', ')}</div>
                                </div>
                                <div className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-3">
                                    <div><p className="text-slate-500 dark:text-slate-400">{t('staff.assignedCustomers')}</p><p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{member.assigned_customers_count}</p></div>
                                    <div><p className="text-slate-500 dark:text-slate-400">{t('staff.assignedLoans')}</p><p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{member.assigned_loans_count}</p></div>
                                    <div><p className="text-slate-500 dark:text-slate-400">{t('staff.todayCollections')}</p><p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{money(member.collections_today_amount, locale)}</p></div>
                                    <div><p className="text-slate-500 dark:text-slate-400">{t('staff.todayPaymentCount')}</p><p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{member.collections_today_count}</p></div>
                                    <div><p className="text-slate-500 dark:text-slate-400">{t('staff.monthCollections')}</p><p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{money(member.collections_month_amount, locale)}</p></div>
                                    <div><p className="text-slate-500 dark:text-slate-400">{t('staff.monthPaymentCount')}</p><p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{member.collections_month_count}</p></div>
                                </div>
                            </AppCard>
                        ))}
                    </div>
                </PageContainer>
            </AppLayout>
        </>
    );
}
