import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { AppCard } from '@/components/ui/app-card';
import { useLocale } from '@/hooks/use-locale';

const numberFormat = (value, locale = 'en') => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD').format(Number(value || 0));
const moneyFormat = (value, locale = 'en') => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 2,
}).format(Number(value || 0));

function StatCard({ title, value, hint }) {
    return (
        <AppCard className="min-w-0">
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            <p className="mt-3 break-words text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
            {hint ? <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{hint}</p> : null}
        </AppCard>
    );
}

function SectionTitle({ title, subtitle }) {
    return (
        <div className="mb-4 min-w-0">
            <h2 className="break-words text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
        </div>
    );
}

export default function DashboardIndex({ customerStats = {}, attentionBoard = {} }) {
    const { t, locale } = useLocale();

    const overdueCustomers = attentionBoard.overdue_customers || [];
    const recentPayments = attentionBoard.recent_payments || [];
    const topCollectors = attentionBoard.top_collectors || [];

    return (
        <>
            <Head title={t('dashboard.title')} />

            <AppLayout>
                <PageContainer>
                    <div className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 p-6 text-white shadow-sm">
                        <div className="grid gap-6 xl:grid-cols-[1.5fr,1fr] xl:items-end">
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-white/80">{t('dashboard.title')}</p>
                                <h1 className="mt-2 break-words text-3xl font-bold">{t('dashboard.heroTitle')}</h1>
                                <p className="mt-3 max-w-3xl text-sm leading-6 text-white/85">{t('dashboard.heroSubtitle')}</p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                                    <p className="text-xs uppercase tracking-wide text-white/70">{t('dashboard.todayAmount')}</p>
                                    <p className="mt-2 text-2xl font-bold">{moneyFormat(customerStats.collected_today_amount, locale)}</p>
                                </div>
                                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                                    <p className="text-xs uppercase tracking-wide text-white/70">{t('dashboard.openDueAmount')}</p>
                                    <p className="mt-2 text-2xl font-bold">{moneyFormat(customerStats.outstanding_open_amount, locale)}</p>
                                </div>
                                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                                    <p className="text-xs uppercase tracking-wide text-white/70">{t('dashboard.todayDueAmount')}</p>
                                    <p className="mt-2 text-2xl font-bold">{moneyFormat(customerStats.due_today_amount, locale)}</p>
                                </div>
                                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                                    <p className="text-xs uppercase tracking-wide text-white/70">{t('dashboard.weekDueAmount')}</p>
                                    <p className="mt-2 text-2xl font-bold">{moneyFormat(customerStats.due_this_week_amount, locale)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <StatCard title={t('dashboard.totalMembers')} value={numberFormat(customerStats.total, locale)} hint={t('dashboard.totalMembersHint')} />
                        <StatCard title={t('dashboard.activeLoans')} value={numberFormat(customerStats.active_loans, locale)} hint={t('dashboard.activeLoansHint')} />
                        <StatCard title={t('dashboard.overdueInstallmentsCard')} value={numberFormat(customerStats.overdue_installments, locale)} hint={t('dashboard.overdueInstallmentsHint')} />
                        <StatCard title={t('dashboard.pendingInstallmentsCard')} value={numberFormat(customerStats.pending_installments, locale)} hint={t('dashboard.pendingInstallmentsHint')} />
                    </div>

                    <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr,1fr]">
                        <AppCard>
                            <SectionTitle title={t('dashboard.operationsTitle')} subtitle={t('dashboard.operationsSubtitle')} />
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <StatCard title={t('dashboard.paymentsTodayCount')} value={numberFormat(customerStats.payments_today_count, locale)} hint={t('dashboard.paymentsTodayHint')} />
                                <StatCard title={t('dashboard.paymentsMonthCount')} value={numberFormat(customerStats.payments_this_month_count, locale)} hint={t('dashboard.paymentsMonthHint')} />
                                <StatCard title={t('dashboard.newThisMonth')} value={numberFormat(customerStats.new_this_month, locale)} hint={t('dashboard.newThisMonthHint')} />
                                <StatCard title={t('dashboard.closedLoans')} value={numberFormat(customerStats.closed_loans, locale)} hint={t('dashboard.closedLoansHint')} />
                            </div>
                        </AppCard>

                        <AppCard>
                            <SectionTitle title={t('dashboard.quickActions')} subtitle={t('dashboard.quickActionsSubtitle')} />
                            <div className="grid gap-3">
                                <QuickLink href="/customers/create" title={t('dashboard.newCustomer')} subtitle={t('dashboard.addCustomerDesc')} />
                                <QuickLink href="/loans/create" title={t('dashboard.addLoan')} subtitle={t('dashboard.addLoanDesc')} />
                                <QuickLink href="/payments/create" title={t('dashboard.collectPayment')} subtitle={t('dashboard.collectPaymentDesc')} />
                                <QuickLink href="/installments" title={t('nav.installments')} subtitle={t('dashboard.manageInstallmentsDesc')} />
                            </div>
                        </AppCard>
                    </div>

                    <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr,1fr,1fr]">
                        <AppCard className="min-w-0 xl:col-span-1">
                            <SectionTitle title={t('dashboard.overdueCustomersTitle')} subtitle={t('dashboard.overdueCustomersSubtitle')} />
                            <div className="space-y-3">
                                {overdueCustomers.length ? overdueCustomers.map((customer) => (
                                    <div key={customer.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="break-words font-semibold text-slate-900 dark:text-slate-100">{customer.name}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{customer.customer_code} · {customer.phone || '-'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{moneyFormat(customer.overdue_amount, locale)}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{numberFormat(customer.overdue_count, locale)} {t('dashboard.installmentsLabel')}</p>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t('dashboard.oldestDueDate')}: {customer.oldest_due_date || '-'}</p>
                                    </div>
                                )) : (
                                    <EmptyState text={t('dashboard.noOverdueCustomers')} />
                                )}
                            </div>
                        </AppCard>

                        <AppCard className="min-w-0 xl:col-span-1">
                            <SectionTitle title={t('dashboard.recentPaymentsTitle')} subtitle={t('dashboard.recentPaymentsSubtitle')} />
                            <div className="space-y-3">
                                {recentPayments.length ? recentPayments.map((payment) => (
                                    <div key={payment.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="break-words font-semibold text-slate-900 dark:text-slate-100">{payment.customer || '-'}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{payment.payment_code} · {payment.loan_code || '-'}</p>
                                            </div>
                                            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{moneyFormat(payment.amount, locale)}</p>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                                            <span>{payment.payment_date || '-'}</span>
                                            <span>{payment.collector || '-'}</span>
                                            <span>{payment.payment_method || '-'}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <EmptyState text={t('dashboard.noRecentPayments')} />
                                )}
                            </div>
                        </AppCard>

                        <AppCard className="min-w-0 xl:col-span-1">
                            <SectionTitle title={t('dashboard.topCollectorsTitle')} subtitle={t('dashboard.topCollectorsSubtitle')} />
                            <div className="space-y-3">
                                {topCollectors.length ? topCollectors.map((staff, index) => (
                                    <div key={staff.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                        <div className="min-w-0">
                                            <p className="break-words font-semibold text-slate-900 dark:text-slate-100">{index + 1}. {staff.name}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{numberFormat(staff.payments_count, locale)} {t('dashboard.paymentsLabel')}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-sky-600 dark:text-sky-400">{moneyFormat(staff.total_collected, locale)}</p>
                                    </div>
                                )) : (
                                    <EmptyState text={t('dashboard.noTopCollectors')} />
                                )}
                            </div>
                        </AppCard>
                    </div>
                </PageContainer>
            </AppLayout>
        </>
    );
}

function QuickLink({ href, title, subtitle }) {
    return (
        <Link href={href} className="rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-950">
            <p className="font-semibold text-slate-900 dark:text-slate-100">{title}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </Link>
    );
}

function EmptyState({ text }) {
    return <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">{text}</div>;
}
