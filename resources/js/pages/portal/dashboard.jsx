import { Link } from '@inertiajs/react';
import CustomerPortalLayout from '@/layouts/customer-portal-layout';
import { AppCard } from '@/components/ui/app-card';
import PortalSummaryStrip from '@/components/portal/portal-summary-strip';
import { useLocale } from '@/hooks/use-locale';
import { formatDate, formatMoney } from '@/lib/formatters';

function StatusPill({ value, t }) {
    const map = {
        pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
        partial: 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300',
        paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
        overdue: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
        active: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
        closed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
        defaulted: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
    };

    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${map[value] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>{t(`portal.status${value?.charAt(0)?.toUpperCase()}${value?.slice(1)}`) || value}</span>;
}

export default function PortalDashboard({ customer, portalAccount, summary, loans, recentInstallments, recentPayments }) {
    const { t, locale } = useLocale();

    return (
        <CustomerPortalLayout title={t('portal.dashboard')}>
            <div className="space-y-6">
                <AppCard>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex min-w-0 items-start gap-4">
                            {customer.photo_url ? (
                                <img src={customer.photo_url} alt={customer.name} className="h-20 w-20 rounded-2xl object-cover" />
                            ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-xl font-semibold text-slate-500 dark:bg-slate-900 dark:text-slate-300">{customer.name?.charAt(0)}</div>
                            )}
                            <div className="min-w-0">
                                <h1 className="truncate text-2xl font-bold text-slate-900 dark:text-slate-100">{customer.name}</h1>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{customer.customer_code} • {customer.phone}</p>
                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t('portal.repaymentClaritySubtitle')}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Link href={route('portal.loans')} className="inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">{t('portal.viewStatements')}</Link>
                            <Link href={route('portal.payments')} className="inline-flex rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">{t('portal.viewReceipts')}</Link>
                        </div>
                    </div>
                </AppCard>

                <PortalSummaryStrip summary={summary} />

                <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                    <div className="space-y-6">
                        <AppCard>
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('portal.myLoans')}</h2>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('portal.loanProgressSubtitle')}</p>
                                </div>
                                <Link href={route('portal.loans')} className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{t('portal.viewAll')}</Link>
                            </div>
                            <div className="mt-4 space-y-3">
                                {loans.length ? loans.map((loan) => (
                                    <div key={loan.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-semibold text-slate-900 dark:text-slate-100">{loan.loan_code}</p>
                                                    <StatusPill value={loan.status} t={t} />
                                                </div>
                                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatDate(loan.start_date, locale)} • {t('portal.openInstallments')}: {loan.open_installments ?? 0}</p>
                                            </div>
                                            <div className="grid gap-3 text-sm sm:grid-cols-3 md:min-w-[360px]">
                                                <div>
                                                    <p className="text-slate-500 dark:text-slate-400">{t('portal.totalPaid')}</p>
                                                    <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{formatMoney(loan.total_paid, locale)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 dark:text-slate-400">{t('portal.remainingBalance')}</p>
                                                    <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{formatMoney(loan.outstanding, locale)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 dark:text-slate-400">{t('portal.nextDueAmount')}</p>
                                                    <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{formatMoney(loan.next_due_amount || 0, locale)}</p>
                                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDate(loan.next_due_date, locale)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <Link href={route('print.loan-statement', { loan: loan.id, locale })} className="inline-flex rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">{t('portal.viewStatement')}</Link>
                                            <Link href={route('print.installment-schedule', { loan: loan.id, locale })} className="inline-flex rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">{t('portal.installmentSchedule')}</Link>
                                        </div>
                                    </div>
                                )) : <p className="text-sm text-slate-500 dark:text-slate-400">{t('portal.noLoans')}</p>}
                            </div>
                        </AppCard>

                        <div className="grid gap-6 xl:grid-cols-2">
                            <AppCard>
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('portal.recentInstallments')}</h2>
                                    <Link href={route('portal.installments')} className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{t('portal.viewAll')}</Link>
                                </div>
                                <div className="mt-4 space-y-3">
                                    {recentInstallments.length ? recentInstallments.map((item) => (
                                        <div key={item.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-slate-900 dark:text-slate-100">{item.loan_code} • #{item.installment_no}</p>
                                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatDate(item.due_date, locale)}</p>
                                                </div>
                                                <div className="text-right text-sm">
                                                    <p className="font-medium text-slate-900 dark:text-slate-100">{formatMoney(item.outstanding, locale)}</p>
                                                    <div className="mt-1"><StatusPill value={item.status} t={t} /></div>
                                                </div>
                                            </div>
                                        </div>
                                    )) : <p className="text-sm text-slate-500 dark:text-slate-400">{t('portal.noInstallments')}</p>}
                                </div>
                            </AppCard>

                            <AppCard>
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('portal.recentPayments')}</h2>
                                    <Link href={route('portal.payments')} className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{t('portal.viewAll')}</Link>
                                </div>
                                <div className="mt-4 space-y-3">
                                    {recentPayments.length ? recentPayments.map((item) => (
                                        <div key={item.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-slate-900 dark:text-slate-100">{item.payment_code}</p>
                                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatDate(item.payment_date, locale)} • {t(`payments.${item.payment_type === 'full_settlement' ? 'fullSettlement' : 'regularCollection'}`)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{formatMoney(item.amount, locale)}</p>
                                                    <Link href={route('print.payment-receipt', { payment: item.id, locale })} className="mt-1 inline-flex text-xs font-medium text-indigo-600 dark:text-indigo-400">{t('portal.viewReceipt')}</Link>
                                                </div>
                                            </div>
                                        </div>
                                    )) : <p className="text-sm text-slate-500 dark:text-slate-400">{t('portal.noPayments')}</p>}
                                </div>
                            </AppCard>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <AppCard>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('portal.portalAccount')}</h2>
                            <div className="mt-4 space-y-4 text-sm">
                                <div><p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('portal.loginName')}</p><p className="mt-1 text-slate-900 dark:text-slate-100">{portalAccount.name}</p></div>
                                <div><p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('portal.loginEmail')}</p><p className="mt-1 break-all text-slate-900 dark:text-slate-100">{portalAccount.email}</p></div>
                                <div><p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('portal.lastLogin')}</p><p className="mt-1 text-slate-900 dark:text-slate-100">{portalAccount.last_login_at || '-'}</p></div>
                            </div>
                        </AppCard>

                        <AppCard>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('portal.downloadCenter')}</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('portal.downloadCenterSubtitle')}</p>
                            <div className="mt-4 grid gap-3">
                                <Link href={route('portal.loans')} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900">{t('portal.viewStatements')}</Link>
                                <Link href={route('portal.payments')} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900">{t('portal.viewReceipts')}</Link>
                                <Link href={route('portal.installments')} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900">{t('portal.installmentSchedule')}</Link>
                            </div>
                        </AppCard>
                    </div>
                </div>
            </div>
        </CustomerPortalLayout>
    );
}
