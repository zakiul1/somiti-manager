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
import { AppBadge } from '@/components/ui/app-badge';
import { FormError } from '@/components/forms/form-error';
import { useLocale } from '@/hooks/use-locale';

const money = (value, locale = 'en') => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 2 }).format(Number(value || 0));

export default function PaymentsCreate({ paymentCode, installments, selectedInstallment, selectedLoan, paymentMode, admins, loanOptions }) {
    const { t, locale } = useLocale();
    const form = useForm({
        payment_mode: paymentMode || 'regular',
        loan_id: selectedLoan?.id ? String(selectedLoan.id) : (selectedInstallment?.loan?.id ? String(selectedInstallment.loan.id) : ''),
        installment_id: selectedInstallment?.id ? String(selectedInstallment.id) : '',
        amount: paymentMode === 'full_settlement'
            ? String(selectedLoan?.financial_summary?.remaining_balance || '')
            : String(selectedInstallment?.outstanding_amount || ''),
        payment_date: new Date().toISOString().slice(0, 10),
        payment_method: 'cash',
        reference_no: '',
        notes: '',
        collected_by: admins?.[0]?.id ? String(admins[0].id) : '',
    });

    const isSettlement = form.data.payment_mode === 'full_settlement';
    const activeInstallment = installments.find((item) => String(item.id) === form.data.installment_id) ?? selectedInstallment ?? null;
    const activeLoan = loanOptions.find((item) => String(item.id) === form.data.loan_id) ?? selectedLoan ?? (activeInstallment?.loan ? {
        id: activeInstallment.loan.id,
        loan_code: activeInstallment.loan.loan_code,
        status: activeInstallment.loan.status,
        customer: activeInstallment.customer,
        financial_summary: {
            remaining_balance: activeInstallment.outstanding_amount,
            next_due_amount: activeInstallment.outstanding_amount,
            next_due_date: activeInstallment.due_date,
            open_installments: 1,
        },
    } : null);

    const submit = (e) => {
        e.preventDefault();
        if (isSettlement && form.data.loan_id) {
            form.post(`/loans/${form.data.loan_id}/settle`);
            return;
        }
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
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('payments.paymentCode')}</p>
                                    <p className="mt-1 break-all text-lg font-semibold text-slate-900 dark:text-slate-100">{paymentCode}</p>
                                </div>
                                <AppBadge variant={isSettlement ? 'warning' : 'success'}>
                                    {isSettlement ? t('payments.fullSettlement') : t('payments.regularCollection')}
                                </AppBadge>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <div>
                                    <AppLabel htmlFor="payment_mode">{t('payments.paymentMode')}</AppLabel>
                                    <AppSelect id="payment_mode" value={form.data.payment_mode} onChange={(e) => {
                                        const mode = e.target.value;
                                        form.setData('payment_mode', mode);
                                        if (mode === 'full_settlement') {
                                            form.setData('installment_id', '');
                                            form.setData('amount', String(activeLoan?.financial_summary?.remaining_balance || ''));
                                        } else {
                                            form.setData('amount', String(activeInstallment?.outstanding_amount || ''));
                                        }
                                    }}>
                                        <option value="regular">{t('payments.regularCollection')}</option>
                                        <option value="full_settlement">{t('payments.fullSettlement')}</option>
                                    </AppSelect>
                                </div>

                                <div className="md:col-span-1 xl:col-span-3">
                                    {isSettlement ? (
                                        <div>
                                            <AppLabel htmlFor="loan_id">{t('payments.loanForSettlement')}</AppLabel>
                                            <AppSelect id="loan_id" value={form.data.loan_id} onChange={(e) => {
                                                form.setData('loan_id', e.target.value);
                                                const selected = loanOptions.find((item) => String(item.id) === e.target.value);
                                                form.setData('amount', String(selected?.financial_summary?.remaining_balance || ''));
                                            }}>
                                                <option value="">{t('payments.selectLoan')}</option>
                                                {loanOptions.map((item) => <option key={item.id} value={item.id}>{item.loan_code} - {item.customer?.name}</option>)}
                                            </AppSelect>
                                            <FormError>{form.errors.loan_id}</FormError>
                                        </div>
                                    ) : (
                                        <div>
                                            <AppLabel htmlFor="installment_id">{t('payments.installment')}</AppLabel>
                                            <AppSelect id="installment_id" value={form.data.installment_id} onChange={(e) => {
                                                form.setData('installment_id', e.target.value);
                                                const selected = installments.find((item) => String(item.id) === e.target.value);
                                                if (selected) {
                                                    form.setData('loan_id', String(selected.loan?.id || ''));
                                                    form.setData('amount', String(selected.outstanding_amount));
                                                }
                                            }}>
                                                <option value="">{t('payments.selectInstallment')}</option>
                                                {installments.map((item) => <option key={item.id} value={item.id}>{item.loan?.loan_code} - #{item.installment_no} - {item.customer?.name}</option>)}
                                            </AppSelect>
                                            <FormError>{form.errors.installment_id}</FormError>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isSettlement && activeLoan ? (
                                <div className="grid gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900/60 dark:bg-amber-950/20 md:grid-cols-5">
                                    <div><p className="text-slate-500 dark:text-slate-400">{t('payments.customer')}</p><p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{activeLoan.customer?.name}</p></div>
                                    <div><p className="text-slate-500 dark:text-slate-400">{t('payments.loan')}</p><p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{activeLoan.loan_code}</p></div>
                                    <div><p className="text-slate-500 dark:text-slate-400">{t('payments.remainingBalance')}</p><p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{money(activeLoan.financial_summary?.remaining_balance, locale)}</p></div>
                                    <div><p className="text-slate-500 dark:text-slate-400">{t('payments.nextDue')}</p><p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{activeLoan.financial_summary?.next_due_date || '-'}</p></div>
                                    <div><p className="text-slate-500 dark:text-slate-400">{t('payments.openInstallments')}</p><p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{activeLoan.financial_summary?.open_installments ?? 0}</p></div>
                                </div>
                            ) : null}

                            {!isSettlement && activeInstallment ? (
                                <div className="grid gap-4 text-sm md:grid-cols-5">
                                    <div><p className="text-slate-500 dark:text-slate-400">{t('payments.customer')}</p><p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{activeInstallment.customer?.name}</p></div>
                                    <div><p className="text-slate-500 dark:text-slate-400">{t('payments.loan')}</p><p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{activeInstallment.loan?.loan_code}</p></div>
                                    <div><p className="text-slate-500 dark:text-slate-400">{t('payments.dueDate')}</p><p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{activeInstallment.due_date}</p></div>
                                    <div><p className="text-slate-500 dark:text-slate-400">{t('payments.installmentAmount')}</p><p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{money(activeInstallment.installment_amount, locale)}</p></div>
                                    <div><p className="text-slate-500 dark:text-slate-400">{t('payments.outstandingAmount')}</p><p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{money(activeInstallment.outstanding_amount, locale)}</p></div>
                                </div>
                            ) : null}
                        </AppCard>

                        <AppCard className="grid gap-4 md:grid-cols-2">
                            <div>
                                <AppLabel htmlFor="amount">{t('payments.amount')}</AppLabel>
                                <AppInput id="amount" type="number" min="0.01" step="0.01" value={form.data.amount} onChange={(e) => form.setData('amount', e.target.value)} />
                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                    {isSettlement ? t('payments.fullSettlementHint') : t('payments.collectionHint')}
                                </p>
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
                            <AppButton type="submit" disabled={form.processing}>{isSettlement ? t('payments.confirmFullSettlement') : t('payments.collectPayment')}</AppButton>
                        </div>
                    </form>
                </PageContainer>
            </AppLayout>
        </>
    );
}
