import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppCard } from '@/components/ui/app-card';
import { AppButton } from '@/components/ui/app-button';
import { InstallmentStatusBadge } from '@/components/installments/installment-status-badge';
import { useLocale } from '@/hooks/use-locale';

const money = (value, locale = 'en') =>
    new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', {
        style: 'currency',
        currency: 'BDT',
        maximumFractionDigits: 2,
    }).format(Number(value || 0));

const num = (value, locale = 'en') =>
    new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD').format(Number(value || 0));

function PremiumStat({ label, value, hint = null, tone = 'default' }) {
    const tones = {
        default:
            'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950',
        info: 'border-indigo-200 bg-indigo-50/70 dark:border-indigo-900 dark:bg-indigo-950/20',
        success:
            'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/20',
        warning:
            'border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/20',
        danger: 'border-rose-200 bg-rose-50/70 dark:border-rose-900 dark:bg-rose-950/20',
    };

    return (
        <div
            className={`min-w-0 rounded-[28px] border p-5 shadow-sm transition-all ${tones[tone]}`}
        >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                {label}
            </p>
            <p className="mt-3 break-words text-[30px] font-bold leading-[1.15] tracking-tight text-slate-950 dark:text-slate-50">
                {value}
            </p>
            {hint ? (
                <p className="mt-3 break-words text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {hint}
                </p>
            ) : null}
        </div>
    );
}

