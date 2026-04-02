import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppCard } from '@/components/ui/app-card';
import { AppButton } from '@/components/ui/app-button';
import { AppBadge } from '@/components/ui/app-badge';
import { useLocale } from '@/hooks/use-locale';

const money = (value, locale = 'en') =>
    new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', {
        style: 'currency',
        currency: 'BDT',
        maximumFractionDigits: 2,
    }).format(Number(value || 0));

const num = (value, locale = 'en') =>
    new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD').format(Number(value || 0));

function Stat({ label, value, hint = null, valueClassName = '' }) {
    return (
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {label}
            </p>
            <p
                className={`mt-2 break-words text-2xl font-semibold leading-tight text-slate-900 dark:text-slate-100 ${valueClassName}`}
            >
                {value}
            </p>
            {hint ? (
                <p className="mt-1 break-words text-xs text-slate-500 dark:text-slate-400">
                    {hint}
                </p>
            ) : null}
        </div>
    );
}

export default function CustomerLedgerPage({ customer }) {
    const { t, locale } = useLocale();

    return (
        <>
            <Head title={`${customer.name} · ${t('customers.customerLedger')}`} />

            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={t('customers.customerLedger')}
                        description={`${customer.name} · ${customer.customer_code}`}
                        actions={
                            <div className="flex flex-wrap gap-2">
                                <Link href={route('customers.show', customer.id)}>
                                    <AppButton variant="outline">{t('common.back')}</AppButton>
                                </Link>
                                <Link href={route('print.customer-ledger', customer.id)}>
                                    <AppButton variant="outline">{t('print.print')}</AppButton>
                                </Link>
                            </div>
                        }
                    />

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <Stat
                            label={t('customers.totalPayable')}
                            value={money(customer.financial_summary.total_payable, locale)}
                        />
                        <Stat
                            label={t('customers.totalPaid')}
                            value={money(customer.financial_summary.total_paid, locale)}
                        />
                        <Stat
                            label={t('customers.remainingBalance')}
                            value={money(customer.financial_summary.remaining_balance, locale)}
                        />
                        <Stat
                            label={t('customers.overdueAmount')}
                            value={money(customer.financial_summary.overdue_amount, locale)}
                        />
                        <Stat
                            label={t('customers.paymentHistory')}
                            value={num(customer.financial_summary.payment_count, locale)}
                            hint={customer.financial_summary.last_payment_date || '-'}
                        />
                    </div>

                    <div className="mt-6 grid gap-6 xl:grid-cols-5">
                        <div className="space-y-6 xl:col-span-3">
                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    {t('customers.loanPreparation')}
                                </h2>

                                <div className="mt-4 space-y-4">
                                    {customer.loans?.length ? (
                                        customer.loans.map((loan) => (
                                            <div
                                                key={loan.id}
                                                className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
                                            >
                                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                    <div className="min-w-0">
                                                        <p className="break-words font-semibold text-slate-900 dark:text-slate-100">
                                                            {loan.loan_code}
                                                        </p>
                                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                            {loan.start_date || '-'}
                                                        </p>
                                                    </div>

                                                    <AppBadge
                                                        variant={
                                                            loan.status === 'active'
                                                                ? 'success'
                                                                : loan.status === 'closed'
                                                                  ? 'default'
                                                                  : 'warning'
                                                        }
                                                    >
                                                        {t(`loans.${loan.status}`)}
                                                    </AppBadge>
                                                </div>

                                                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                                    <Stat
                                                        label={t('customers.totalPayable')}
                                                        value={money(loan.total_payable, locale)}
                                                        valueClassName="text-xl"
                                                    />
                                                    <Stat
                                                        label={t('customers.totalPaid')}
                                                        value={money(
                                                            loan.financial_summary?.total_paid,
                                                            locale
                                                        )}
                                                        valueClassName="text-xl"
                                                    />
                                                    <Stat
                                                        label={t('customers.remainingBalance')}
                                                        value={money(
                                                            loan.financial_summary?.remaining_balance,
                                                            locale
                                                        )}
                                                        valueClassName="text-xl"
                                                    />
                                                    <Stat
                                                        label={t('customers.loanNextDue')}
                                                        value={
                                                            loan.financial_summary?.next_due_date
                                                                ? `${loan.financial_summary.next_due_date} · ${money(loan.financial_summary.next_due_amount, locale)}`
                                                                : t('customers.noLoanNextDue')
                                                        }
                                                        valueClassName="text-lg leading-snug"
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {t('customers.noLoanLinked')}
                                        </p>
                                    )}
                                </div>
                            </AppCard>

                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    {t('customers.paymentHistory')}
                                </h2>

                                <div className="mt-4 overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800">
                                                {[
                                                    t('payments.paymentCode'),
                                                    t('payments.paymentDate'),
                                                    t('payments.loan'),
                                                    t('payments.amount'),
                                                    t('payments.paymentMethod'),
                                                    t('payments.paymentMode'),
                                                ].map((h) => (
                                                    <th
                                                        key={h}
                                                        className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400"
                                                    >
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {customer.payments?.length ? (
                                                customer.payments.map((payment) => (
                                                    <tr
                                                        key={payment.id}
                                                        className="border-b border-slate-100 dark:border-slate-900"
                                                    >
                                                        <td className="px-3 py-3 font-medium">
                                                            {payment.payment_code}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            {payment.payment_date}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            {payment.loan_code}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            {money(payment.amount, locale)}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            {payment.payment_method || '-'}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            {payment.payment_type === 'full_settlement'
                                                                ? t('payments.fullSettlement')
                                                                : t('payments.regularCollection')}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan="6"
                                                        className="px-3 py-8 text-center text-slate-500 dark:text-slate-400"
                                                    >
                                                        {t('payments.noPayments')}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </AppCard>
                        </div>

                        <div className="space-y-6 xl:col-span-2">
                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    {t('customers.installmentOverview')}
                                </h2>

                                <div className="mt-4 overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800">
                                                {[
                                                    t('installments.loan'),
                                                    t('installments.installmentNo'),
                                                    t('installments.dueDate'),
                                                    t('customers.loanOutstanding'),
                                                ].map((h) => (
                                                    <th
                                                        key={h}
                                                        className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400"
                                                    >
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {customer.installments?.length ? (
                                                customer.installments.map((item) => (
                                                    <tr
                                                        key={item.id}
                                                        className="border-b border-slate-100 dark:border-slate-900"
                                                    >
                                                        <td className="px-3 py-3">
                                                            {item.loan_code}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            {num(item.installment_no, locale)}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            {item.due_date}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            {money(item.outstanding_amount, locale)}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan="4"
                                                        className="px-3 py-8 text-center text-slate-500 dark:text-slate-400"
                                                    >
                                                        {t('installments.noInstallments')}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </AppCard>

                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    {t('customers.settlementBreakdown')}
                                </h2>

                                <div className="mt-4 space-y-3">
                                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            {t('payments.regularCollection')}
                                        </span>
                                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                                            {money(customer.financial_summary.regular_payment_total, locale)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            {t('payments.fullSettlement')}
                                        </span>
                                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                                            {money(
                                                customer.financial_summary.settlement_payment_total,
                                                locale
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </AppCard>
                        </div>
                    </div>
                </PageContainer>
            </AppLayout>
        </>
    );
}