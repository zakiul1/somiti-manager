import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { AppCard } from '@/components/ui/app-card';
import { AppSelect } from '@/components/ui/app-select';
import { useLocale } from '@/hooks/use-locale';

const money = (value, locale = 'en') => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
}).format(Number(value || 0));

const numberFormat = (value, locale = 'en') => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD').format(Number(value || 0));

export default function ReportsIndex({
    filters,
    customers,
    staff,
    summary,
    dailyCollection,
    recentPayments,
    overdueInstallments,
    customerLoanSummary,
    loanRepaymentSummary,
    staffCollectionSummary,
    disbursementSummary,
}) {
    const { t, locale } = useLocale();

    const submit = (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        router.get(route('reports.index'), {
            date_from: form.get('date_from'),
            date_to: form.get('date_to'),
            customer_id: form.get('customer_id') || '',
            staff_id: form.get('staff_id') || '',
            loan_status: form.get('loan_status') || '',
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const exportHref = (reportType) => route('reports.export', {
        ...filters,
        report_type: reportType,
    });

    return (
        <>
            <Head title={t('reports.title')} />

            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={t('reports.listTitle')}
                        description={t('reports.listSubtitle')}
                        actions={
                            <Link href={exportHref('daily_collection')}>
                                <AppButton variant="outline">{t('common.exportCsv')}</AppButton>
                            </Link>
                        }
                    />

                    <form onSubmit={submit} className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">{t('reports.startDate')}</label>
                            <AppInput type="date" name="date_from" defaultValue={filters.date_from} />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">{t('reports.endDate')}</label>
                            <AppInput type="date" name="date_to" defaultValue={filters.date_to} />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">{t('reports.customerFilter')}</label>
                            <AppSelect name="customer_id" defaultValue={filters.customer_id || ''}>
                                <option value="">{t('reports.allCustomers')}</option>
                                {customers.map((item) => (
                                    <option key={item.id} value={item.id}>{item.label}</option>
                                ))}
                            </AppSelect>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">{t('reports.staffFilter')}</label>
                            <AppSelect name="staff_id" defaultValue={filters.staff_id || ''}>
                                <option value="">{t('reports.allStaff')}</option>
                                {staff.map((item) => (
                                    <option key={item.id} value={item.id}>{item.label}</option>
                                ))}
                            </AppSelect>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">{t('reports.loanStatusFilter')}</label>
                            <AppSelect name="loan_status" defaultValue={filters.loan_status || ''}>
                                <option value="">{t('reports.allStatuses')}</option>
                                <option value="draft">{t('loans.draft')}</option>
                                <option value="approved">{t('loans.approved')}</option>
                                <option value="active">{t('loans.active')}</option>
                                <option value="closed">{t('loans.closed')}</option>
                                <option value="defaulted">{t('loans.defaulted')}</option>
                            </AppSelect>
                        </div>
                        <div className="md:col-span-5 flex flex-wrap items-center justify-end gap-3">
                            <AppButton type="submit">{t('reports.applyFilters')}</AppButton>
                            <AppButton type="button" variant="outline" onClick={() => router.get(route('reports.index'))}>{t('reports.reset')}</AppButton>
                        </div>
                    </form>

                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                        <StatCard title={t('reports.collectedInRange')} value={money(summary.collected_in_range, locale)} hint={t('reports.collectedInRangeHint')} />
                        <StatCard title={t('reports.dueInRange')} value={money(summary.due_in_range, locale)} hint={t('reports.dueInRangeHint')} />
                        <StatCard title={t('reports.collectionRate')} value={`${numberFormat(summary.collection_rate_in_range, locale)}%`} hint={t('reports.collectionRateHint')} />
                        <StatCard title={t('reports.outstandingOverall')} value={money(summary.outstanding_overall, locale)} hint={t('reports.outstandingOverallHint')} />
                        <StatCard title={t('reports.paymentsInRange')} value={numberFormat(summary.payment_count_in_range, locale)} hint={t('reports.paymentsInRangeHint')} />
                        <StatCard title={t('reports.overdueInstallments')} value={numberFormat(summary.overdue_count, locale)} hint={t('reports.overdueInstallmentsHint')} />
                        <StatCard title={t('reports.disbursedInRange')} value={money(summary.disbursed_in_range, locale)} hint={t('reports.disbursedInRangeHint')} />
                        <StatCard title={t('reports.disbursementCount')} value={numberFormat(summary.disbursement_count_in_range, locale)} hint={t('reports.disbursementCountHint')} />
                    </div>

                    <div className="mt-6 grid gap-6 xl:grid-cols-5">
                        <div className="xl:col-span-3">
                            <SectionTableCard
                                title={t('reports.dailyCollectionSummary')}
                                subtitle={t('reports.dailyCollectionSummaryHint')}
                                exportHref={exportHref('daily_collection')}
                                exportLabel={t('common.exportCsv')}
                            >
                                <SimpleTable
                                    headers={[t('reports.date'), t('reports.payments'), t('reports.collected')]}
                                    emptyText={t('reports.noCollectionData')}
                                    rows={dailyCollection.map((item) => [
                                        item.date,
                                        numberFormat(item.count, locale),
                                        money(item.amount, locale),
                                    ])}
                                />
                            </SectionTableCard>
                        </div>
                        <div className="xl:col-span-2">
                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('reports.recentPayments')}</h2>
                                <div className="mt-4 space-y-3">
                                    {recentPayments.length ? recentPayments.map((payment) => (
                                        <div key={payment.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{payment.payment_code}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{payment.customer?.name} · {payment.loan?.loan_code}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{payment.collector?.name || '-'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{money(payment.amount, locale)}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{payment.payment_date}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('reports.recentPaymentsEmpty')}</p>
                                    )}
                                </div>
                            </AppCard>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-6 xl:grid-cols-2">
                        <SectionTableCard
                            title={t('reports.customerLoanSummary')}
                            subtitle={t('reports.customerLoanSummaryHint')}
                            exportHref={exportHref('customer_summary')}
                            exportLabel={t('common.exportCsv')}
                        >
                            <SimpleTable
                                headers={[
                                    t('reports.customer'),
                                    t('reports.staff'),
                                    t('reports.loansCount'),
                                    t('reports.collected'),
                                    t('reports.outstanding'),
                                ]}
                                emptyText={t('reports.noCustomerSummary')}
                                rows={customerLoanSummary.map((item) => [
                                    `${item.name} (${item.customer_code})`,
                                    item.staff || '-',
                                    `${numberFormat(item.loan_count, locale)} / ${numberFormat(item.active_loan_count, locale)}`,
                                    money(item.collected, locale),
                                    money(item.outstanding, locale),
                                ])}
                            />
                        </SectionTableCard>

                        <SectionTableCard
                            title={t('reports.staffCollectionSummary')}
                            subtitle={t('reports.staffCollectionSummaryHint')}
                            exportHref={exportHref('staff_collection')}
                            exportLabel={t('common.exportCsv')}
                        >
                            <SimpleTable
                                headers={[
                                    t('reports.staff'),
                                    t('reports.assignedCustomers'),
                                    t('reports.assignedLoans'),
                                    t('reports.payments'),
                                    t('reports.collected'),
                                ]}
                                emptyText={t('reports.noStaffSummary')}
                                rows={staffCollectionSummary.map((item) => [
                                    item.name,
                                    numberFormat(item.assigned_customers, locale),
                                    numberFormat(item.assigned_loans, locale),
                                    numberFormat(item.payment_count, locale),
                                    money(item.collected_amount, locale),
                                ])}
                            />
                        </SectionTableCard>
                    </div>

                    <div className="mt-6 grid gap-6 xl:grid-cols-2">
                        <SectionTableCard
                            title={t('reports.loanRepaymentSummary')}
                            subtitle={t('reports.loanRepaymentSummaryHint')}
                            exportHref={exportHref('loan_repayment')}
                            exportLabel={t('common.exportCsv')}
                        >
                            <SimpleTable
                                headers={[
                                    t('reports.loan'),
                                    t('reports.customer'),
                                    t('reports.status'),
                                    t('reports.progress'),
                                    t('reports.outstanding'),
                                ]}
                                emptyText={t('reports.noLoanSummary')}
                                rows={loanRepaymentSummary.map((item) => [
                                    `${item.loan_code} · ${item.staff || '-'}`,
                                    item.customer?.name || '-',
                                    item.status,
                                    `${numberFormat(item.progress, locale)}%`,
                                    money(item.outstanding, locale),
                                ])}
                            />
                        </SectionTableCard>

                        <SectionTableCard
                            title={t('reports.disbursementSummary')}
                            subtitle={t('reports.disbursementSummaryHint')}
                            exportHref={exportHref('disbursement')}
                            exportLabel={t('common.exportCsv')}
                        >
                            <SimpleTable
                                headers={[
                                    t('reports.loan'),
                                    t('reports.customer'),
                                    t('reports.date'),
                                    t('reports.disbursed'),
                                    t('reports.staff'),
                                ]}
                                emptyText={t('reports.noDisbursements')}
                                rows={disbursementSummary.rows.map((item) => [
                                    item.loan_code,
                                    item.customer?.name || '-',
                                    item.disbursed_at || '-',
                                    money(item.disbursement_amount, locale),
                                    item.disburser || item.staff || '-',
                                ])}
                            />
                        </SectionTableCard>
                    </div>

                    <div className="mt-6">
                        <SectionTableCard
                            title={t('reports.overdueInstallments')}
                            subtitle={t('reports.overdueInstallmentsSubtitle')}
                        >
                            <SimpleTable
                                headers={[
                                    t('reports.loan'),
                                    t('reports.customer'),
                                    t('reports.dueDate'),
                                    t('reports.status'),
                                    t('reports.outstanding'),
                                ]}
                                emptyText={t('reports.noOverdueInstallments')}
                                rows={overdueInstallments.map((item) => [
                                    `${item.loan?.loan_code} / #${item.installment_no}`,
                                    item.customer?.name || '-',
                                    item.due_date,
                                    item.status,
                                    money(item.outstanding_amount, locale),
                                ])}
                            />
                        </SectionTableCard>
                    </div>
                </PageContainer>
            </AppLayout>
        </>
    );
}

function SectionTableCard({ title, subtitle, exportHref, exportLabel, children }) {
    return (
        <AppCard className="overflow-hidden p-0">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
                    {subtitle ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
                </div>
                {exportHref ? (
                    <Link href={exportHref}>
                        <AppButton variant="outline" size="sm">{exportLabel}</AppButton>
                    </Link>
                ) : null}
            </div>
            <div className="overflow-x-auto">{children}</div>
        </AppCard>
    );
}

function SimpleTable({ headers, rows, emptyText }) {
    return (
        <table className="min-w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/40">
                <tr>
                    {headers.map((header) => (
                        <th key={header} className="px-5 py-3 text-left font-medium text-slate-500 dark:text-slate-400">{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.length ? rows.map((row, index) => (
                    <tr key={index} className="border-t border-slate-200 dark:border-slate-800">
                        {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className={`px-5 py-3 ${cellIndex === row.length - 1 ? 'font-medium text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>{cell}</td>
                        ))}
                    </tr>
                )) : (
                    <tr>
                        <td colSpan={headers.length} className="px-5 py-8 text-center text-slate-500 dark:text-slate-400">{emptyText}</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}

function StatCard({ title, value, hint }) {
    return (
        <AppCard>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
        </AppCard>
    );
}
