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

const money = (value, locale = 'en') => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 2 }).format(Number(value || 0));

export default function PaymentsCreate({ paymentCode, installments, selectedInstallment, admins }) {
    const { t, locale } = useLocale();
    const form = useForm({
        installment_id: selectedInstallment?.id ? String(selectedInstallment.id) : '',
        amount: selectedInstallment?.outstanding_amount ? String(selectedInstallment.outstanding_amount) : '',
        payment_date: new Date().toISOString().slice(0, 10),
        payment_method: 'cash',
        reference_no: '',
        notes: '',
        collected_by: admins?.[0]?.id ? String(admins[0].id) : '',
    });

    const activeInstallment = installments.find((item) => String(item.id) === form.data.installment_id) ?? selectedInstallment;

    const submit = (e) => {
        e.preventDefault();
        form.post('/payments');
    };

    return (
        <>
            <Head title={t('payments.createTitle')} />
            <AppLayout>
                <PageContainer>
                    <PageHeader title={t('payments.createTitle')} description={t('payments.createSubtitle')} />
                    <form onSubmit={submit} className="space-y-6">
                        <AppCard className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('payments.paymentCode')}</p>
                                    <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{paymentCode}</p>
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">{t('payments.collectionHint')}</div>
                            </div>
                            <div>
                                <AppLabel htmlFor="installment_id">{t('payments.installment')}</AppLabel>
                                <AppSelect id="installment_id" value={form.data.installment_id} onChange={(e) => {
                                    form.setData('installment_id', e.target.value);
                                    const selected = installments.find((item) => String(item.id) === e.target.value);
                                    if (selected) {
                                        form.setData('amount', String(selected.outstanding_amount));
                                    }
                                }}>
                                    <option value="">{t('payments.selectInstallment')}</option>
                                    {installments.map((item) => <option key={item.id} value={item.id}>{item.loan?.loan_code} - #{item.installment_no} - {item.customer?.name}</option>)}
                                </AppSelect>
                                <FormError>{form.errors.installment_id}</FormError>
                            </div>
                            {activeInstallment ? (
                                <div className="grid gap-4 md:grid-cols-5 text-sm">
                                    <div><p className="text-slate-500 dark:text-slate-400">{t('payments.customer')}</p><p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{activeInstallment.customer?.name}</p></div>
                                    <div><p className="text-slate-500 dark:text-slate-400">{t('payments.loan')}</p><p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{activeInstallment.loan?.loan_code}</p></div>
                                    <div><p className="text-slate-500 dark:text-slate-400">{t('payments.dueDate')}</p><p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{activeInstallment.due_date}</p></div>
                                    <div><p className="text-slate-500 dark:text-slate-400">{t('payments.installmentAmount')}</p><p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{money(activeInstallment.installment_amount)}</p></div>
                                    <div><p className="text-slate-500 dark:text-slate-400">{t('payments.outstandingAmount')}</p><p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{money(activeInstallment.outstanding_amount)}</p></div>
                                </div>
                            ) : null}
                        </AppCard>

                        <AppCard className="grid gap-4 md:grid-cols-2">
                            <div>
                                <AppLabel htmlFor="amount">{t('payments.amount')}</AppLabel>
                                <AppInput id="amount" type="number" min="0.01" step="0.01" value={form.data.amount} onChange={(e) => form.setData('amount', e.target.value)} />
                                <FormError>{form.errors.amount}</FormError>
                            </div>
                            <div>
                                <AppLabel htmlFor="payment_date">{t('payments.paymentDate')}</AppLabel>
                                <AppInput id="payment_date" type="date" value={form.data.payment_date} onChange={(e) => form.setData('payment_date', e.target.value)} />
                                <FormError>{form.errors.payment_date}</FormError>
                            </div>
                            <div>
                                <AppLabel htmlFor="payment_method">{t('payments.paymentMethod')}</AppLabel>
                                <AppSelect id="payment_method" value={form.data.payment_method} onChange={(e) => form.setData('payment_method', e.target.value)}>
                                    <option value="cash">{t('payments.cash')}</option>
                                    <option value="bank">{t('payments.bank')}</option>
                                    <option value="mobile_banking">{t('payments.mobileBanking')}</option>
                                </AppSelect>
                                <FormError>{form.errors.payment_method}</FormError>
                            </div>
                            <div>
                                <AppLabel htmlFor="collected_by">{t('payments.collectedBy')}</AppLabel>
                                <AppSelect id="collected_by" value={form.data.collected_by} onChange={(e) => form.setData('collected_by', e.target.value)}>
                                    <option value="">{t('common.unassigned')}</option>
                                    {admins.map((admin) => <option key={admin.id} value={admin.id}>{admin.name} ({admin.roles?.join(', ')})</option>)}
                                </AppSelect>
                                <FormError>{form.errors.collected_by}</FormError>
                            </div>
                            <div>
                                <AppLabel htmlFor="reference_no">{t('payments.referenceNo')}</AppLabel>
                                <AppInput id="reference_no" value={form.data.reference_no} onChange={(e) => form.setData('reference_no', e.target.value)} />
                                <FormError>{form.errors.reference_no}</FormError>
                            </div>
                            <div className="md:col-span-2">
                                <AppLabel htmlFor="notes">{t('payments.notes')}</AppLabel>
                                <AppTextarea id="notes" rows={4} value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} />
                                <FormError>{form.errors.notes}</FormError>
                            </div>
                        </AppCard>

                        <div className="flex justify-end gap-3">
                            <Link href="/payments"><AppButton variant="outline">{t('common.cancel')}</AppButton></Link>
                            <AppButton type="submit" disabled={form.processing}>{t('payments.collectPayment')}</AppButton>
                        </div>
                    </form>
                </PageContainer>
            </AppLayout>
        </>
    );
}
