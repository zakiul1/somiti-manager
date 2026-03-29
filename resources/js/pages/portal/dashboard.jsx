import { Link } from '@inertiajs/react';
import CustomerPortalLayout from '@/layouts/customer-portal-layout';
import { AppCard } from '@/components/ui/app-card';
import { AppButton } from '@/components/ui/app-button';
import PortalSummaryStrip from '@/components/portal/portal-summary-strip';
import { useLocale } from '@/hooks/use-locale';
import { formatDate, formatMoney } from '@/lib/formatters';

export default function PortalDashboard({ customer, portalAccount, summary, loans, recentInstallments, recentPayments }) {
    const { t, locale } = useLocale();

    return (
        <CustomerPortalLayout title={t('portal.dashboard')}>
            <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                <div className="space-y-6">
                    <AppCard>
                        <div className="flex items-start gap-4">
                            {customer.photo_url ? (
                                <img src={customer.photo_url} alt={customer.name} className="h-20 w-20 rounded-2xl object-cover" />
                            ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-xl font-semibold text-slate-500 dark:bg-slate-900 dark:text-slate-300">
                                    {customer.name?.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{customer.name}</h1>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{customer.customer_code} • {customer.phone}</p>
                            </div>
                        </div>
                    </AppCard>

                    <PortalSummaryStrip summary={summary} />

                    <AppCard>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('portal.myLoans')}</h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('portal.myLoansSubtitle')}</p>
                            </div>
                            <Link href={route('portal.loans')}><AppButton variant="outline" size="sm">{t('portal.viewAll')}</AppButton></Link>
                        </div>
                        <div className="mt-4 space-y-3">
                            {loans.length ? loans.map((loan) => (
                                <div key={loan.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-slate-100">{loan.loan_code}</p>
                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                {formatDate(loan.start_date, locale)} • {t('portal.status')}: {loan.status}
                                            </p>
                                        </div>
                                        <div className="text-right text-sm text-slate-700 dark:text-slate-200">
                                            <p>{formatMoney(loan.total_paid, locale)} / {formatMoney(loan.total_payable, locale)}</p>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('portal.outstanding')}: {formatMoney(loan.outstanding, locale)}</p>
                                        </div>
                                    </div>
                                </div>
                            )) : <p className="text-sm text-slate-500 dark:text-slate-400">{t('portal.noLoans')}</p>}
                        </div>
                    </AppCard>

                    <div className="grid gap-6 xl:grid-cols-2">
                        <AppCard>
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('portal.recentInstallments')}</h2>
                                <Link href={route('portal.installments')} className="text-sm text-indigo-600 dark:text-indigo-400">{t('portal.viewAll')}</Link>
                            </div>
                            <div className="mt-4 space-y-3">
                                {recentInstallments.length ? recentInstallments.map((item) => (
                                    <div key={item.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-slate-100">{item.loan_code} • #{item.installment_no}</p>
                                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatDate(item.due_date, locale)}</p>
                                            </div>
                                            <div className="text-right text-sm">
                                                <p className="text-slate-900 dark:text-slate-100">{formatMoney(item.outstanding, locale)}</p>
                                                <p className="mt-1 text-slate-500 dark:text-slate-400">{item.status}</p>
                                            </div>
                                        </div>
                                    </div>
                                )) : <p className="text-sm text-slate-500 dark:text-slate-400">{t('portal.noInstallments')}</p>}
                            </div>
                        </AppCard>

                        <AppCard>
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('portal.recentPayments')}</h2>
                                <Link href={route('portal.payments')} className="text-sm text-indigo-600 dark:text-indigo-400">{t('portal.viewAll')}</Link>
                            </div>
                            <div className="mt-4 space-y-3">
                                {recentPayments.length ? recentPayments.map((item) => (
                                    <div key={item.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-slate-100">{item.payment_code}</p>
                                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatDate(item.payment_date, locale)} • {item.payment_method || '-'}</p>
                                            </div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{formatMoney(item.amount, locale)}</p>
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
                        <div className="mt-4 space-y-4">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('portal.loginName')}</p>
                                <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{portalAccount.name}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('portal.loginEmail')}</p>
                                <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{portalAccount.email}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('portal.lastLogin')}</p>
                                <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{portalAccount.last_login_at || '-'}</p>
                            </div>
                        </div>
                    </AppCard>

                    <AppCard>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('portal.profileSummary')}</h2>
                        <div className="mt-4 space-y-4">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('customers.email')}</p>
                                <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{customer.email || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('portal.guarantorCount')}</p>
                                <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{customer.guarantor_count}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('customers.presentAddress')}</p>
                                <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{customer.present_address || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('customers.permanentAddress')}</p>
                                <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{customer.permanent_address || '-'}</p>
                            </div>
                        </div>
                    </AppCard>
                </div>
            </div>
        </CustomerPortalLayout>
    );
}
