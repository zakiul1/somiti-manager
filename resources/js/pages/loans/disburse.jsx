import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppCard } from '@/components/ui/app-card';
import { AppInput } from '@/components/ui/app-input';
import { AppLabel } from '@/components/ui/app-label';
import { AppSelect } from '@/components/ui/app-select';
import { AppTextarea } from '@/components/ui/app-textarea';
import { AppButton } from '@/components/ui/app-button';
import { FormError } from '@/components/forms/form-error';
import { FieldHint } from '@/components/forms/field-hint';
import { useLocale } from '@/hooks/use-locale';

function money(value) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(value ?? 0);
}

export default function LoansDisburse({ loan, paymentMethods }) {
    const { t } = useLocale();
    const form = useForm({
        disbursement_amount: loan.principal_amount ?? '',
        disbursed_at: new Date().toISOString().slice(0, 10),
        disbursement_method: 'cash',
        disbursement_reference: '',
        disbursement_notes: '',
    });

    const submit = (event) => {
        event.preventDefault();
        form.post(`/loans/${loan.id}/disburse`);
    };

    return (
        <>
            <Head title={t('loans.disburseTitle')} />
            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={t('loans.disburseTitle')}
                        description={`${t('loans.disburseSubtitle')} ${loan.loan_code}`}
                        actions={<Link href={`/loans/${loan.id}`}><AppButton variant="outline">{t('loans.backToLoan')}</AppButton></Link>}
                    />

                    <form onSubmit={submit} className="space-y-6">
                        <AppCard>
                            <div className="grid gap-4 md:grid-cols-4">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('loans.loanCode')}</p>
                                    <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{loan.loan_code}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('loans.customer')}</p>
                                    <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{loan.customer?.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('loans.principalAmount')}</p>
                                    <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{money(loan.principal_amount)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('loans.totalPayable')}</p>
                                    <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{money(loan.total_payable)}</p>
                                </div>
                            </div>
                        </AppCard>

                        <AppCard>
                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <AppLabel htmlFor="disbursement_amount">{t('loans.disbursementAmount')}</AppLabel>
                                    <AppInput id="disbursement_amount" type="number" min="0.01" step="0.01" value={form.data.disbursement_amount} onChange={(e) => form.setData('disbursement_amount', e.target.value)} />
                                    <FieldHint>{t('loans.disbursementAmountHint')}</FieldHint>
                                    <FormError>{form.errors.disbursement_amount}</FormError>
                                </div>

                                <div>
                                    <AppLabel htmlFor="disbursed_at">{t('loans.disbursedAt')}</AppLabel>
                                    <AppInput id="disbursed_at" type="date" value={form.data.disbursed_at} onChange={(e) => form.setData('disbursed_at', e.target.value)} />
                                    <FormError>{form.errors.disbursed_at}</FormError>
                                </div>

                                <div>
                                    <AppLabel htmlFor="disbursement_method">{t('loans.disbursementMethod')}</AppLabel>
                                    <AppSelect id="disbursement_method" value={form.data.disbursement_method} onChange={(e) => form.setData('disbursement_method', e.target.value)}>
                                        {paymentMethods.map((method) => <option key={method.value} value={method.value}>{t(`payments.${method.value}`)}</option>)}
                                    </AppSelect>
                                    <FormError>{form.errors.disbursement_method}</FormError>
                                </div>

                                <div>
                                    <AppLabel htmlFor="disbursement_reference">{t('loans.disbursementReference')}</AppLabel>
                                    <AppInput id="disbursement_reference" value={form.data.disbursement_reference} onChange={(e) => form.setData('disbursement_reference', e.target.value)} />
                                    <FieldHint>{t('loans.disbursementReferenceHint')}</FieldHint>
                                    <FormError>{form.errors.disbursement_reference}</FormError>
                                </div>
                            </div>

                            <div className="mt-5">
                                <AppLabel htmlFor="disbursement_notes">{t('loans.disbursementNotes')}</AppLabel>
                                <AppTextarea id="disbursement_notes" value={form.data.disbursement_notes} onChange={(e) => form.setData('disbursement_notes', e.target.value)} rows={5} />
                                <FormError>{form.errors.disbursement_notes}</FormError>
                            </div>

                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <AppButton type="submit" disabled={form.processing}>{t('loans.confirmDisbursement')}</AppButton>
                                <Link href={`/loans/${loan.id}`}><AppButton type="button" variant="outline">{t('common.cancel')}</AppButton></Link>
                            </div>
                        </AppCard>
                    </form>
                </PageContainer>
            </AppLayout>
        </>
    );
}
