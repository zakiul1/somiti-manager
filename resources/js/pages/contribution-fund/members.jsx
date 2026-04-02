import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppCard } from '@/components/ui/app-card';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';

const money = (value) => new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 2 }).format(Number(value || 0));

export default function ContributionFundMembers({ filters, members }) {
    return (
        <>
            <Head title="Member Contribution Statements" />
            <AppLayout>
                <PageContainer>
                    <PageHeader title="Member Contribution Statements" description="Member-wise paid, unpaid, partial months এবং statement/PDF access।" actions={<Link href={route('contribution-fund.index')}><AppButton variant="outline">Overview</AppButton></Link>} />

                    <div className="mb-6 flex items-end gap-3">
                        <div>
                            <label className="mb-2 block text-sm font-medium">Year</label>
                            <AppInput type="number" value={filters.year} onChange={(e) => router.get(route('contribution-fund.members'), { year: e.target.value }, { preserveState: true, replace: true })} />
                        </div>
                    </div>

                    <AppCard className="overflow-hidden p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                                <thead className="bg-slate-50 dark:bg-slate-950/50">
                                    <tr>
                                        {['Member', 'Expected', 'Paid', 'Due', 'Paid Months', 'Partial', 'Unpaid', 'Action'].map((item) => <th key={item} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{item}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {members.length ? members.map((member) => (
                                        <tr key={member.id}>
                                            <td className="px-4 py-3 text-sm">
                                                <div className="font-medium text-slate-900 dark:text-slate-100">{member.name}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">{member.role}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm">{money(member.expected_total)}</td>
                                            <td className="px-4 py-3 text-sm">{money(member.paid_total)}</td>
                                            <td className="px-4 py-3 text-sm">{money(member.due_total)}</td>
                                            <td className="px-4 py-3 text-sm">{member.paid_months}</td>
                                            <td className="px-4 py-3 text-sm">{member.partial_months}</td>
                                            <td className="px-4 py-3 text-sm">{member.unpaid_months}</td>
                                            <td className="px-4 py-3 text-sm"><Link className="text-indigo-600 dark:text-indigo-400" href={route('contribution-fund.members.show', { user: member.id, year: filters.year })}>Statement</Link></td>
                                        </tr>
                                    )) : <tr><td colSpan="8" className="px-4 py-8 text-center text-sm text-slate-500">No member records found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </AppCard>
                </PageContainer>
            </AppLayout>
        </>
    );
}
