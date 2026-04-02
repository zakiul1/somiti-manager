import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppCard } from '@/components/ui/app-card';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';

const money = (value) => new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 2 }).format(Number(value || 0));

export default function ContributionFundMemberShow({ filters, member, history, pdfDownloadUrl }) {
    return (
        <>
            <Head title={member.name} />
            <AppLayout>
                <PageContainer>
                    <PageHeader title={`${member.name} Contribution Statement`} description="এই সদস্যের মাসভিত্তিক contribution history, unpaid months, এবং PDF statement।" actions={<div className="flex gap-2"><Link href={route('contribution-fund.members')}><AppButton variant="outline">Back</AppButton></Link><a href={pdfDownloadUrl}><AppButton>Download PDF</AppButton></a></div>} />
                    <div className="mb-6 flex items-end gap-3">
                        <div>
                            <label className="mb-2 block text-sm font-medium">Year</label>
                            <AppInput type="number" value={filters.year} onChange={(e) => router.get(route('contribution-fund.members.show', member.id), { year: e.target.value }, { preserveState: true, replace: true })} />
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
                        <StatCard title="Expected" value={money(member.expected_total)} />
                        <StatCard title="Paid" value={money(member.paid_total)} />
                        <StatCard title="Due" value={money(member.due_total)} />
                        <StatCard title="Paid Months" value={member.paid_months} />
                        <StatCard title="Partial Months" value={member.partial_months} />
                        <StatCard title="Unpaid Months" value={member.unpaid_months} />
                    </div>
                    <AppCard className="mt-6 overflow-hidden p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                                <thead className="bg-slate-50 dark:bg-slate-950/50">
                                    <tr>
                                        {['Month', 'Expected', 'Paid', 'Due', 'Status', 'Payment History'].map((item) => <th key={item} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{item}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {history.length ? history.map((row) => (
                                        <tr key={row.id} className="align-top">
                                            <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">{row.month_label}</td>
                                            <td className="px-4 py-3 text-sm">{money(row.expected_amount)}</td>
                                            <td className="px-4 py-3 text-sm">{money(row.paid_amount)}</td>
                                            <td className="px-4 py-3 text-sm">{money(row.due_amount)}</td>
                                            <td className="px-4 py-3 text-sm"><StatusBadge status={row.status} /></td>
                                            <td className="px-4 py-3 text-sm">{row.payments.length ? row.payments.map((payment) => <div key={payment.id} className="mb-2 rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-800">{payment.paid_at} · {money(payment.amount)} · {payment.payment_method}{payment.reference_no ? ` · ${payment.reference_no}` : ''}</div>) : <span className="text-slate-500">No payment recorded.</span>}</td>
                                        </tr>
                                    )) : <tr><td colSpan="6" className="px-4 py-8 text-center text-sm text-slate-500">No statement data for this year.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </AppCard>
                </PageContainer>
            </AppLayout>
        </>
    );
}

function StatCard({ title, value }) {
    return <AppCard><p className="text-sm text-slate-500">{title}</p><p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p></AppCard>;
}

function StatusBadge({ status }) {
    const map = {
        paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
        partial: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
        unpaid: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    };
    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${map[status]}`}>{status}</span>;
}
