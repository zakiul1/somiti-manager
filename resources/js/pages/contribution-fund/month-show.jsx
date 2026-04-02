import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppCard } from '@/components/ui/app-card';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { AppSelect } from '@/components/ui/app-select';

const money = (value) => new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 2 }).format(Number(value || 0));

export default function ContributionFundMonthShow({ month, members, memberOptions, editingPayment, selectedMemberId, pdfDownloadUrl }) {
    const defaultData = {
        user_id: editingPayment?.user_id ?? selectedMemberId ?? memberOptions[0]?.id ?? '',
        amount: editingPayment?.amount ?? month.expected_amount,
        paid_at: editingPayment?.paid_at ?? new Date().toISOString().slice(0, 10),
        payment_method: editingPayment?.payment_method ?? 'cash',
        reference_no: editingPayment?.reference_no ?? '',
        notes: editingPayment?.notes ?? '',
    };

    const form = useForm(defaultData);

    useEffect(() => {
        form.setData('user_id', editingPayment?.user_id ?? selectedMemberId ?? memberOptions[0]?.id ?? '');
        form.setData('amount', editingPayment?.amount ?? month.expected_amount);
        form.setData('paid_at', editingPayment?.paid_at ?? new Date().toISOString().slice(0, 10));
        form.setData('payment_method', editingPayment?.payment_method ?? 'cash');
        form.setData('reference_no', editingPayment?.reference_no ?? '');
        form.setData('notes', editingPayment?.notes ?? '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingPayment?.id, selectedMemberId, month.id]);

    const submit = (e) => {
        e.preventDefault();
        if (editingPayment) {
            form.put(route('contribution-fund.months.payments.update', { month: month.id, payment: editingPayment.id }));
            return;
        }
        form.post(route('contribution-fund.months.payments.store', month.id), {
            onSuccess: () => form.reset('user_id', 'amount', 'paid_at', 'payment_method', 'reference_no', 'notes'),
        });
    };

    const resetToCreate = () => {
        router.get(route('contribution-fund.months.show', month.id), {}, { preserveScroll: true, preserveState: false, replace: true });
    };

    const deletePayment = (paymentId) => {
        if (!window.confirm('Delete this contribution entry?')) {
            return;
        }

        router.delete(route('contribution-fund.months.payments.destroy', { month: month.id, payment: paymentId }), {
            preserveScroll: true,
        });
    };

    const pickMember = (memberId) => {
        form.setData('user_id', String(memberId));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <Head title={month.label} />
            <AppLayout>
                <PageContainer>
                    <PageHeader title={`${month.label} Collection Entry`} description="এই screen থেকেই collected money entry হবে। যে member টাকা দিয়েছে তাকে select করুন, amount/date দিন, তারপর Save Entry চাপুন।" actions={<div className="flex flex-wrap gap-2"><Link href={route('contribution-fund.months')}><AppButton variant="outline">Back to months</AppButton></Link><Link href={route('contribution-fund.members')}><AppButton variant="outline">Members</AppButton></Link><a href={pdfDownloadUrl}><AppButton variant="outline">Download PDF</AppButton></a></div>} />

                    <div className="grid gap-4 md:grid-cols-4">
                        <StatCard title="Amount Per Member" value={money(month.expected_amount)} />
                        <StatCard title="Collected Total" value={money(month.summary.collected_total)} />
                        <StatCard title="Due Total" value={money(month.summary.due_total)} />
                        <StatCard title="Paid Members" value={`${month.summary.paid_members}/${month.summary.member_count}`} />
                    </div>

                    {(month.title || month.notes) ? (
                        <AppCard className="mt-6">
                            {month.title ? <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{month.title}</p> : null}
                            {month.notes ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{month.notes}</p> : null}
                        </AppCard>
                    ) : null}

                    <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
                        <AppCard>
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{editingPayment ? 'Edit Collection Entry' : 'Add Collected Money Entry'}</h2>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">এখানে amount, collection date, reference এবং summary লিখে save করুন। সব admin/member-এর entry এখানেই হবে।</p>
                                </div>
                                {editingPayment ? <AppButton variant="outline" type="button" onClick={resetToCreate}>Cancel Edit</AppButton> : null}
                            </div>
                            <form onSubmit={submit} className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium">Member</label>
                                    <AppSelect value={form.data.user_id} onChange={(e) => form.setData('user_id', e.target.value)}>
                                        {memberOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                                    </AppSelect>
                                    {form.errors.user_id ? <p className="mt-1 text-sm text-rose-600">{form.errors.user_id}</p> : null}
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium">Collected Amount</label>
                                    <AppInput type="number" step="0.01" value={form.data.amount} onChange={(e) => form.setData('amount', e.target.value)} />
                                    {form.errors.amount ? <p className="mt-1 text-sm text-rose-600">{form.errors.amount}</p> : null}
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium">Collection Date</label>
                                    <AppInput type="date" value={form.data.paid_at} onChange={(e) => form.setData('paid_at', e.target.value)} />
                                    {form.errors.paid_at ? <p className="mt-1 text-sm text-rose-600">{form.errors.paid_at}</p> : null}
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium">Collection Method</label>
                                    <AppSelect value={form.data.payment_method} onChange={(e) => form.setData('payment_method', e.target.value)}>
                                        <option value="cash">Cash</option>
                                        <option value="bank">Bank</option>
                                        <option value="mobile_banking">Mobile Banking</option>
                                    </AppSelect>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium">Reference No</label>
                                    <AppInput value={form.data.reference_no} onChange={(e) => form.setData('reference_no', e.target.value)} placeholder="optional" />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium">Summary / Note</label>
                                    <AppInput value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} placeholder="যেমন: আংশিক জমা" />
                                </div>
                                <div className="md:col-span-2 flex items-center gap-3">
                                    <AppButton type="submit" disabled={form.processing}>{editingPayment ? 'Update Entry' : 'Save Entry'}</AppButton>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Tip: member list থেকে "Collect Now" চাপলে ওই member auto-select হবে।</span>
                                </div>
                            </form>
                        </AppCard>

                        <AppCard>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Quick Guide</h2>
                            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                                <p><strong>1.</strong> এই মাসের নির্ধারিত amount per member হলো <strong>{money(month.expected_amount)}</strong>।</p>
                                <p><strong>2.</strong> কেউ full amount দিলে status Paid হবে, কম দিলে Partial হবে, আর না দিলে Unpaid থাকবে।</p>
                                <p><strong>3.</strong> একজন member এক মাসে একাধিকবার amount জমা দিতে পারবে। সেগুলো history-তে দেখা যাবে।</p>
                            </div>
                        </AppCard>
                    </div>

                    <AppCard className="mt-6 overflow-hidden p-0">
                        <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-800">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Member-wise Collection Status</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">নিচে প্রতিটি member-এর paid, due, status এবং payment history দেখানো হচ্ছে।</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                                <thead className="bg-slate-50 dark:bg-slate-950/50">
                                    <tr>
                                        {['Member', 'Expected', 'Paid', 'Due', 'Status', 'Actions & History'].map((item) => <th key={item} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{item}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {members.map((member) => (
                                        <tr key={member.id} className="align-top">
                                            <td className="px-4 py-3 text-sm">
                                                <div className="font-medium text-slate-900 dark:text-slate-100">{member.name}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">{member.role}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm">{money(member.expected_amount)}</td>
                                            <td className="px-4 py-3 text-sm">{money(member.paid_amount)}</td>
                                            <td className="px-4 py-3 text-sm">{money(member.due_amount)}</td>
                                            <td className="px-4 py-3 text-sm"><StatusBadge status={member.status} /></td>
                                            <td className="px-4 py-3 text-sm">
                                                <div className="space-y-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        <AppButton type="button" variant="outline" onClick={() => pickMember(member.id)}>Collect Now</AppButton>
                                                        <Link href={route('contribution-fund.members.show', { user: member.id, year: month.month.slice(0, 4) })} className="inline-flex items-center rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-indigo-600 dark:border-slate-800 dark:text-indigo-400">Open full statement</Link>
                                                    </div>
                                                    {member.payments.length ? member.payments.map((payment) => (
                                                        <div key={payment.id} className="rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-800">
                                                            <div className="font-medium text-slate-800 dark:text-slate-100">{payment.paid_at} · {money(payment.amount)} · {humanizeMethod(payment.payment_method)}</div>
                                                            {payment.reference_no ? <div className="mt-1 text-slate-500 dark:text-slate-400">Ref: {payment.reference_no}</div> : null}
                                                            {payment.receiver ? <div className="mt-1 text-slate-500 dark:text-slate-400">Received by: {payment.receiver}</div> : null}
                                                            {payment.notes ? <div className="mt-1 text-slate-500 dark:text-slate-400">{payment.notes}</div> : null}
                                                            <div className="mt-2 flex gap-3">
                                                                <button type="button" className="font-medium text-indigo-600 dark:text-indigo-400" onClick={() => router.get(route('contribution-fund.months.show', month.id), { editPayment: payment.id }, { preserveScroll: true, replace: true })}>Edit</button>
                                                                <button type="button" className="font-medium text-rose-600 dark:text-rose-400" onClick={() => deletePayment(payment.id)}>Delete</button>
                                                            </div>
                                                        </div>
                                                    )) : <span className="text-slate-500">No payment yet.</span>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
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
    return <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{title}</p><p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p></AppCard>;
}

function StatusBadge({ status }) {
    const map = {
        paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
        partial: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
        unpaid: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    };
    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${map[status]}`}>{status}</span>;
}

function humanizeMethod(value) {
    return value?.replaceAll('_', ' ');
}
