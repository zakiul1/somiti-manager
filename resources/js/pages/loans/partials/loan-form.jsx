import { useEffect, useMemo } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { AppCard } from '@/components/ui/app-card';
import { AppInput } from '@/components/ui/app-input';
import { AppLabel } from '@/components/ui/app-label';
import { AppSelect } from '@/components/ui/app-select';
import { AppTextarea } from '@/components/ui/app-textarea';
import { AppButton } from '@/components/ui/app-button';
import { FormGrid } from '@/components/forms/form-grid';
import { FormSection } from '@/components/forms/form-section';
import { FormError } from '@/components/forms/form-error';
import { FieldHint } from '@/components/forms/field-hint';
import { useLocale } from '@/hooks/use-locale';

function money(value) {
    const number = Number(value || 0);
    if (Number.isNaN(number)) {
        return '0.00';
    }
    return number.toFixed(2);
}

export default function LoanForm({ mode = 'create', action, method = 'post', loanCode, loan, selectedCustomer = null, customers = [], guarantors = [], staffOptions = [] }) {
    const { t } = useLocale();

    const form = useForm({
        customer_id: loan?.customer_id ? String(loan.customer_id) : selectedCustomer?.id ? String(selectedCustomer.id) : '',
        guarantor_ids: loan?.guarantor_ids?.map((id) => String(id)) ?? [],
        principal_amount: loan?.principal_amount ?? '',
        interest_rate: loan?.interest_rate ?? '',
        duration_value: loan?.duration_value ?? 12,
        duration_unit: loan?.duration_unit ?? 'months',
        collection_frequency: loan?.collection_frequency ?? 'weekly',
        start_date: loan?.start_date ?? '',
        first_collection_date: loan?.first_collection_date ?? '',
        status: loan?.status ?? 'draft',
        notes: loan?.notes ?? '',
        assigned_staff_id: loan?.assigned_staff_id ? String(loan.assigned_staff_id) : '',
    });

    const filteredGuarantors = useMemo(() => {
        if (!form.data.customer_id) {
            return guarantors;
        }
        return guarantors.filter((guarantor) => String(guarantor.customer_id) === String(form.data.customer_id));
    }, [guarantors, form.data.customer_id]);

    useEffect(() => {
        form.setData((data) => ({
            ...data,
            guarantor_ids: data.guarantor_ids.filter((id) => filteredGuarantors.some((guarantor) => String(guarantor.id) === String(id))),
        }));
    }, [form.data.customer_id]);

    const interestAmount = useMemo(() => {
        const principal = Number(form.data.principal_amount || 0);
        const rate = Number(form.data.interest_rate || 0);
        if (Number.isNaN(principal) || Number.isNaN(rate)) {
            return 0;
        }
        return (principal * rate) / 100;
    }, [form.data.principal_amount, form.data.interest_rate]);

    const totalPayable = useMemo(() => Number(form.data.principal_amount || 0) + interestAmount, [form.data.principal_amount, interestAmount]);

    const submit = (event) => {
        event.preventDefault();

        if (method === 'put') {
            form.put(action);
            return;
        }

        form.post(action);
    };

    const toggleGuarantor = (id) => {
        form.setData('guarantor_ids', form.data.guarantor_ids.includes(String(id))
            ? form.data.guarantor_ids.filter((item) => item !== String(id))
            : [...form.data.guarantor_ids, String(id)]);
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <AppCard>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('loans.loanCode')}</p>
                        <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{loan?.loan_code ?? loanCode}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('loans.interestAmount')}</p>
                        <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{money(interestAmount)}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('loans.totalPayable')}</p>
                        <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{money(totalPayable)}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('loans.selectedGuarantors')}</p>
                        <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{form.data.guarantor_ids.length}</p>
                    </div>
                </div>
            </AppCard>

            <FormSection title={t('loans.customerAndTerms')} description={t('loans.customerAndTermsHint')}>
                <FormGrid>
                    <div>
                        <AppLabel htmlFor="customer_id">{t('loans.customer')}</AppLabel>
                        <AppSelect id="customer_id" value={form.data.customer_id} onChange={(event) => form.setData('customer_id', event.target.value)}>
                            <option value="">{t('loans.selectCustomer')}</option>
                            {customers.map((customer) => (
                                <option key={customer.id} value={customer.id}>{customer.name} ({customer.customer_code})</option>
                            ))}
                        </AppSelect>
                        <FormError>{form.errors.customer_id}</FormError>
                    </div>

                    <div>
                        <AppLabel htmlFor="assigned_staff_id">{t('loans.assignedStaff')}</AppLabel>
                        <AppSelect id="assigned_staff_id" value={form.data.assigned_staff_id} onChange={(event) => form.setData('assigned_staff_id', event.target.value)}>
                            <option value="">{t('common.unassigned')}</option>
                            {staffOptions.map((staff) => (
                                <option key={staff.id} value={staff.id}>{staff.name} ({staff.roles?.join(', ')})</option>
                            ))}
                        </AppSelect>
                        <FormError>{form.errors.assigned_staff_id}</FormError>
                    </div>

                    <div>
                        <AppLabel htmlFor="status">{t('loans.status')}</AppLabel>
                        <AppSelect id="status" value={form.data.status} onChange={(event) => form.setData('status', event.target.value)}>
                            <option value="draft">{t('loans.draft')}</option>
                            <option value="approved">{t('loans.approved')}</option>
                            <option value="active">{t('loans.active')}</option>
                            <option value="closed">{t('loans.closed')}</option>
                            <option value="defaulted">{t('loans.defaulted')}</option>
                        </AppSelect>
                        <FormError>{form.errors.status}</FormError>
                    </div>

                    <div>
                        <AppLabel htmlFor="principal_amount">{t('loans.principalAmount')}</AppLabel>
                        <AppInput id="principal_amount" type="number" min="1" step="0.01" value={form.data.principal_amount} onChange={(event) => form.setData('principal_amount', event.target.value)} />
                        <FormError>{form.errors.principal_amount}</FormError>
                    </div>

                    <div>
                        <AppLabel htmlFor="interest_rate">{t('loans.interestRate')}</AppLabel>
                        <AppInput id="interest_rate" type="number" min="0" max="100" step="0.01" value={form.data.interest_rate} onChange={(event) => form.setData('interest_rate', event.target.value)} />
                        <FieldHint>{t('loans.flatInterestHint')}</FieldHint>
                        <FormError>{form.errors.interest_rate}</FormError>
                    </div>

                    <div>
                        <AppLabel htmlFor="duration_value">{t('loans.durationValue')}</AppLabel>
                        <AppInput id="duration_value" type="number" min="1" max="120" value={form.data.duration_value} onChange={(event) => form.setData('duration_value', event.target.value)} />
                        <FormError>{form.errors.duration_value}</FormError>
                    </div>

                    <div>
                        <AppLabel htmlFor="duration_unit">{t('loans.durationUnit')}</AppLabel>
                        <AppSelect id="duration_unit" value={form.data.duration_unit} onChange={(event) => form.setData('duration_unit', event.target.value)}>
                            <option value="days">{t('loans.days')}</option>
                            <option value="weeks">{t('loans.weeks')}</option>
                            <option value="months">{t('loans.months')}</option>
                        </AppSelect>
                        <FormError>{form.errors.duration_unit}</FormError>
                    </div>

                    <div>
                        <AppLabel htmlFor="collection_frequency">{t('loans.frequency')}</AppLabel>
                        <AppSelect id="collection_frequency" value={form.data.collection_frequency} onChange={(event) => form.setData('collection_frequency', event.target.value)}>
                            <option value="daily">{t('loans.daily')}</option>
                            <option value="weekly">{t('loans.weekly')}</option>
                            <option value="monthly">{t('loans.monthly')}</option>
                        </AppSelect>
                        <FormError>{form.errors.collection_frequency}</FormError>
                    </div>

                    <div>
                        <AppLabel htmlFor="start_date">{t('loans.startDate')}</AppLabel>
                        <AppInput id="start_date" type="date" value={form.data.start_date} onChange={(event) => form.setData('start_date', event.target.value)} />
                        <FormError>{form.errors.start_date}</FormError>
                    </div>

                    <div>
                        <AppLabel htmlFor="first_collection_date">{t('loans.firstCollectionDate')}</AppLabel>
                        <AppInput id="first_collection_date" type="date" value={form.data.first_collection_date} onChange={(event) => form.setData('first_collection_date', event.target.value)} />
                        <FieldHint>{t('loans.firstCollectionHint')}</FieldHint>
                        <FormError>{form.errors.first_collection_date}</FormError>
                    </div>
                </FormGrid>
            </FormSection>

            <FormSection title={t('loans.guarantorSelection')} description={t('loans.guarantorSelectionHint')}>
                {!form.data.customer_id ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                        {t('loans.selectCustomerFirst')}
                    </div>
                ) : filteredGuarantors.length ? (
                    <div className="grid gap-3 md:grid-cols-2">
                        {filteredGuarantors.map((guarantor) => (
                            <label key={guarantor.id} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                <input
                                    type="checkbox"
                                    className="mt-1"
                                    checked={form.data.guarantor_ids.includes(String(guarantor.id))}
                                    onChange={() => toggleGuarantor(guarantor.id)}
                                />
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-slate-100">{guarantor.name}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{guarantor.guarantor_code} • {guarantor.phone}</p>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{guarantor.relationship || '-'}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3 rounded-2xl border border-dashed border-slate-300 p-4 dark:border-slate-700">
                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('loans.noCustomerGuarantors')}</p>
                        {form.data.customer_id ? <Link href={`/guarantors/create?customer_id=${form.data.customer_id}`}><AppButton variant="outline" size="sm">{t('loans.addGuarantor')}</AppButton></Link> : null}
                    </div>
                )}
                <FormError>{form.errors.guarantor_ids}</FormError>
            </FormSection>

            <FormSection title={t('loans.additionalNotes')} description={t('loans.additionalNotesHint')}>
                <div>
                    <AppLabel htmlFor="notes">{t('loans.notes')}</AppLabel>
                    <AppTextarea id="notes" rows={4} value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} />
                    <FormError>{form.errors.notes}</FormError>
                </div>
            </FormSection>

            <div className="flex flex-wrap justify-end gap-3">
                <Link href="/loans"><AppButton variant="outline">{t('common.cancel')}</AppButton></Link>
                <AppButton type="submit" disabled={form.processing}>{mode === 'edit' ? t('loans.updateLoan') : t('loans.saveLoan')}</AppButton>
            </div>
        </form>
    );
}
