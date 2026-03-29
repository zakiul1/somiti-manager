import { Head } from '@inertiajs/react';
import { PrintActions } from '@/components/print/print-actions';
import { useLocale } from '@/hooks/use-locale';

const money = (value, locale) => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 2 }).format(Number(value || 0));

export default function LoanStatementPage({ loan, organization, meta, pdfDownloadUrl, backHref }) {
    const { t, locale } = useLocale();

    return (
        <>
            <Head title={`${loan.loan_code} - ${t('print.loanStatement')}`} />
            <div className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 print:bg-white print:px-0 print:py-0">
                <div className="mx-auto max-w-5xl rounded-3xl bg-white p-6 shadow-sm print:max-w-none print:rounded-none print:p-8 print:shadow-none">
                    <PrintActions backHref={backHref || `/loans/${loan.id}`} downloadHref={pdfDownloadUrl} saveLabel={t('print.saveStatementPdf')} />
                    <div className="border-b-2 border-slate-900 pb-4">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">{organization?.name || t('common.appName')}</h1>
                                {organization?.address ? <p className="mt-1 text-sm text-slate-500">{organization.address}</p> : null}
                                {(organization?.phone || organization?.email) ? <p className="mt-1 text-sm text-slate-500">{[organization?.phone, organization?.email].filter(Boolean).join(' · ')}</p> : null}
                            </div>
                            <div className="text-right text-sm">
                                <p className="inline-flex rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide">{t('print.officialDocument')}</p>
                                <p className="mt-3 font-semibold">{loan.loan_code}</p>
                                <p className="text-slate-500">{loan.status ? t(`loans.${loan.status}`) : '-'}</p>
                                <p className="text-slate-500">{t('print.generatedAt')}: {meta?.generated_at}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 border-b border-slate-200 pb-4 print:border-slate-300">
                        <h2 className="text-xl font-bold">{t('print.loanStatement')}</h2>
                        <p className="mt-1 text-sm text-slate-500">{t('print.loanStatementSubtitle')}</p>
                    </div>

                    <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                        {[
                            [t('loans.customer'), loan.customer ? `${loan.customer.name} (${loan.customer.customer_code})` : '-'],
                            [t('loans.principalAmount'), money(loan.principal_amount, locale)],
                            [t('loans.interestAmount'), money(loan.interest_amount, locale)],
                            [t('loans.totalPayable'), money(loan.total_payable, locale)],
                            [t('loans.duration'), loan.duration_label || `${loan.duration_value} ${t(`loans.${loan.duration_unit}`)}`],
                            [t('loans.frequency'), loan.collection_frequency_label || t(`loans.${loan.collection_frequency}`)],
                            [t('loans.startDate'), loan.start_date],
                            [t('loans.firstCollectionDate'), loan.first_collection_date],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-2xl border border-slate-200 p-4 print:border-slate-300">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
                                <p className="mt-2 text-sm font-semibold text-slate-900">{value || '-'}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 rounded-2xl border border-slate-200 p-4 print:border-slate-300">
                        <h2 className="text-base font-semibold">{t('loans.guarantorCoverage')}</h2>
                        <div className="mt-3 space-y-2">
                            {loan.guarantors?.length ? loan.guarantors.map((guarantor) => (
                                <div key={guarantor.id} className="flex items-center justify-between gap-4 border-b border-slate-200 py-2 last:border-b-0 print:border-slate-300">
                                    <div>
                                        <p className="font-medium">{guarantor.name}</p>
                                        <p className="text-sm text-slate-500">{guarantor.guarantor_code} · {guarantor.phone}</p>
                                    </div>
                                    <div className="text-sm text-slate-600">{guarantor.relationship || '-'}</div>
                                </div>
                            )) : <p className="text-sm text-slate-500">{t('loans.noGuarantorsLinked')}</p>}
                        </div>
                    </div>

                    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 p-0 print:border-slate-300">
                        <div className="border-b border-slate-200 px-4 py-3 print:border-slate-300">
                            <h2 className="text-base font-semibold">{t('print.installmentSchedule')}</h2>
                        </div>
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 print:bg-slate-100">
                                <tr>
                                    {[t('installments.installmentNo'), t('installments.dueDate'), t('installments.principal'), t('installments.interest'), t('installments.amount'), t('installments.paid'), t('installments.status')].map((label) => (
                                        <th key={label} className="px-4 py-3 text-left font-medium text-slate-500">{label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loan.installments?.length ? loan.installments.map((item) => (
                                    <tr key={item.id} className="border-t border-slate-200 print:border-slate-300">
                                        <td className="px-4 py-3">{item.installment_no_label || item.installment_no}</td>
                                        <td className="px-4 py-3">{item.due_date}</td>
                                        <td className="px-4 py-3">{item.principal_component_money || money(item.principal_component, locale)}</td>
                                        <td className="px-4 py-3">{item.interest_component_money || money(item.interest_component, locale)}</td>
                                        <td className="px-4 py-3">{item.installment_amount_money || money(item.installment_amount, locale)}</td>
                                        <td className="px-4 py-3">{item.paid_amount_money || money(item.paid_amount, locale)}</td>
                                        <td className="px-4 py-3">{item.status_label || t(`installments.${item.status}`)}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-8 text-center text-slate-500">{t('installments.noInstallments')}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
