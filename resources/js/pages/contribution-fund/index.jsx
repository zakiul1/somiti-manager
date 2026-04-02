import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppCard } from '@/components/ui/app-card';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';

const money = (value) => new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 2 }).format(Number(value || 0));

export default function ContributionFundIndex({ filters, stats, months, memberStats }) {
    const setYear = (year) => router.get(route('contribution-fund.index'), { year }, { preserveState: true, replace: true });

    return (
        <>
            <Head title="Member Contribution Fund" />
            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title="Member Contribution Fund"
                        description="Loan module থেকে আলাদা সদস্য চাঁদা, মাসভিত্তিক collection, due, এবং member-wise statement management।"
                        actions={
                            <div className="flex flex-wrap gap-2">
                                <Link href={route('contribution-fund.months')}><AppButton variant="outline">Manage Months</AppButton></Link>
                                <Link href={route('contribution-fund.members')}><AppButton>Member Statements</AppButton></Link>
                            </div>
                        }
                    />

                    <div className="mb-6 flex items-end gap-3">
                        <div>
                            <label className="mb-2 block text-sm font-medium">Year</label>
                            <AppInput type="number" value={filters.year} onChange={(e) => setYear(e.target.value)} />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <StatCard title="Active Members" value={stats.member_count} />
                        <StatCard title="Configured Months" value={stats.month_count} />
                        <StatCard title="Total Expected" value={money(stats.total_expected)} />
                        <StatCard title="Total Collected" value={money(stats.total_collected)} />
                        <StatCard title="Total Due" value={money(stats.total_due)} />
                    </div>

                    {stats.latest_month ? (
                        <AppCard className="mt-6">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Latest Month Snapshot · {stats.latest_month.label}</h2>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Paid members: {stats.latest_month.paid_members}, Partial: {stats.latest_month.partial_members}, Unpaid: {stats.latest_month.unpaid_members}</p>
                                </div>
                                <Link href={route('contribution-fund.months.show', stats.latest_month.id)} className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Open month</Link>
                            </div>
                        </AppCard>
                    ) : null}

                    <div className="mt-6 grid gap-6 xl:grid-cols-2">
                        <AppCard>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Monthly Collection</h2>
                            <div className="mt-4 overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                                    <thead>
                                        <tr>
                                            {['Month', 'Expected', 'Collected', 'Due', 'Members'].map((item) => <th key={item} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{item}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                        {months.length ? months.map((month) => (
                                            <tr key={month.id}>
                                                <td className="px-3 py-3 text-sm"><Link className="font-medium text-indigo-600 dark:text-indigo-400" href={route('contribution-fund.months.show', month.id)}>{month.label}</Link></td>
                                                <td className="px-3 py-3 text-sm">{money(month.expected_total)}</td>
                                                <td className="px-3 py-3 text-sm">{money(month.collected_total)}</td>
                                                <td className="px-3 py-3 text-sm">{money(month.due_total)}</td>
                                                <td className="px-3 py-3 text-sm">{month.paid_members}/{month.member_count}</td>
                                            </tr>
                                        )) : <tr><td colSpan="5" className="px-3 py-6 text-center text-sm text-slate-500">No months configured yet.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </AppCard>

                        <AppCard>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Top Member Contributions</h2>
                            <div className="mt-4 space-y-3">
                                {memberStats.length ? memberStats.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                                        <div>
                                            <Link href={route('contribution-fund.members.show', { user: member.id, year: filters.year })} className="font-medium text-slate-900 dark:text-slate-100">{member.name}</Link>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{member.role}</p>
                                        </div>
                                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{money(member.paid_total)}</div>
                                    </div>
                                )) : <p className="text-sm text-slate-500">No member contribution data yet.</p>}
                            </div>
                        </AppCard>
                    </div>
                </PageContainer>
            </AppLayout>
        </>
    );
}

function StatCard({ title, value }) {
    return (
        <AppCard>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
        </AppCard>
    );
}
