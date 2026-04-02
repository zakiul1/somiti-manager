import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppCard } from '@/components/ui/app-card';
import { AppInput } from '@/components/ui/app-input';
import { AppSelect } from '@/components/ui/app-select';
import { useLocale } from '@/hooks/use-locale';

const money = (value, locale = 'en') => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 2 }).format(Number(value || 0));
const number = (value, locale = 'en') => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD').format(Number(value || 0));

function MetricCard({ title, value, hint }) {
    return (
        <AppCard className="min-w-0">
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            <p className="mt-2 break-words text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
            {hint ? <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{hint}</p> : null}
        </AppCard>
    );
}

export default function StaffWorkflowIndex({ staff = [], filters = {}, stats = {} }) {
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

                    <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <MetricCard title={t('staff.totalStaff')} value={number(stats.staff_count, locale)} hint={t('staff.totalStaffHint')} />
                        <MetricCard title={t('staff.activeStaff')} value={number(stats.active_staff_count, locale)} hint={t('staff.activeStaffHint')} />
                        <MetricCard title={t('staff.todayCollections')} value={money(stats.today_collection, locale)} hint={t('staff.todayCollectionsHint')} />
                        <MetricCard title={t('staff.monthCollections')} value={money(stats.month_collection, locale)} hint={t('staff.monthCollectionsHint')} />
                    </div>

                    <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <MetricCard title={t('staff.assignedCustomers')} value={number(stats.assigned_customers, locale)} hint={t('staff.assignedCustomersHint')} />
                        <MetricCard title={t('staff.assignedLoans')} value={number(stats.assigned_loans, locale)} hint={t('staff.assignedLoansHint')} />
                        <MetricCard title={t('staff.activeAssignedLoans')} value={number(stats.active_assigned_loans, locale)} hint={t('staff.activeAssignedLoansHint')} />
                    </div>

                    <AppCard className="mb-6 grid gap-4 lg:grid-cols-[1.3fr,0.7fr]">
                        <AppInput value={filters.search || ''} onChange={(e) => updateFilter('search', e.target.value)} placeholder={t('staff.searchPlaceholder')} />
                        <AppSelect value={filters.role || 'all'} onChange={(e) => updateFilter('role', e.target.value)}>
                            <option value="all">{t('staff.allRoles')}</option>
                            <option value="super-admin">{t('adminUsers.superAdmin')}</option>
                            <option value="admin">{t('staff.admin')}</option>
                        </AppSelect>
                    </AppCard>

                    <div className="grid gap-4 xl:grid-cols-2">
                        {staff.length ? staff.map((member) => (
                            <AppCard key={member.id} className="min-w-0 overflow-hidden">
                                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
                                    <div className="min-w-0">
                                        <h2 className="break-words text-lg font-semibold text-slate-900 dark:text-slate-100">{member.name}</h2>
                                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                                            <span className="break-all">{member.email || '-'}</span>
                                            <span>{member.phone || '-'}</span>
                                            <span>{member.designation || '-'}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">{member.roles?.join(', ') || t('common.unassigned')}</span>
                                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${member.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'}`}>{member.is_active ? t('adminUsers.active') : t('adminUsers.inactive')}</span>
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                    <DataPoint label={t('staff.assignedCustomers')} value={number(member.assigned_customers_count, locale)} />
                                    <DataPoint label={t('staff.assignedLoans')} value={number(member.assigned_loans_count, locale)} />
                                    <DataPoint label={t('staff.activeAssignedLoans')} value={number(member.active_assigned_loans_count, locale)} />
                                    <DataPoint label={t('staff.todayCollections')} value={money(member.collections_today_amount, locale)} />
                                    <DataPoint label={t('staff.todayPaymentCount')} value={number(member.collections_today_count, locale)} />
                                    <DataPoint label={t('staff.monthCollections')} value={money(member.collections_month_amount, locale)} />
                                    <DataPoint label={t('staff.monthPaymentCount')} value={number(member.collections_month_count, locale)} />
                                    <DataPoint label={t('staff.dueTodayAssignedAmount')} value={money(member.due_today_assigned_amount, locale)} />
                                    <DataPoint label={t('staff.overdueAssignedLoans')} value={number(member.overdue_assigned_loans_count, locale)} />
                                </div>
                            </AppCard>
                        )) : (
                            <AppCard className="xl:col-span-2">
                                <p className="text-sm text-slate-500 dark:text-slate-400">{t('staff.empty')}</p>
                            </AppCard>
                        )}
                    </div>
                </PageContainer>
            </AppLayout>
        </>
    );
}

function DataPoint({ label, value }) {
    return (
        <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">
            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-1 break-words text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
        </div>
    );
}
