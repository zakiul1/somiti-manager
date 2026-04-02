import { Head, Link, router, useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppCard } from '@/components/ui/app-card';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { AppSelect } from '@/components/ui/app-select';
import { AppTextarea } from '@/components/ui/app-textarea';
import { TablePagination } from '@/components/tables/table-pagination';

const money = (value) => new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 2 }).format(Number(value || 0));

export default function ContributionFundMonths({ filters, months, memberCount }) {
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    const year = filters.year || currentYear;
    const monthOptions = useMemo(() => ([
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ]), []);

    const form = useForm({ month: currentMonth, expected_amount: '', title: '', notes: '' });

    const selectedMonthLabel = monthOptions.find((option) => option.value === form.data.month)?.label || 'Month';

    const submit = (e) => {
        e.preventDefault();

        form.transform((data) => ({
            ...data,
            month: `${year}-${data.month}`,
        }));

        form.post(route('contribution-fund.months.store'), {
            preserveScroll: true,
            onFinish: () => form.transform((data) => data),
        });
    };

    return (
        <>
            <Head title="Monthly Collections" />
            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title="Monthly Collections"
                        description="প্রথমে একটি মাস create করুন। তারপর সেই মাসে গিয়ে member-wise collection entry দিন—কে কত টাকা দিল, কোন তারিখে দিল, আর summary লিখুন।"
                        actions={<Link href={route('contribution-fund.index')}><AppButton variant="outline">Overview</AppButton></Link>}
                    />

                    <div className="mb-6 grid gap-4 lg:grid-cols-[220px_1fr]">
                        <AppCard>
                            <label className="mb-2 block text-sm font-medium">Year</label>
                            <AppInput type="number" value={year} onChange={(e) => router.get(route('contribution-fund.months'), { year: e.target.value }, { preserveState: true, replace: true })} />
                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Current year auto-selected. চাইলে year change করতে পারবেন।</p>
                        </AppCard>
                        <AppCard>
                            <div className="grid gap-4 md:grid-cols-3">
                                <InfoMini title="Active Members" value={memberCount} />
                                <InfoMini title="Collection Months" value={months.total || 0} />
                                <InfoMini title="How it works" value="Month create → টাকা entry → রিপোর্ট/PDF" />
                            </div>
                        </AppCard>
                    </div>

                    <AppCard className="mb-6">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Create / Update Collection Month</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">এই ফর্মে মাস, প্রতি সদস্যের নির্ধারিত টাকা, title/summary এবং notes দিন। Save করার পর আপনাকে সরাসরি collection entry screen-এ নেওয়া হবে।</p>
                        </div>
                        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium">Collection Month</label>
                                <AppSelect
                                    value={form.data.month}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        form.setData('month', value);
                                        if (!form.data.title?.trim()) {
                                            form.setData('title', `${monthOptions.find((option) => option.value === value)?.label || ''} ${year} Contribution`);
                                        }
                                    }}
                                    className="h-12 rounded-2xl border-slate-200 px-4 py-3 dark:border-slate-700"
                                >
                                    {monthOptions.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </AppSelect>
                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Selected period: {selectedMonthLabel} {year}</p>
                                {form.errors.month ? <p className="mt-1 text-sm text-rose-600">{form.errors.month}</p> : null}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">Amount Per Member</label>
                                <AppInput type="number" step="0.01" value={form.data.expected_amount} onChange={(e) => form.setData('expected_amount', e.target.value)} placeholder="যেমন 500" />
                                {form.errors.expected_amount ? <p className="mt-1 text-sm text-rose-600">{form.errors.expected_amount}</p> : null}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">Title / Summary</label>
                                <AppInput value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} placeholder="যেমন: January 2026 Contribution" />
                            </div>
                            <div className="flex items-end">
                                <AppButton type="submit" disabled={form.processing}>Save Month & Open Entry Screen</AppButton>
                            </div>
                            <div className="md:col-span-2 xl:col-span-4">
                                <label className="mb-2 block text-sm font-medium">Notes</label>
                                <AppTextarea rows={3} value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} placeholder="এই মাসের collection সম্পর্কে অতিরিক্ত summary / notes" />
                            </div>
                        </form>
                    </AppCard>

                    <AppCard className="overflow-hidden p-0">
                        <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-800">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Created Collection Months</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">নিচের যেকোনো মাসে "Open Entry Screen" চাপলে member-wise collected money entry করতে পারবেন।</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                                <thead className="bg-slate-50 dark:bg-slate-950/50">
                                    <tr>
                                        {['Month', 'Amount / Member', 'Expected Total', 'Collected', 'Due', 'Paid Members', 'Action'].map((item) => <th key={item} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{item}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {months.data.length ? months.data.map((month) => (
                                        <tr key={month.id}>
                                            <td className="px-4 py-3 text-sm">
                                                <div className="font-medium text-slate-900 dark:text-slate-100">{month.label}</div>
                                                {month.title ? <div className="text-xs text-slate-500 dark:text-slate-400">{month.title}</div> : null}
                                            </td>
                                            <td className="px-4 py-3 text-sm">{money(month.expected_amount)}</td>
                                            <td className="px-4 py-3 text-sm">{money(month.expected_total)}</td>
                                            <td className="px-4 py-3 text-sm">{money(month.collected_total)}</td>
                                            <td className="px-4 py-3 text-sm">{money(month.due_total)}</td>
                                            <td className="px-4 py-3 text-sm">{month.paid_members}/{month.member_count}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <Link className="font-medium text-indigo-600 dark:text-indigo-400" href={route('contribution-fund.months.show', month.id)}>Open Entry Screen</Link>
                                            </td>
                                        </tr>
                                    )) : <tr><td colSpan="7" className="px-4 py-8 text-center text-sm text-slate-500">No collection month found for this year.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4"><TablePagination links={months.links} from={months.from} to={months.to} total={months.total} previousPageUrl={months.prev_page_url} nextPageUrl={months.next_page_url} itemLabel="months" /></div>
                    </AppCard>
                </PageContainer>
            </AppLayout>
        </>
    );
}

function InfoMini({ title, value }) {
    return (
        <div className="rounded-2xl border border-slate-200 px-4 py-4 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{value}</p>
        </div>
    );
}