function CompactStat({ label, value, hint = null, tone = 'default' }) {
    const tones = {
        default:
            'border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/70',
        info: 'border-indigo-200 bg-indigo-50/70 dark:border-indigo-900 dark:bg-indigo-950/20',
        success:
            'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/20',
        warning:
            'border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/20',
        danger: 'border-rose-200 bg-rose-50/70 dark:border-rose-900 dark:bg-rose-950/20',
    };

    return (
        <div className={`min-w-0 rounded-[24px] border p-5 ${tones[tone]}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                {label}
            </p>
            <p className="mt-3 break-words text-[20px] font-bold leading-[1.25] tracking-tight text-slate-950 dark:text-slate-50">
                {value}
            </p>
            {hint ? (
                <p className="mt-2 break-words text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {hint}
                </p>
            ) : null}
        </div>
    );
}

function LoanStatusBadge({ loan }) {
    const derivedStatus =
        loan.status === 'closed'
            ? 'paid'
            : Number(loan.overdue_count || 0) > 0
              ? 'overdue'
              : 'pending';

    return <InstallmentStatusBadge status={derivedStatus} />;
}

function LoanInstallmentTable({ loan, locale, t }) {
    return (
        <div className="mt-6 overflow-x-auto rounded-[24px] border border-slate-200 dark:border-slate-800">
            <table className="min-w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/70">
                    <tr>
                        {[
                            t('installments.installmentNo'),
                            t('installments.dueDate'),
                            t('installments.amount'),
                            t('installments.paid'),
                            t('installments.outstanding'),
                            t('installments.status'),
                            t('installments.actions'),
                        ].map((h) => (
                            <th
                                key={h}
                                className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400"
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loan.installments?.length ? (
                        loan.installments.map((item, index) => (
                            <tr
                                key={item.id}
                                className={`border-t border-slate-200 dark:border-slate-800 ${
                                    index % 2 === 0
                                        ? 'bg-white dark:bg-slate-950'
                                        : 'bg-slate-50/50 dark:bg-slate-900/40'
                                }`}
                            >
                                <td className="px-5 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    #{item.installment_no}
                                </td>
                                <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                    {item.due_date || '-'}
                                </td>
                                <td className="px-5 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {money(item.installment_amount, locale)}
                                </td>
                                <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                    {money(item.paid_amount, locale)}
                                </td>
                                <td className="px-5 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {money(item.outstanding_amount, locale)}
                                </td>
                                <td className="px-5 py-4 text-sm">
                                    <InstallmentStatusBadge status={item.status} />
                                </td>
                                <td className="px-5 py-4 text-sm">
                                    {Number(item.outstanding_amount || 0) > 0 ? (
                                        <Link
                                            href={route('payments.create', { installment_id: item.id })}
                                            className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                        >
                                            {t('installments.collectPayment')}
                                        </Link>
                                    ) : (
                                        <span className="text-slate-400 dark:text-slate-500">-</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={7}
                                className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                            >
                                {t('installments.noInstallments')}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default function InstallmentCustomerShow({ customer, loans }) {
    const { t, locale } = useLocale();
    const summary = customer?.financial_summary || {};

    return (
        <>
            <Head title={`${customer.name} · ${t('installments.customerInstallments')}`} />

            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={t('installments.customerInstallments')}
                        description={`${customer.name} · ${customer.customer_code}`}
                        actions={
                            <div className="flex flex-wrap gap-2">
                                <Link href={route('installments.customers')}>
                                    <AppButton variant="outline">{t('common.back')}</AppButton>
                                </Link>
                                <Link href={route('customers.show', customer.id)}>
                                    <AppButton variant="outline">
                                        {t('installments.openCustomer')}
                                    </AppButton>
                                </Link>
                            </div>
                        }
                    />

                    <div className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-white p-6 shadow-sm dark:border-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
                        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    {t('installments.customerInstallments')}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                {customer?.status ? (
                                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                        {customer.status}
                                    </span>
                                ) : null}
                                {customer?.phone ? (
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        {customer.phone}
                                    </span>
                                ) : null}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                            <PremiumStat
                                label={t('customers.totalPayable')}
                                value={money(summary.total_payable, locale)}
                                tone="info"
                            />
                            <PremiumStat
                                label={t('customers.totalPaid')}
                                value={money(summary.total_paid, locale)}
                                tone="success"
                            />
                            <PremiumStat
                                label={t('customers.remainingBalance')}
                                value={money(summary.remaining_balance, locale)}
                                tone="warning"
                            />
                            <PremiumStat
                                label={t('customers.overdueAmount')}
                                value={money(summary.overdue_amount, locale)}
                                tone={Number(summary.overdue_amount || 0) > 0 ? 'danger' : 'default'}
                            />
                            <PremiumStat
                                label={t('installments.nextDueDate')}
                                value={summary.next_due_date || '-'}
                                hint={
                                    summary.next_due_amount
                                        ? money(summary.next_due_amount, locale)
                                        : null
                                }
                            />
                            <PremiumStat
                                label={t('loans.activeLoans')}
                                value={num(summary.active_loans, locale)}
                                hint={`${num(summary.open_installments, locale)} ${t('installments.openInstallments')}`}
                            />
                        </div>
                    </div>

                    <div className="mt-6 space-y-6">
                        {loans.length ? (
                            loans.map((loan) => (
                                <AppCard
                                    key={loan.id}
                                    className="overflow-hidden rounded-[32px] border border-slate-200 shadow-sm dark:border-slate-800"
                                >
                                    <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-6 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h2 className="break-words text-[28px] font-bold leading-tight tracking-tight text-slate-950 dark:text-slate-50">
                                                        {loan.loan_code}
                                                    </h2>
                                                    <LoanStatusBadge loan={loan} />
                                                </div>
                                                <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
                                                    {t('loans.startDate')}: {loan.start_date || '-'} ·{' '}
                                                    {t('installments.frequency')}: {loan.collection_frequency || '-'}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <Link href={route('installments.show', loan.id)}>
                                                    <AppButton variant="outline" size="sm">
                                                        {t('installments.viewSchedule')}
                                                    </AppButton>
                                                </Link>
                                                <Link href={route('loans.show', loan.id)}>
                                                    <AppButton variant="outline" size="sm">
                                                        {t('installments.openLoan')}
                                                    </AppButton>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                                            <CompactStat
                                                label={t('customers.totalPayable')}
                                                value={money(loan.total_payable, locale)}
                                                tone="info"
                                            />
                                            <CompactStat
                                                label={t('customers.totalPaid')}
                                                value={money(loan.total_paid, locale)}
                                                tone="success"
                                            />
                                            <CompactStat
                                                label={t('customers.remainingBalance')}
                                                value={money(loan.remaining_balance, locale)}
                                                tone="warning"
                                            />
                                            <CompactStat
                                                label={t('installments.nextDueDate')}
                                                value={loan.next_due_date || t('customers.noLoanNextDue')}
                                                hint={
                                                    loan.next_due_amount
                                                        ? money(loan.next_due_amount, locale)
                                                        : null
                                                }
                                            />
                                            <CompactStat
                                                label={t('installments.overdueInstallments')}
                                                value={num(loan.overdue_count, locale)}
                                                hint={`${num(loan.open_installments_count, locale)} ${t('installments.openInstallments')}`}
                                                tone={
                                                    Number(loan.overdue_count || 0) > 0
                                                        ? 'danger'
                                                        : 'default'
                                                }
                                            />
                                        </div>

                                        <LoanInstallmentTable loan={loan} locale={locale} t={t} />
                                    </div>
                                </AppCard>
                            ))
                        ) : (
                            <AppCard className="rounded-[32px] border border-slate-200 p-10 text-center dark:border-slate-800">
                                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    {t('installments.noCustomerInstallments')}
                                </p>
                            </AppCard>
                        )}
                    </div>
                </PageContainer>
            </AppLayout>
        </>
    );
}