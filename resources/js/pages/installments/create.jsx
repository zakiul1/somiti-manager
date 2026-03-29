import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppInput } from '@/components/ui/app-input';
import { AppLabel } from '@/components/ui/app-label';
import { AppSelect } from '@/components/ui/app-select';
import { AppTextarea } from '@/components/ui/app-textarea';
import { FormError } from '@/components/forms/form-error';
import { useLocale } from '@/hooks/use-locale';

export default function InstallmentsCreate({ loans, selectedLoan }) {
    const { t } = useLocale();
    const form = useForm({
        loan_id: selectedLoan?.id ? String(selectedLoan.id) : '',
        first_due_date: selectedLoan?.first_collection_date ?? selectedLoan?.start_date ?? '',
        installment_count: '',
        notes: '',
    });

    const activeLoan = loans.find((loan) => String(loan.id) === form.data.loan_id) ?? selectedLoan;

    const submit = (e) => {
        e.preventDefault();
        form.post('/installments');
    };

    return (
        <>
            <Head title={t('installments.generateSchedule')} />
            <AppLayout>
                <PageContainer>
                    <PageHeader title={t('installments.createTitle')} description={t('installments.createSubtitle')} />
                    <form onSubmit={submit} className="space-y-6">
                        <AppCard className="space-y-4">
                            <div>
                                <AppLabel htmlFor="loan_id">{t('installments.loan')}</AppLabel>
                                <AppSelect id="loan_id" value={form.data.loan_id} onChange={(e) => form.setData('loan_id', e.target.value)}>
                                    <option value="">{t('installments.selectLoan')}</option>
                                    {loans.map((loan) => <option key={loan.id} value={loan.id}>{loan.loan_code} - {loan.customer?.name}</option>)}
                                </AppSelect>
                                <FormError>{form.errors.loan_id}</FormError>
                            </div>
                            {activeLoan ? (
                                <div className="grid gap-4 md:grid-cols-4 text-sm">
                                    <div><p className="text-slate-500 dark:text-slate-400">Customer</p><p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{activeLoan.customer?.name}</p></div>
                                    <div><p className="text-slate-500 dark:text-slate-400">Principal</p><p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{activeLoan.principal_amount}</p></div>
                                    <div><p className="text-slate-500 dark:text-slate-400">Total</p><p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{activeLoan.total_payable}</p></div>
                                    <div><p className="text-slate-500 dark:text-slate-400">Frequency</p><p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{activeLoan.collection_frequency}</p></div>
                                </div>
                            ) : null}
                        </AppCard>

                        <AppCard className="grid gap-4 md:grid-cols-2">
                            <div>
                                <AppLabel htmlFor="first_due_date">{t('installments.firstDueDate')}</AppLabel>
                                <AppInput id="first_due_date" type="date" value={form.data.first_due_date} onChange={(e) => form.setData('first_due_date', e.target.value)} />
                                <FormError>{form.errors.first_due_date}</FormError>
                            </div>
                            <div>
                                <AppLabel htmlFor="installment_count">{t('installments.installmentCount')}</AppLabel>
                                <AppInput id="installment_count" type="number" min="1" max="365" value={form.data.installment_count} onChange={(e) => form.setData('installment_count', e.target.value)} />
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('installments.installmentCountHint')}</p>
                                <FormError>{form.errors.installment_count}</FormError>
                            </div>
                            <div className="md:col-span-2">
                                <AppLabel htmlFor="notes">{t('installments.notes')}</AppLabel>
                                <AppTextarea id="notes" rows={4} value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} />
                                <FormError>{form.errors.notes}</FormError>
                            </div>
                        </AppCard>

                        <div className="flex justify-end gap-3">
                            <Link href="/installments"><AppButton variant="outline">{t('common.cancel')}</AppButton></Link>
                            <AppButton type="submit" disabled={form.processing}>{t('installments.generateSchedule')}</AppButton>
                        </div>
                    </form>
                </PageContainer>
            </AppLayout>
        </>
    );
}
