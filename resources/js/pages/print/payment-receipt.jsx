import { Head } from '@inertiajs/react';
import { PrintActions } from '@/components/print/print-actions';
import { useLocale } from '@/hooks/use-locale';

const money = (value, locale) => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 2 }).format(Number(value || 0));

function DetailRow({ label, value }) {
    return (
        <div className="grid grid-cols-2 gap-4 border-b border-slate-200 py-2 text-sm last:border-b-0 print:border-slate-300">
            <div className="font-medium text-slate-600">{label}</div>
            <div className="text-right text-slate-900">{value || '-'}</div>
        </div>
    );
}

export default function PaymentReceiptPage({ payment, organization, meta, pdfDownloadUrl, backHref }) {
    const { t, locale } = useLocale();

    return (
        <>
            <Head title={`${payment.payment_code} - ${t('print.receipt')}`} />
            <div className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 print:bg-white print:px-0 print:py-0">
                <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm print:max-w-none print:rounded-none print:p-8 print:shadow-none">
                    <PrintActions backHref={backHref || `/payments/${payment.id}`} downloadHref={pdfDownloadUrl} saveLabel={t('print.saveReceiptPdf')} />

                    <div className="border-b-2 border-slate-900 pb-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">{organization?.name || t('common.appName')}</h1>
                                {organization?.address ? <p className="mt-1 text-sm text-slate-500">{organization.address}</p> : null}
                                {(organization?.phone || organization?.email) ? <p className="mt-1 text-sm text-slate-500">{[organization?.phone, organization?.email].filter(Boolean).join(' · ')}</p> : null}
                            </div>
                            <div className="text-right text-sm">
                                <p className="inline-flex rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide">{t('print.officialDocument')}</p>
                                <p className="mt-3 font-semibold">{payment.payment_code}</p>
                                <p className="text-slate-500">{payment.payment_date}</p>
                                <p className="text-slate-500">{t('print.generatedAt')}: {meta?.generated_at}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 border-b border-slate-200 pb-4 print:border-slate-300">
                        <h2 className="text-xl font-bold">{t('print.receipt')}</h2>
                        <p className="mt-1 text-sm text-slate-500">{t('print.receiptSubtitle')}</p>
                    </div>

                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 p-4 print:border-slate-300">
                            <h2 className="mb-3 text-base font-semibold">{t('payments.customer')}</h2>
                            <DetailRow label={t('payments.customer')} value={payment.customer ? `${payment.customer.name} (${payment.customer.customer_code})` : '-'} />
                            <DetailRow label={t('payments.loan')} value={payment.loan?.loan_code} />
                            <DetailRow label={t('payments.installment')} value={payment.installment ? `#${payment.installment.installment_no}` : '-'} />
                            <DetailRow label={t('payments.dueDate')} value={payment.installment?.due_date} />
                        </div>
                        <div className="rounded-2xl border border-slate-200 p-4 print:border-slate-300">
                            <h2 className="mb-3 text-base font-semibold">{t('payments.paymentDetails')}</h2>
                            <DetailRow label={t('payments.amount')} value={money(payment.amount, locale)} />
                            <DetailRow label={t('payments.paymentMethod')} value={payment.payment_method_label || (payment.payment_method ? t(`payments.${payment.payment_method}`) : '-')} />
                            <DetailRow label={t('payments.referenceNo')} value={payment.reference_no} />
                            <DetailRow label={t('payments.collectedBy')} value={payment.collector?.name || meta?.prepared_by} />
                        </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-slate-200 p-4 print:border-slate-300">
                        <h2 className="mb-3 text-base font-semibold">{t('print.summary')}</h2>
                        <DetailRow label={t('payments.installmentAmount')} value={money(payment.installment?.installment_amount, locale)} />
                        <DetailRow label={t('payments.totalPaidOnInstallment')} value={money(payment.installment?.paid_amount, locale)} />
                        <DetailRow label={t('payments.installmentStatus')} value={payment.installment?.status_label || (payment.installment?.status ? t(`installments.${payment.installment.status}`) : '-')} />
                        <DetailRow label={t('payments.notes')} value={payment.notes} />
                    </div>
                </div>
            </div>
        </>
    );
}
