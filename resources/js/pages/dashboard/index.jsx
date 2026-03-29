
import { Head, usePage } from '@inertiajs/react';
import { CreditCard, HandCoins, UserPlus, Users, Wallet, AlertTriangle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { SummaryCard } from '@/components/dashboard/summary-card';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { CollectionOverview } from '@/components/dashboard/collection-overview';
import { useLocale } from '@/hooks/use-locale';

function money(value, locale = 'en') {
    return new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value || 0));
}

export default function DashboardPage({ customerStats }) {
    const { props } = usePage();
    const user = props.auth?.user;
    const primaryRole = user?.roles?.[0] ?? 'admin';
    const { t, locale } = useLocale();

    return (
        <>
            <Head title={t('dashboard.title')} />

            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={t('dashboard.title')}
                        description={t('dashboard.welcomeRole', { name: user?.name ?? t('common.welcome'), role: primaryRole })}
                    />

                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                        <SummaryCard title={t('dashboard.totalMembers')} value={String(customerStats?.total ?? 0)} icon={<Users size={20} />} hint={t('dashboard.totalMembersHint')} />
                        <SummaryCard title={t('dashboard.activeMembers')} value={String(customerStats?.active ?? 0)} icon={<UserPlus size={20} />} hint={t('dashboard.activeMembersHint', { count: customerStats?.inactive ?? 0 })} />
                        <SummaryCard title={t('dashboard.activeLoans')} value={String(customerStats?.active_loans ?? 0)} icon={<HandCoins size={20} />} hint={t('dashboard.activeLoansHint', { count: customerStats?.loans ?? 0 })} />
                        <SummaryCard title={t('dashboard.dueTodayCard')} value={String(customerStats?.due_today_count ?? 0)} icon={<CreditCard size={20} />} hint={t('dashboard.dueTodayHint', { amount: money(customerStats?.due_today_amount ?? 0, locale) })} />
                    </div>

                    <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                        <SummaryCard title={t('dashboard.collectedTodayCard')} value={money(customerStats?.collected_today_amount ?? 0, locale)} icon={<Wallet size={20} />} hint={t('dashboard.collectedTodayHint', { count: customerStats?.payments_today_count ?? 0 })} />
                        <SummaryCard title={t('dashboard.overdueInstallmentsCard')} value={String(customerStats?.overdue_installments ?? 0)} icon={<AlertTriangle size={20} />} hint={t('dashboard.overdueInstallmentsHint', { amount: money(customerStats?.outstanding_open_amount ?? 0, locale) })} />
                        <SummaryCard title={t('dashboard.pendingInstallmentsCard')} value={String(customerStats?.pending_installments ?? 0)} icon={<CreditCard size={20} />} hint={t('dashboard.pendingInstallmentsHint', { count: customerStats?.installments ?? 0 })} />
                        <SummaryCard title={t('dashboard.guarantorsCard')} value={String(customerStats?.guarantors ?? 0)} icon={<Users size={20} />} hint={t('dashboard.guarantorsHint')} />
                    </div>

                    <div className="mt-6 grid gap-6 xl:grid-cols-5">
                        <div className="xl:col-span-3">
                            <CollectionOverview title={t('dashboard.collectionOverview')} />
                        </div>
                        <div className="xl:col-span-2">
                            <QuickActions title={t('dashboard.quickActions')} />
                        </div>
                    </div>

                    <div className="mt-6">
                        <RecentActivity title={t('dashboard.recentActivity')} emptyText={t('dashboard.recentActivityHint', { customers: customerStats?.new_this_month ?? 0, payments: customerStats?.payments_this_month_count ?? 0, amount: money(customerStats?.collected_this_month_amount ?? 0, locale) })} />
                    </div>
                </PageContainer>
            </AppLayout>
        </>
    );
}
