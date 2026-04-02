import { useEffect, useMemo, useState } from 'react';
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

function StickySummaryCard({ items = [] }) {
    return (
        <div className="sticky top-4 z-20">
            <AppCard>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {items.map((item) => (
                        <div
                            key={item.label}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950"
                        >
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                {item.label}
                            </p>
                            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                {item.value}
                            </p>
                            {item.hint ? (
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    {item.hint}
                                </p>
                            ) : null}
                        </div>
                    ))}
                </div>
            </AppCard>
        </div>
    );
}

function SearchableGuarantorMultiSelect({
    title,
    description,
    items = [],
    selectedIds = [],
    onToggle,
    onClear,
    search,
    setSearch,
    emptyText,
    searchPlaceholder,
    selectedText,
}) {
    const selectedItems = items.filter((item) => selectedIds.includes(String(item.id)));

    return (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {title}
                </h3>
                {description ? (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {description}
                    </p>
                ) : null}
            </div>

            <div className="p-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                        <AppInput
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={searchPlaceholder}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                            {selectedText}: {selectedIds.length}
                        </span>

                        {selectedIds.length ? (
                            <button
                                type="button"
                                onClick={onClear}
                                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                            >
                                Clear
                            </button>
                        ) : null}
                    </div>
                </div>

                {selectedItems.length ? (
                    <div className="mb-4 flex flex-wrap gap-2">
                        {selectedItems.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onToggle(item.id)}
                                className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/60"
                            >
                                <span>{item.name}</span>
                                <span className="text-xs">×</span>
                            </button>
                        ))}
                    </div>
                ) : null}

                {items.length ? (
                    <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                        {items.map((guarantor) => {
                            const checked = selectedIds.includes(String(guarantor.id));

                            return (
                                <label
                                    key={guarantor.id}
                                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                                        checked
                                            ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/30'
                                            : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        className="mt-1"
                                        checked={checked}
                                        onChange={() => onToggle(guarantor.id)}
                                    />

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-medium text-slate-900 dark:text-slate-100">
                                                {guarantor.name}
                                            </p>
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                {guarantor.guarantor_code}
                                            </span>
                                        </div>

                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                            {guarantor.phone}
                                            {guarantor.relationship ? ` • ${guarantor.relationship}` : ''}
                                        </p>

                                        {guarantor.customer?.name ? (
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                {guarantor.customer.name} ({guarantor.customer.customer_code})
                                            </p>
                                        ) : null}
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                        {emptyText}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function LoanForm({
    mode = 'create',
    action,
    method = 'post',
    loanCode,
    loan,
    selectedCustomer = null,
    customers = [],
    guarantors = [],
    staffOptions = [],
}) {
    const { t, locale } = useLocale();
    const isBangla = locale === 'bn';
    const [guarantorSearch, setGuarantorSearch] = useState('');

    const tr = (key, en, bn) => {
        const value = t(key);
        if (!value || value === key) {
            return isBangla ? bn : en;
        }
        return value;
    };

    const form = useForm({
        customer_id: loan?.customer_id
            ? String(loan.customer_id)
            : selectedCustomer?.id
              ? String(selectedCustomer.id)
              : '',
        guarantor_ids: loan?.guarantor_ids?.map((id) => String(id)) ?? [],
        principal_amount: loan?.principal_amount ?? '',
        interest_rate: loan?.interest_rate ?? '',
        duration_value: loan?.duration_value ?? 12,
        duration_unit: loan?.duration_unit ?? 'months',
        collection_frequency: loan?.collection_frequency ?? 'weekly',
        start_date: loan?.start_date ?? '',
        first_collection_date: loan?.first_collection_date ?? '',
        status: loan?.status ?? 'active',
        notes: loan?.notes ?? '',
        assigned_staff_id: loan?.assigned_staff_id ? String(loan.assigned_staff_id) : '',
    });

    const filteredGuarantorsByCustomer = useMemo(() => {
        if (!form.data.customer_id) {
            return guarantors;
        }

        return guarantors.filter(
            (guarantor) => String(guarantor.customer_id) === String(form.data.customer_id)
        );
    }, [guarantors, form.data.customer_id]);

    const searchableGuarantors = useMemo(() => {
        const q = guarantorSearch.trim().toLowerCase();

        if (!q) {
            return filteredGuarantorsByCustomer;
        }

        return filteredGuarantorsByCustomer.filter((guarantor) => {
            const haystack = [
                guarantor.name,
                guarantor.guarantor_code,
                guarantor.phone,
                guarantor.relationship,
                guarantor.customer?.name,
                guarantor.customer?.customer_code,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return haystack.includes(q);
        });
    }, [filteredGuarantorsByCustomer, guarantorSearch]);

    useEffect(() => {
        form.setData((data) => ({
            ...data,
            guarantor_ids: data.guarantor_ids.filter((id) =>
                filteredGuarantorsByCustomer.some(
                    (guarantor) => String(guarantor.id) === String(id)
                )
            ),
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

    const totalPayable = useMemo(() => {
        const principal = Number(form.data.principal_amount || 0);
        return principal + interestAmount;
    }, [form.data.principal_amount, interestAmount]);

    const submit = (event) => {
        event.preventDefault();

        if (method === 'put') {
            form.put(action, {
                preserveScroll: true,
            });
            return;
        }

        form.post(action, {
            preserveScroll: true,
        });
    };

    const toggleGuarantor = (id) => {
        const stringId = String(id);

        form.setData(
            'guarantor_ids',
            form.data.guarantor_ids.includes(stringId)
                ? form.data.guarantor_ids.filter((item) => item !== stringId)
                : [...form.data.guarantor_ids, stringId]
        );
    };

    const selectedCustomerName = useMemo(() => {
        const item = customers.find((customer) => String(customer.id) === String(form.data.customer_id));
        return item ? `${item.name} (${item.customer_code})` : tr('loans.selectCustomer', 'Select Customer', 'গ্রাহক নির্বাচন করুন');
    }, [customers, form.data.customer_id]);

    const selectedStaffName = useMemo(() => {
        const item = staffOptions.find((staff) => String(staff.id) === String(form.data.assigned_staff_id));
        return item ? item.name : tr('common.unassigned', 'Unassigned', 'অনির্ধারিত');
    }, [staffOptions, form.data.assigned_staff_id]);

    return (
        <form onSubmit={submit} className="space-y-6">
            <StickySummaryCard
                items={[
                    {
                        label: tr('loans.loanCode', 'Loan Code', 'ঋণ কোড'),
                        value: loan?.loan_code ?? loanCode,
                    },
                    {
                        label: tr('loans.interestAmount', 'Interest Amount', 'সুদ'),
                        value: money(interestAmount),
                    },
                    {
                        label: tr('loans.totalPayable', 'Total Payable', 'মোট পরিশোধযোগ্য'),
                        value: money(totalPayable),
                    },
                    {
                        label: tr('loans.selectedGuarantors', 'Selected Guarantors', 'নির্বাচিত জামিনদার'),
                        value: form.data.guarantor_ids.length,
                    },
                ]}
            />

            <FormSection
                title={tr('loans.customerAndTerms', 'Customer and Loan Terms', 'গ্রাহক ও ঋণের শর্ত')}
                description={tr(
                    'loans.customerAndTermsHint',
                    'Define customer, staff, loan amount, interest, duration, and collection setup.',
                    'গ্রাহক, দায়িত্বপ্রাপ্ত কর্মকর্তা, ঋণের পরিমাণ, সুদ, সময়সীমা এবং সংগ্রহের নিয়ম নির্ধারণ করুন।'
                )}
            >
                <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            {tr('loans.customer', 'Customer', 'গ্রাহক')}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {selectedCustomerName}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            {tr('loans.assignedStaff', 'Assigned Staff', 'দায়িত্বপ্রাপ্ত কর্মকর্তা')}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {selectedStaffName}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            {tr('loans.status', 'Status', 'স্ট্যাটাস')}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {tr(`loans.${form.data.status}`, form.data.status, form.data.status)}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            {tr('loans.frequency', 'Collection Frequency', 'সংগ্রহের নিয়ম')}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {tr(`loans.${form.data.collection_frequency}`, form.data.collection_frequency, form.data.collection_frequency)}
                        </p>
                    </div>
                </div>

                <FormGrid>
                    <div>
                        <AppLabel htmlFor="customer_id">
                            {tr('loans.customer', 'Customer', 'গ্রাহক')}
                        </AppLabel>
                        <AppSelect
                            id="customer_id"
                            value={form.data.customer_id}
                            onChange={(event) => form.setData('customer_id', event.target.value)}
                        >
                            <option value="">
                                {tr('loans.selectCustomer', 'Select Customer', 'গ্রাহক নির্বাচন করুন')}
                            </option>
                            {customers.map((customer) => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name} ({customer.customer_code})
                                </option>
                            ))}
                        </AppSelect>
                        <FormError>{form.errors.customer_id}</FormError>
                    </div>

                    <div>
                        <AppLabel htmlFor="assigned_staff_id">
                            {tr('loans.assignedStaff', 'Assigned Staff', 'দায়িত্বপ্রাপ্ত কর্মকর্তা')}
                        </AppLabel>
                        <AppSelect
                            id="assigned_staff_id"
                            value={form.data.assigned_staff_id}
                            onChange={(event) => form.setData('assigned_staff_id', event.target.value)}
                        >
                            <option value="">
                                {tr('common.unassigned', 'Unassigned', 'অনির্ধারিত')}
                            </option>
                            {staffOptions.map((staff) => (
                                <option key={staff.id} value={staff.id}>
                                    {staff.name}
                                    {staff.roles?.length ? ` (${staff.roles.join(', ')})` : ''}
                                </option>
                            ))}
                        </AppSelect>
                        <FieldHint>
                            {tr(
                                'loans.assignedStaffHint',
                                'Choose the admin/staff member responsible for this loan.',
                                'এই ঋণের দায়িত্বে কোন কর্মকর্তা থাকবেন তা নির্বাচন করুন।'
                            )}
                        </FieldHint>
                        <FormError>{form.errors.assigned_staff_id}</FormError>
                    </div>

                    <div>
                        <AppLabel htmlFor="status">
                            {tr('loans.status', 'Status', 'স্ট্যাটাস')}
                        </AppLabel>
                        <AppSelect
                            id="status"
                            value={form.data.status}
                            onChange={(event) => form.setData('status', event.target.value)}
                        >
                            <option value="active">{tr('loans.active', 'Active', 'চলমান')}</option>
                            <option value="closed">{tr('loans.closed', 'Closed', 'বন্ধ')}</option>
                            <option value="defaulted">{tr('loans.defaulted', 'Defaulted', 'বকেয়া')}</option>
                        </AppSelect>
                        <FieldHint>
                            {tr(
                                'loans.directActiveFlowHint',
                                'Loans are created in the active flow now. Use closed or defaulted only for existing record corrections.',
                                'এখন লোন সরাসরি সক্রিয় ফ্লোতে তৈরি হয়। শুধু পুরোনো রেকর্ড ঠিক করতে closed বা defaulted ব্যবহার করুন।'
                            )}
                        </FieldHint>
                        <FormError>{form.errors.status}</FormError>
                    </div>

                    <div>
                        <AppLabel htmlFor="principal_amount">
                            {tr('loans.principalAmount', 'Principal Amount', 'মূল ঋণ')}
                        </AppLabel>
                        <AppInput
                            id="principal_amount"
                            type="number"
                            min="1"
                            step="0.01"
                            value={form.data.principal_amount}
                            onChange={(event) => form.setData('principal_amount', event.target.value)}
                        />
                        <FormError>{form.errors.principal_amount}</FormError>
                    </div>

                    <div>
                        <AppLabel htmlFor="interest_rate">
                            {tr('loans.interestRate', 'Interest Rate', 'সুদের হার')}
                        </AppLabel>
                        <AppInput
                            id="interest_rate"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={form.data.interest_rate}
                            onChange={(event) => form.setData('interest_rate', event.target.value)}
                        />
                        <FieldHint>
                            {tr(
                                'loans.flatInterestHint',
                                'Flat interest will be calculated automatically from principal × rate.',
                                'মূল ঋণ × সুদের হার অনুযায়ী ফ্ল্যাট সুদ স্বয়ংক্রিয়ভাবে হিসাব হবে।'
                            )}
                        </FieldHint>
                        <FormError>{form.errors.interest_rate}</FormError>
                    </div>

                    <div>
                        <AppLabel htmlFor="duration_value">
                            {tr('loans.durationValue', 'Duration Value', 'সময়কাল')}
                        </AppLabel>
                        <AppInput
                            id="duration_value"
                            type="number"
                            min="1"
                            max="120"
                            value={form.data.duration_value}
                            onChange={(event) => form.setData('duration_value', event.target.value)}
                        />
                        <FormError>{form.errors.duration_value}</FormError>
                    </div>

                    <div>
                        <AppLabel htmlFor="duration_unit">
                            {tr('loans.durationUnit', 'Duration Unit', 'সময়ের একক')}
                        </AppLabel>
                        <AppSelect
                            id="duration_unit"
                            value={form.data.duration_unit}
                            onChange={(event) => form.setData('duration_unit', event.target.value)}
                        >
                            <option value="days">{tr('loans.days', 'Days', 'দিন')}</option>
                            <option value="weeks">{tr('loans.weeks', 'Weeks', 'সপ্তাহ')}</option>
                            <option value="months">{tr('loans.months', 'Months', 'মাস')}</option>
                        </AppSelect>
                        <FormError>{form.errors.duration_unit}</FormError>
                    </div>

                    <div>
                        <AppLabel htmlFor="collection_frequency">
                            {tr('loans.frequency', 'Collection Frequency', 'সংগ্রহের নিয়ম')}
                        </AppLabel>
                        <AppSelect
                            id="collection_frequency"
                            value={form.data.collection_frequency}
                            onChange={(event) => form.setData('collection_frequency', event.target.value)}
                        >
                            <option value="daily">{tr('loans.daily', 'Daily', 'দৈনিক')}</option>
                            <option value="weekly">{tr('loans.weekly', 'Weekly', 'সাপ্তাহিক')}</option>
                            <option value="monthly">{tr('loans.monthly', 'Monthly', 'মাসিক')}</option>
                        </AppSelect>
                        <FormError>{form.errors.collection_frequency}</FormError>
                    </div>

                    <div>
                        <AppLabel htmlFor="start_date">
                            {tr('loans.startDate', 'Start Date', 'শুরুর তারিখ')}
                        </AppLabel>
                        <AppInput
                            id="start_date"
                            type="date"
                            value={form.data.start_date}
                            onChange={(event) => form.setData('start_date', event.target.value)}
                        />
                        <FormError>{form.errors.start_date}</FormError>
                    </div>

                    <div>
                        <AppLabel htmlFor="first_collection_date">
                            {tr('loans.firstCollectionDate', 'First Collection Date', 'প্রথম কিস্তির তারিখ')}
                        </AppLabel>
                        <AppInput
                            id="first_collection_date"
                            type="date"
                            value={form.data.first_collection_date}
                            onChange={(event) => form.setData('first_collection_date', event.target.value)}
                        />
                        <FieldHint>
                            {tr(
                                'loans.firstCollectionHint',
                                'You may leave this empty if the collection starts from the regular cycle.',
                                'নিয়মিত সময় থেকে কিস্তি শুরু হলে এটি খালি রাখা যেতে পারে।'
                            )}
                        </FieldHint>
                        <FormError>{form.errors.first_collection_date}</FormError>
                    </div>
                </FormGrid>
            </FormSection>

            <SearchableGuarantorMultiSelect
                title={tr('loans.guarantorSelection', 'Guarantor Selection', 'জামিনদার নির্বাচন')}
                description={tr(
                    'loans.guarantorSelectionHint',
                    'Search, select, and manage multiple guarantors for this loan.',
                    'এই ঋণের জন্য একাধিক জামিনদার খুঁজে নির্বাচন করুন।'
                )}
                items={form.data.customer_id ? searchableGuarantors : []}
                selectedIds={form.data.guarantor_ids}
                onToggle={toggleGuarantor}
                onClear={() => form.setData('guarantor_ids', [])}
                search={guarantorSearch}
                setSearch={setGuarantorSearch}
                emptyText={
                    !form.data.customer_id
                        ? tr('loans.selectCustomerFirst', 'Select a customer first.', 'আগে একজন গ্রাহক নির্বাচন করুন।')
                        : tr('loans.noCustomerGuarantors', 'No guarantors found for this customer.', 'এই গ্রাহকের জন্য কোনো জামিনদার পাওয়া যায়নি।')
                }
                searchPlaceholder={tr(
                    'loans.searchGuarantor',
                    'Search by name, code, phone, or relationship...',
                    'নাম, কোড, মোবাইল বা সম্পর্ক লিখে খুঁজুন...'
                )}
                selectedText={tr('loans.selectedGuarantors', 'Selected', 'নির্বাচিত')}
            />

            {form.data.customer_id && !filteredGuarantorsByCustomer.length ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-4 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {tr(
                            'loans.noCustomerGuarantors',
                            'No guarantors available for this customer.',
                            'এই গ্রাহকের জন্য কোনো জামিনদার নেই।'
                        )}
                    </p>
                    <div className="mt-3">
                        <Link href={`/guarantors/create?customer_id=${form.data.customer_id}`}>
                            <AppButton variant="outline" size="sm">
                                {tr('loans.addGuarantor', 'Add Guarantor', 'জামিনদার যোগ করুন')}
                            </AppButton>
                        </Link>
                    </div>
                </div>
            ) : null}

            <FormError>{form.errors.guarantor_ids}</FormError>

            <FormSection
                title={tr('loans.additionalNotes', 'Additional Notes', 'অতিরিক্ত নোট')}
                description={tr(
                    'loans.additionalNotesHint',
                    'Write any approval, disbursement, or collection note here.',
                    'অনুমোদন, বিতরণ বা সংগ্রহ সংক্রান্ত অতিরিক্ত তথ্য এখানে লিখুন।'
                )}
            >
                <div>
                    <AppLabel htmlFor="notes">
                        {tr('loans.notes', 'Notes', 'নোট')}
                    </AppLabel>
                    <AppTextarea
                        id="notes"
                        rows={4}
                        value={form.data.notes}
                        onChange={(event) => form.setData('notes', event.target.value)}
                    />
                    <FormError>{form.errors.notes}</FormError>
                </div>
            </FormSection>

            <div className="sticky bottom-4 z-20">
                <div className="flex flex-wrap justify-end gap-3 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
                    <Link href="/loans">
                        <AppButton variant="outline">
                            {tr('common.cancel', 'Cancel', 'বাতিল')}
                        </AppButton>
                    </Link>

                    <AppButton type="submit" disabled={form.processing}>
                        {form.processing
                            ? tr('common.loading', 'Processing...', 'প্রসেস হচ্ছে...')
                            : mode === 'edit'
                              ? tr('loans.updateLoan', 'Update Loan', 'ঋণ হালনাগাদ করুন')
                              : tr('loans.saveLoan', 'Save Loan', 'ঋণ সংরক্ষণ করুন')}
                    </AppButton>
                </div>
            </div>
        </form>
    );
}