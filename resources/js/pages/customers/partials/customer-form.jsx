import { useEffect, useMemo, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { AppLabel } from '@/components/ui/app-label';
import { AppSelect } from '@/components/ui/app-select';
import { AppTextarea } from '@/components/ui/app-textarea';
import { FormError } from '@/components/forms/form-error';
import { FieldHint } from '@/components/forms/field-hint';
import { FormGrid } from '@/components/forms/form-grid';
import { useLocale } from '@/hooks/use-locale';

const defaults = {
    name: '',
    phone: '',
    email: '',
    nid_number: '',
    date_of_birth: '',
    gender: '',
    father_name: '',
    mother_name: '',
    spouse_name: '',
    occupation: '',
    present_address: '',
    permanent_address: '',
    status: 'active',
    notes: '',
    assigned_staff_id: '',
    photo: null,
    nid_front: null,
    nid_back: null,
    remove_photo: false,
    remove_nid_front: false,
    remove_nid_back: false,
    create_portal_account: false,
    portal_email: '',
    portal_password: '',
    portal_password_confirmation: '',
    portal_access_enabled: true,
};

function SectionBadge({ children, variant = 'default' }) {
    const styles = {
        default:
            'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
        success:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300',
        warning:
            'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200',
    };

    return (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${styles[variant]}`}>
            {children}
        </div>
    );
}

function FormCard({ title, subtitle, children }) {
    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {title}
                </h3>
                {subtitle ? (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {subtitle}
                    </p>
                ) : null}
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}


function MediaPreviewModal({ open, media, onClose, tr, isBangla }) {
    useEffect(() => {
        if (!open) return undefined;

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    if (!open || !media?.url) {
        return null;
    }

    const isPdf = media?.is_pdf || media?.url?.toLowerCase().endsWith('.pdf');
    const isImage = media?.is_image ?? !isPdf;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
            <div className="relative flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-slate-700 bg-white shadow-2xl dark:bg-slate-950">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                    <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
                            {media.title}
                        </h3>
                        {media.name ? (
                            <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                                {media.name}
                            </p>
                        ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <a
                            href={media.url}
                            download
                            className="inline-flex items-center rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                        >
                            {tr('common.download', 'Download', 'ডাউনলোড')}
                        </a>

                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex items-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                        >
                            {tr('common.close', 'Close', 'বন্ধ করুন')}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto bg-slate-100 p-4 dark:bg-slate-900">
                    <div className="flex min-h-full items-center justify-center">
                        {isPdf ? (
                            <iframe
                                src={media.url}
                                title={media.title}
                                className="h-[78vh] w-full rounded-2xl border border-slate-200 bg-white dark:border-slate-800"
                            />
                        ) : isImage ? (
                            <img
                                src={media.url}
                                alt={media.title}
                                className="max-h-[78vh] w-auto max-w-full rounded-2xl object-contain shadow-xl"
                            />
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                                {isBangla
                                    ? 'এই ফাইলটি এখানে প্রিভিউ করা যাচ্ছে না।'
                                    : 'This file cannot be previewed here.'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


function UploadPreviewCard({
    label,
    helper,
    file,
    currentPreview = null,
    currentUrl = null,
    remove,
    setRemove,
    setFile,
    accept = 'image/*,.pdf',
    removeLabel = 'Remove current file',
    previewLabel = 'Preview',
    openPdfLabel = 'Open current PDF',
    openImageLabel = 'Open image',
    emptyLabel = 'No file selected',
    replaceLabel = 'Upload or replace file',
    onPreview = () => {},
}) {
    const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

    useEffect(() => {
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [objectUrl]);

    const previewUrl = remove ? null : objectUrl || currentPreview?.url || currentUrl || null;
    const hasExistingFile = !!(currentPreview?.url || currentUrl);
    const isPdf =
        file?.type === 'application/pdf' ||
        currentPreview?.is_pdf ||
        (!!previewUrl && previewUrl.toLowerCase().endsWith('.pdf'));

    const isImage =
        !isPdf &&
        (file?.type?.startsWith('image/') ||
            currentPreview?.is_image ||
            (!!previewUrl && !previewUrl.toLowerCase().endsWith('.pdf')));

    const previewMeta = {
        title: label,
        url: previewUrl,
        name: file?.name || currentPreview?.name || null,
        is_pdf: isPdf,
        is_image: isImage,
    };

    const handleRemove = () => {
        const nextValue = !remove;
        setRemove(nextValue);

        if (nextValue) {
            setFile(null);
        }
    };

    const handleSelectFile = (value) => {
        setFile(value);
        setRemove(false);
    };

    return (
        <div className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {label}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {helper}
                        </p>
                    </div>

                    {hasExistingFile ? (
                        <AppButton
                            type="button"
                            variant={remove ? 'outline' : 'danger'}
                            size="sm"
                            onClick={handleRemove}
                            className="shrink-0"
                        >
                            {remove
                                ? (previewMeta.is_image
                                      ? 'Keep current file'
                                      : 'Keep current file')
                                : removeLabel}
                        </AppButton>
                    ) : null}
                </div>
            </div>

            <div className="p-5">
                <div className="mb-4">
                    {previewUrl ? (
                        isPdf ? (
                            <div className="flex h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 text-center dark:border-slate-700 dark:bg-slate-900">
                                <div className="mb-3 text-3xl">📄</div>
                                <button
                                    type="button"
                                    onClick={() => onPreview(previewMeta)}
                                    className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/60"
                                >
                                    {openPdfLabel}
                                </button>
                                {previewMeta.name ? (
                                    <p className="mt-3 break-all text-xs text-slate-500 dark:text-slate-400">
                                        {previewMeta.name}
                                    </p>
                                ) : null}
                            </div>
                        ) : isImage ? (
                            <div className="space-y-3">
                                <button
                                    type="button"
                                    onClick={() => onPreview(previewMeta)}
                                    className="block w-full"
                                >
                                    <img
                                        src={previewUrl}
                                        alt={label}
                                        className="h-44 w-full rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-800"
                                    />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onPreview(previewMeta)}
                                    className="inline-flex rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                    {openImageLabel}
                                </button>
                            </div>
                        ) : (
                            <div className="flex h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                                <div className="mb-2 text-3xl">📎</div>
                                <p>{emptyLabel}</p>
                            </div>
                        )
                    ) : (
                        <div className="flex h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                            <div className="mb-2 text-3xl">📎</div>
                            <p>{remove ? removeLabel : emptyLabel}</p>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-3">
                    {previewUrl ? (
                        <AppButton type="button" variant="outline" onClick={() => onPreview(previewMeta)}>
                            {previewLabel}
                        </AppButton>
                    ) : null}

                    <label className="inline-flex cursor-pointer items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                        <span>{replaceLabel}</span>
                        <input
                            className="hidden"
                            type="file"
                            accept={accept}
                            onChange={(e) => handleSelectFile(e.target.files?.[0] ?? null)}
                        />
                    </label>
                </div>
            </div>
        </div>
    );
}

export default function CustomerForm({
    mode = 'create',
    action,
    method = 'post',
    customerCode = null,
    customer = null,
    staffOptions = [],
}) {
    const { t, locale } = useLocale();
    const isBangla = locale === 'bn';

    const tr = (key, en, bn) => {
        const value = t(key);
        if (!value || value === key) {
            return isBangla ? bn : en;
        }
        return value;
    };

    const [previewMedia, setPreviewMedia] = useState(null);

    const openPreview = (media) => {
        if (media?.url) {
            setPreviewMedia(media);
        }
    };

    const form = useForm({
        ...defaults,
        ...customer,
        portal_email: customer?.portal_account?.email ?? '',
        create_portal_account: mode === 'create' ? false : !!customer?.portal_account,
        portal_access_enabled: customer?.portal_account?.portal_access_enabled ?? true,
    });


    const submit = (e) => {
        e.preventDefault();

        if (method === 'put' || method === 'patch') {
            form.transform((data) => ({
                ...data,
                _method: method,
            }));

            form.post(action, {
                forceFormData: true,
                preserveScroll: true,
                onError: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
                onFinish: () => form.transform((data) => data),
            });
            return;
        }

        form.post(action, {
            forceFormData: true,
            preserveScroll: true,
            onError: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
        });
    };


    return (
        <>
        <form onSubmit={submit} className="space-y-8">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-sky-50 shadow-sm dark:border-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
                <div className="flex flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            {mode === 'create'
                                ? tr('customers.createCustomer', 'Create Customer', 'নতুন গ্রাহক তৈরি')
                                : tr('customers.updateCustomer', 'Update Customer', 'গ্রাহকের তথ্য হালনাগাদ')}
                        </h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            {mode === 'create'
                                ? tr(
                                      'customers.createCustomerSubtitle',
                                      'Save customer details, identity documents, and portal access in one clean form.',
                                      'সুন্দরভাবে গ্রাহকের তথ্য, পরিচয়পত্র এবং পোর্টাল অ্যাক্সেস সংরক্ষণ করুন।'
                                  )
                                : tr(
                                      'customers.updateCustomerSubtitle',
                                      'Update customer profile, photos, addresses, and portal information as needed.',
                                      'গ্রাহকের তথ্য, ছবি, ঠিকানা ও পোর্টাল তথ্য প্রয়োজন অনুযায়ী পরিবর্তন করুন।'
                                  )}
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                {tr('customers.customerCode', 'Customer Code', 'গ্রাহক কোড')}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {customerCode || t('common.autoGenerated')}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                {tr('customers.formMode', 'Form Type', 'ফর্ম ধরন')}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {mode === 'create'
                                    ? tr('common.create', 'Create', 'তৈরি')
                                    : tr('common.update', 'Update', 'হালনাগাদ')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <FormCard
                title={tr('customers.basicInfo', 'Basic Information', 'মৌলিক তথ্য')}
                subtitle={tr(
                    'customers.recordSummarySubtitle',
                    'Fill in customer identity, contact, address, and family details carefully.',
                    'গ্রাহকের পরিচয়, মোবাইল নম্বর, ঠিকানা ও পারিবারিক তথ্য সঠিকভাবে পূরণ করুন।'
                )}
            >
                <div className="mb-6">
                    <SectionBadge>
                        {isBangla
                            ? 'যে ঘরগুলো প্রয়োজনীয়, সেগুলো অবশ্যই পূরণ করুন। ভুল তথ্য দিলে পরে সমস্যা হতে পারে।'
                            : 'Please complete all required fields carefully. Incorrect data may cause issues later.'}
                    </SectionBadge>
                </div>

                <FormGrid>
                    <div>
                        <AppLabel>{tr('customers.customerCode', 'Customer Code', 'গ্রাহক কোড')}</AppLabel>
                        <AppInput value={customerCode || t('common.autoGenerated')} disabled />
                    </div>

                    <div>
                        <AppLabel>{tr('customers.name', 'Name', 'নাম')}</AppLabel>
                        <AppInput
                            value={form.data.name}
                            placeholder={t('customers.namePlaceholder')}
                            onChange={(e) => form.setData('name', e.target.value)}
                        />
                        <FormError message={form.errors.name} />
                    </div>

                    <div>
                        <AppLabel>{tr('customers.phone', 'Phone', 'মোবাইল নম্বর')}</AppLabel>
                        <AppInput
                            value={form.data.phone}
                            placeholder={t('customers.phonePlaceholder')}
                            onChange={(e) => form.setData('phone', e.target.value)}
                        />
                        <FieldHint>
                            {tr(
                                'portal.customerPhoneLoginHint',
                                'This phone number may be used for contact or portal-related access.',
                                'প্রয়োজনে এই মোবাইল নম্বর লগইন বা যোগাযোগের জন্য ব্যবহার করা যাবে।'
                            )}
                        </FieldHint>
                        <FormError message={form.errors.phone} />
                    </div>

                    <div>
                        <AppLabel>{tr('customers.email', 'Email', 'ইমেইল')}</AppLabel>
                        <AppInput
                            type="email"
                            value={form.data.email}
                            placeholder={t('customers.emailPlaceholder')}
                            onChange={(e) => form.setData('email', e.target.value)}
                        />
                        <FieldHint>
                            {tr(
                                'portal.customerEmailLoginHint',
                                'If portal access is enabled, this email can be used as login.',
                                'পোর্টাল চালু করলে ইমেইল লগইন হিসেবে ব্যবহার হতে পারে।'
                            )}
                        </FieldHint>
                        <FormError message={form.errors.email} />
                    </div>

                    <div>
                        <AppLabel>{tr('customers.nidNumber', 'NID Number', 'এনআইডি নম্বর')}</AppLabel>
                        <AppInput
                            value={form.data.nid_number}
                            placeholder={t('customers.nidPlaceholder')}
                            onChange={(e) => form.setData('nid_number', e.target.value)}
                        />
                        <FormError message={form.errors.nid_number} />
                    </div>

                    <div>
                        <AppLabel>{tr('customers.dateOfBirth', 'Date of Birth', 'জন্ম তারিখ')}</AppLabel>
                        <AppInput
                            type="date"
                            value={form.data.date_of_birth || ''}
                            onChange={(e) => form.setData('date_of_birth', e.target.value)}
                        />
                        <FormError message={form.errors.date_of_birth} />
                    </div>

                    <div>
                        <AppLabel>{tr('customers.gender', 'Gender', 'লিঙ্গ')}</AppLabel>
                        <AppSelect
                            value={form.data.gender || ''}
                            onChange={(e) => form.setData('gender', e.target.value)}
                        >
                            <option value="">{tr('common.selectOption', 'Select option', 'নির্বাচন করুন')}</option>
                            <option value="male">{tr('customers.male', 'Male', 'পুরুষ')}</option>
                            <option value="female">{tr('customers.female', 'Female', 'মহিলা')}</option>
                            <option value="other">{tr('customers.other', 'Other', 'অন্যান্য')}</option>
                        </AppSelect>
                        <FormError message={form.errors.gender} />
                    </div>

                    <div>
                        <AppLabel>{tr('customers.status', 'Status', 'স্ট্যাটাস')}</AppLabel>
                        <AppSelect
                            value={form.data.status}
                            onChange={(e) => form.setData('status', e.target.value)}
                        >
                            <option value="active">{tr('customers.active', 'Active', 'সক্রিয়')}</option>
                            <option value="inactive">{tr('customers.inactive', 'Inactive', 'নিষ্ক্রিয়')}</option>
                        </AppSelect>
                        <FormError message={form.errors.status} />
                    </div>

                    <div>
                        <AppLabel>{tr('customers.fatherName', 'Father Name', 'পিতার নাম')}</AppLabel>
                        <AppInput
                            value={form.data.father_name || ''}
                            onChange={(e) => form.setData('father_name', e.target.value)}
                        />
                    </div>

                    <div>
                        <AppLabel>{tr('customers.motherName', 'Mother Name', 'মাতার নাম')}</AppLabel>
                        <AppInput
                            value={form.data.mother_name || ''}
                            onChange={(e) => form.setData('mother_name', e.target.value)}
                        />
                    </div>

                    <div>
                        <AppLabel>{tr('customers.spouseName', 'Spouse Name', 'স্বামী/স্ত্রীর নাম')}</AppLabel>
                        <AppInput
                            value={form.data.spouse_name || ''}
                            onChange={(e) => form.setData('spouse_name', e.target.value)}
                        />
                    </div>

                    <div>
                        <AppLabel>{tr('customers.occupation', 'Occupation', 'পেশা')}</AppLabel>
                        <AppInput
                            value={form.data.occupation || ''}
                            placeholder={isBangla ? 'যেমন: ব্যবসা, চাকরি, কৃষক' : 'Example: Business, Teacher, Farmer'}
                            onChange={(e) => form.setData('occupation', e.target.value)}
                        />
                    </div>

                    <div>
                        <AppLabel>{tr('common.assignedStaff', 'Assigned Staff', 'দায়িত্বপ্রাপ্ত কর্মকর্তা')}</AppLabel>
                        <AppSelect
                            value={form.data.assigned_staff_id || ''}
                            onChange={(e) => form.setData('assigned_staff_id', e.target.value)}
                        >
                            <option value="">{tr('common.selectOption', 'Select option', 'নির্বাচন করুন')}</option>
                            {staffOptions.map((staff) => (
                                <option key={staff.id} value={staff.id}>
                                    {staff.name}
                                </option>
                            ))}
                        </AppSelect>
                    </div>
                </FormGrid>

                <div className="mt-8 grid gap-5 md:grid-cols-2">
                    <div>
                        <AppLabel>{tr('customers.presentAddress', 'Present Address', 'বর্তমান ঠিকানা')}</AppLabel>
                        <AppTextarea
                            value={form.data.present_address || ''}
                            placeholder={t('customers.presentAddressPlaceholder')}
                            onChange={(e) => form.setData('present_address', e.target.value)}
                            rows={4}
                        />
                    </div>

                    <div>
                        <AppLabel>{tr('customers.permanentAddress', 'Permanent Address', 'স্থায়ী ঠিকানা')}</AppLabel>
                        <AppTextarea
                            value={form.data.permanent_address || ''}
                            placeholder={t('customers.permanentAddressPlaceholder')}
                            onChange={(e) => form.setData('permanent_address', e.target.value)}
                            rows={4}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <AppLabel>{tr('customers.notes', 'Notes', 'অতিরিক্ত নোট')}</AppLabel>
                        <AppTextarea
                            value={form.data.notes || ''}
                            placeholder={t('customers.notesPlaceholder')}
                            onChange={(e) => form.setData('notes', e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>
            </FormCard>

            <FormCard
                title={tr('customers.identityMedia', 'Photo & Identity Documents', 'ছবি ও পরিচয়পত্র')}
                subtitle={tr(
                    'customers.identityMediaSubtitle',
                    'Upload customer photo, NID front, and NID back in a clean and organized way.',
                    'গ্রাহকের ছবি, এনআইডি সামনের অংশ এবং পেছনের অংশ সুন্দরভাবে আপলোড করুন।'
                )}
            >
                <div className="mb-6">
                    <SectionBadge variant="success">
                        {t('customers.identityMediaQualityHint')}
                    </SectionBadge>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <div>
                        <UploadPreviewCard
                            label={tr('customers.photo', 'Customer Photo', 'গ্রাহকের ছবি')}
                            helper={isBangla ? 'JPG, PNG, WEBP' : 'JPG, PNG, WEBP'}
                            file={form.data.photo}
                            currentPreview={customer?.photo_preview}
                            currentUrl={customer?.photo_url}
                            remove={form.data.remove_photo}
                            setRemove={(value) => form.setData('remove_photo', value)}
                            setFile={(value) => form.setData('photo', value)}
                            accept="image/*"
                            removeLabel={t('customers.removeCurrentPhoto')}
                            previewLabel={tr('common.preview', 'Preview', 'প্রিভিউ')}
                            openImageLabel={t('common.openImage')}
                            emptyLabel={t('common.noPhotoSelected')}
                            replaceLabel={t('customers.uploadReplacePhoto')}
                            onPreview={openPreview}
                        />
                        <FormError message={form.errors.photo} />
                    </div>

                    <div>
                        <UploadPreviewCard
                            label={tr('customers.nidFront', 'NID Front', 'এনআইডি সামনের অংশ')}
                            helper={isBangla ? 'JPG, PNG, WEBP, PDF' : 'JPG, PNG, WEBP, PDF'}
                            file={form.data.nid_front}
                            currentPreview={customer?.nid_front_preview}
                            currentUrl={customer?.nid_front_url}
                            remove={form.data.remove_nid_front}
                            setRemove={(value) => form.setData('remove_nid_front', value)}
                            setFile={(value) => form.setData('nid_front', value)}
                            accept="image/*,.pdf"
                            removeLabel={t('customers.removeCurrentFile')}
                            previewLabel={tr('common.preview', 'Preview', 'প্রিভিউ')}
                            openPdfLabel={t('common.openCurrentPdf')}
                            openImageLabel={t('common.openImage')}
                            emptyLabel={t('common.noFileSelected')}
                            replaceLabel={t('customers.uploadReplaceNidFront')}
                            onPreview={openPreview}
                        />
                        <FormError message={form.errors.nid_front} />
                    </div>

                    <div>
                        <UploadPreviewCard
                            label={tr('customers.nidBack', 'NID Back', 'এনআইডি পেছনের অংশ')}
                            helper={isBangla ? 'JPG, PNG, WEBP, PDF' : 'JPG, PNG, WEBP, PDF'}
                            file={form.data.nid_back}
                            currentPreview={customer?.nid_back_preview}
                            currentUrl={customer?.nid_back_url}
                            remove={form.data.remove_nid_back}
                            setRemove={(value) => form.setData('remove_nid_back', value)}
                            setFile={(value) => form.setData('nid_back', value)}
                            accept="image/*,.pdf"
                            removeLabel={t('customers.removeCurrentFile')}
                            previewLabel={tr('common.preview', 'Preview', 'প্রিভিউ')}
                            openPdfLabel={t('common.openCurrentPdf')}
                            openImageLabel={t('common.openImage')}
                            emptyLabel={t('common.noFileSelected')}
                            replaceLabel={t('customers.uploadReplaceNidBack')}
                            onPreview={openPreview}
                        />
                        <FormError message={form.errors.nid_back} />
                    </div>
                </div>
            </FormCard>

            {mode === 'create' ? (
                <FormCard
                    title={tr('portal.portalAccess', 'Customer Portal Access', 'গ্রাহক পোর্টাল অ্যাক্সেস')}
                    subtitle={tr(
                        'portal.portalAccessAdminDescription',
                        'You can enable portal login for this customer now if needed.',
                        'চাইলে এখনই গ্রাহকের জন্য পোর্টাল লগইন চালু করতে পারেন।'
                    )}
                >
                    <div className="space-y-5">
                        <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800">
                            <input
                                type="checkbox"
                                checked={form.data.create_portal_account}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    form.setData('create_portal_account', checked);

                                    if (!checked) {
                                        form.setData('portal_email', '');
                                        form.setData('portal_password', '');
                                        form.setData('portal_password_confirmation', '');
                                        form.setData('portal_access_enabled', true);
                                    }
                                }}
                                className="mt-1"
                            />
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {tr(
                                        'portal.createPortalOnCustomerCreate',
                                        'Create portal account for this customer now',
                                        'এই গ্রাহকের জন্য এখনই পোর্টাল অ্যাকাউন্ট তৈরি করুন'
                                    )}
                                </p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    {isBangla
                                        ? 'চালু করলে গ্রাহক নিজের ঋণ, কিস্তি ও পেমেন্ট তথ্য দেখতে পারবেন।'
                                        : 'When enabled, the customer can log in and view loans, installments, and payment history.'}
                                </p>
                            </div>
                        </label>

                        {form.data.create_portal_account ? (
                            <>
                                <SectionBadge variant="warning">
                                    {isBangla
                                        ? 'পোর্টাল চালু থাকলে একটি পাসওয়ার্ড দিতে হবে। গ্রাহকের সাধারণ ইমেইল খালি থাকলে পোর্টাল ইমেইল অবশ্যই দিতে হবে।'
                                        : 'When portal access is enabled, a password is required. If customer email is empty, portal email is also required.'}
                                </SectionBadge>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <AppLabel>{tr('portal.loginEmail', 'Portal Login Email', 'পোর্টাল লগইন ইমেইল')}</AppLabel>
                                        <AppInput
                                            type="email"
                                            value={form.data.portal_email || ''}
                                            placeholder={isBangla ? 'পোর্টাল ইমেইল লিখুন' : 'Enter portal email'}
                                            onChange={(e) => form.setData('portal_email', e.target.value)}
                                        />
                                        <FieldHint>
                                            {tr(
                                                'portal.customerEmailLoginHint',
                                                'This email can be used for customer portal login.',
                                                'এই ইমেইল গ্রাহকের পোর্টাল লগইনে ব্যবহার হতে পারে।'
                                            )}
                                        </FieldHint>
                                        <FormError message={form.errors.portal_email} />
                                    </div>

                                    <div className="flex items-end">
                                        <label className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                                            <input
                                                type="checkbox"
                                                checked={form.data.portal_access_enabled}
                                                onChange={(e) => form.setData('portal_access_enabled', e.target.checked)}
                                            />
                                            <span>
                                                {tr('portal.portalAccessEnabled', 'Portal access enabled', 'পোর্টাল অ্যাক্সেস সক্রিয়')}
                                            </span>
                                        </label>
                                    </div>

                                    <div>
                                        <AppLabel>{tr('portal.password', 'Password', 'পাসওয়ার্ড')}</AppLabel>
                                        <AppInput
                                            type="password"
                                            value={form.data.portal_password || ''}
                                            placeholder={isBangla ? 'কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড' : 'Minimum 8 character password'}
                                            onChange={(e) => form.setData('portal_password', e.target.value)}
                                        />
                                        <FormError message={form.errors.portal_password} />
                                    </div>

                                    <div>
                                        <AppLabel>{tr('portal.confirmPassword', 'Confirm Password', 'পাসওয়ার্ড নিশ্চিত করুন')}</AppLabel>
                                        <AppInput
                                            type="password"
                                            value={form.data.portal_password_confirmation || ''}
                                            placeholder={isBangla ? 'আবার পাসওয়ার্ড লিখুন' : 'Re-enter password'}
                                            onChange={(e) => form.setData('portal_password_confirmation', e.target.value)}
                                        />
                                        <FormError message={form.errors.portal_password_confirmation} />
                                    </div>
                                </div>
                            </>
                        ) : null}
                    </div>
                </FormCard>
            ) : null}

            <div className="sticky bottom-4 z-10">
                <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-950/90">
                    <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {isBangla ? 'ফর্ম জমা দেওয়ার আগে সব তথ্য আরেকবার দেখে নিন' : 'Review all information before submitting'}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {isBangla
                                ? 'ছবি, এনআইডি, মোবাইল নম্বর এবং পোর্টাল তথ্য সঠিক কিনা নিশ্চিত করুন।'
                                : 'Please verify photo, NID, phone number, and portal information before saving.'}
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <AppButton type="submit" disabled={form.processing} className="min-w-[180px]">
                            {form.processing
                                ? tr('common.loading', 'Processing...', 'প্রসেস হচ্ছে...')
                                : mode === 'create'
                                  ? tr('common.create', 'Create Customer', 'গ্রাহক তৈরি করুন')
                                  : tr('common.update', 'Update Customer', 'তথ্য হালনাগাদ করুন')}
                        </AppButton>
                    </div>
                </div>
            </div>
        </form>
            <MediaPreviewModal
                open={!!previewMedia}
                media={previewMedia}
                onClose={() => setPreviewMedia(null)}
                tr={tr}
                isBangla={isBangla}
            />
        </>
    );
}