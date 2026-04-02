import { useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { AppLabel } from '@/components/ui/app-label';
import { AppSelect } from '@/components/ui/app-select';
import { AppTextarea } from '@/components/ui/app-textarea';
import { FormError } from '@/components/forms/form-error';
import { FormGrid } from '@/components/forms/form-grid';
import { FormSection } from '@/components/forms/form-section';
import { useLocale } from '@/hooks/use-locale';

const defaults = {
    customer_id: '',
    name: '',
    phone: '',
    email: '',
    nid_number: '',
    date_of_birth: '',
    gender: '',
    relationship: '',
    occupation: '',
    address: '',
    status: 'active',
    notes: '',
    photo: null,
    nid_front: null,
    nid_back: null,
    remove_photo: false,
    remove_nid_front: false,
    remove_nid_back: false,
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

function UploadPreviewCard({
    label,
    helper,
    file,
    currentUrl,
    remove,
    setRemove,
    setFile,
    accept = 'image/*,.pdf',
    removeLabel = 'Remove current file',
    openPdfLabel = 'Open current PDF',
    emptyLabel = 'No file selected',
    replaceLabel = 'Upload or replace file',
}) {
    const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
    const previewUrl = objectUrl || currentUrl || null;
    const isPdf =
        previewUrl?.toLowerCase().endsWith('.pdf') || file?.type === 'application/pdf';

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

                    {currentUrl ? (
                        <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
                            <input
                                type="checkbox"
                                checked={remove}
                                onChange={(e) => setRemove(e.target.checked)}
                            />
                            <span>{removeLabel}</span>
                        </label>
                    ) : null}
                </div>
            </div>

            <div className="p-5">
                <div className="mb-4">
                    {previewUrl ? (
                        isPdf ? (
                            <div className="flex h-44 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                                <a
                                    href={previewUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/60"
                                >
                                    {openPdfLabel}
                                </a>
                            </div>
                        ) : (
                            <img
                                src={previewUrl}
                                alt={label}
                                className="h-44 w-full rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-800"
                            />
                        )
                    ) : (
                        <div className="flex h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                            <div className="mb-2 text-3xl">📎</div>
                            <p>{emptyLabel}</p>
                        </div>
                    )}
                </div>

                <label className="block cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                    <span>{replaceLabel}</span>
                    <input
                        className="hidden"
                        type="file"
                        accept={accept}
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                </label>
            </div>
        </div>
    );
}

export default function GuarantorForm({
    mode = 'create',
    action,
    method = 'post',
    guarantorCode = 'Auto generated',
    guarantor = null,
    customers = [],
    selectedCustomer = null,
}) {
    const { t, locale } = useLocale();
    const isBangla = locale === 'bn';

    const form = useForm({
        ...defaults,
        ...guarantor,
        customer_id: guarantor?.customer_id ?? selectedCustomer?.id ?? '',
    });

    const submit = (e) => {
        e.preventDefault();

        if (method === 'put' || method === 'patch') {
            form.transform((data) => ({
                ...data,
                _method: method,
            })).post(action, {
                forceFormData: true,
                preserveScroll: true,
                onError: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
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
        <form onSubmit={submit} className="space-y-8">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-sm dark:border-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
                <div className="flex flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            {mode === 'create'
                                ? (t('guarantors.createGuarantor') || (isBangla ? 'নতুন জামিনদার তৈরি' : 'Create Guarantor'))
                                : (t('guarantors.updateGuarantor') || (isBangla ? 'জামিনদারের তথ্য হালনাগাদ' : 'Update Guarantor'))}
                        </h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            {mode === 'create'
                                ? (t('guarantors.createSubtitle') || (isBangla
                                    ? 'জামিনদারের পরিচয়, সম্পর্ক, ছবি এবং এনআইডি তথ্য সুন্দরভাবে সংরক্ষণ করুন।'
                                    : 'Save guarantor identity, relationship, photo, and NID details in a clean form.'))
                                : (t('guarantors.updateSubtitle') || (isBangla
                                    ? 'জামিনদারের প্রোফাইল, ছবি, ডকুমেন্ট ও যোগাযোগের তথ্য প্রয়োজন অনুযায়ী পরিবর্তন করুন।'
                                    : 'Update guarantor profile, media, documents, and contact information as needed.'))}
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                {t('guarantors.guarantorCode') || (isBangla ? 'জামিনদার কোড' : 'Guarantor Code')}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {guarantor?.guarantor_code ?? guarantorCode}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                {t('guarantors.formMode') || (isBangla ? 'ফর্ম ধরন' : 'Form Type')}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {mode === 'create'
                                    ? (t('common.create') || (isBangla ? 'তৈরি' : 'Create'))
                                    : (t('common.update') || (isBangla ? 'হালনাগাদ' : 'Update'))}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <FormCard
                title={t('guarantors.basicInfo') || (isBangla ? 'মৌলিক তথ্য' : 'Basic Information')}
                subtitle={t('guarantors.requiredHint') || (isBangla
                    ? 'জামিনদারের প্রয়োজনীয় তথ্য সঠিকভাবে পূরণ করুন।'
                    : 'Fill in all important guarantor information carefully.')}
            >
                <div className="mb-6">
                    <SectionBadge>
                        {t('guarantors.verificationHint') || (isBangla
                            ? 'যে তথ্যগুলো পরবর্তীতে ঋণ যাচাইয়ে কাজে লাগবে, সেগুলো সঠিকভাবে দিন।'
                            : 'Please provide accurate information that will help with future loan verification.')}
                    </SectionBadge>
                </div>

                <div className="mb-6">
                    <AppLabel htmlFor="guarantor_code">
                        {t('guarantors.guarantorCode') || (isBangla ? 'জামিনদার কোড' : 'Guarantor Code')}
                    </AppLabel>
                    <AppInput
                        id="guarantor_code"
                        value={guarantor?.guarantor_code ?? guarantorCode}
                        disabled
                    />
                </div>

                <FormGrid>
                    <div>
                        <AppLabel htmlFor="customer_id">
                            {t('guarantors.customer') || (isBangla ? 'গ্রাহক নির্বাচন' : 'Customer')}
                        </AppLabel>
                        <AppSelect
                            id="customer_id"
                            value={form.data.customer_id}
                            onChange={(e) => form.setData('customer_id', e.target.value)}
                        >
                            <option value="">
                                {t('common.selectOption') || (isBangla ? 'নির্বাচন করুন' : 'Select option')}
                            </option>
                            {customers.map((customer) => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name} ({customer.customer_code})
                                </option>
                            ))}
                        </AppSelect>
                        <FormError message={form.errors.customer_id} />
                    </div>

                    <div>
                        <AppLabel htmlFor="name">
                            {t('guarantors.name') || (isBangla ? 'নাম' : 'Name')}
                        </AppLabel>
                        <AppInput
                            id="name"
                            value={form.data.name}
                            placeholder={isBangla ? 'জামিনদারের পূর্ণ নাম লিখুন' : 'Enter full guarantor name'}
                            onChange={(e) => form.setData('name', e.target.value)}
                        />
                        <FormError message={form.errors.name} />
                    </div>

                    <div>
                        <AppLabel htmlFor="phone">
                            {t('guarantors.phone') || (isBangla ? 'মোবাইল নম্বর' : 'Phone')}
                        </AppLabel>
                        <AppInput
                            id="phone"
                            value={form.data.phone}
                            placeholder={isBangla ? 'যেমন: 017XXXXXXXX' : 'Example: 017XXXXXXXX'}
                            onChange={(e) => form.setData('phone', e.target.value)}
                        />
                        <FormError message={form.errors.phone} />
                    </div>

                    <div>
                        <AppLabel htmlFor="email">
                            {t('guarantors.email') || (isBangla ? 'ইমেইল' : 'Email')}
                        </AppLabel>
                        <AppInput
                            id="email"
                            type="email"
                            value={form.data.email ?? ''}
                            placeholder={isBangla ? 'ঐচ্ছিক ইমেইল' : 'Optional email'}
                            onChange={(e) => form.setData('email', e.target.value)}
                        />
                        <FormError message={form.errors.email} />
                    </div>

                    <div>
                        <AppLabel htmlFor="nid_number">
                            {t('guarantors.nidNumber') || (isBangla ? 'এনআইডি নম্বর' : 'NID Number')}
                        </AppLabel>
                        <AppInput
                            id="nid_number"
                            value={form.data.nid_number ?? ''}
                            placeholder={isBangla ? 'জাতীয় পরিচয়পত্র নম্বর লিখুন' : 'Enter national ID number'}
                            onChange={(e) => form.setData('nid_number', e.target.value)}
                        />
                        <FormError message={form.errors.nid_number} />
                    </div>

                    <div>
                        <AppLabel htmlFor="date_of_birth">
                            {t('guarantors.dateOfBirth') || (isBangla ? 'জন্ম তারিখ' : 'Date of Birth')}
                        </AppLabel>
                        <AppInput
                            id="date_of_birth"
                            type="date"
                            value={form.data.date_of_birth ?? ''}
                            onChange={(e) => form.setData('date_of_birth', e.target.value)}
                        />
                        <FormError message={form.errors.date_of_birth} />
                    </div>

                    <div>
                        <AppLabel htmlFor="gender">
                            {t('guarantors.gender') || (isBangla ? 'লিঙ্গ' : 'Gender')}
                        </AppLabel>
                        <AppSelect
                            id="gender"
                            value={form.data.gender ?? ''}
                            onChange={(e) => form.setData('gender', e.target.value)}
                        >
                            <option value="">
                                {t('common.selectOption') || (isBangla ? 'নির্বাচন করুন' : 'Select option')}
                            </option>
                            <option value="male">{t('guarantors.male') || (isBangla ? 'পুরুষ' : 'Male')}</option>
                            <option value="female">{t('guarantors.female') || (isBangla ? 'মহিলা' : 'Female')}</option>
                            <option value="other">{t('guarantors.other') || (isBangla ? 'অন্যান্য' : 'Other')}</option>
                        </AppSelect>
                        <FormError message={form.errors.gender} />
                    </div>

                    <div>
                        <AppLabel htmlFor="relationship">
                            {t('guarantors.relationship') || (isBangla ? 'সম্পর্ক' : 'Relationship')}
                        </AppLabel>
                        <AppInput
                            id="relationship"
                            value={form.data.relationship ?? ''}
                            placeholder={isBangla ? 'যেমন: ভাই, বন্ধু, চাচা' : 'Example: Brother, Friend, Uncle'}
                            onChange={(e) => form.setData('relationship', e.target.value)}
                        />
                        <FormError message={form.errors.relationship} />
                    </div>

                    <div>
                        <AppLabel htmlFor="occupation">
                            {t('guarantors.occupation') || (isBangla ? 'পেশা' : 'Occupation')}
                        </AppLabel>
                        <AppInput
                            id="occupation"
                            value={form.data.occupation ?? ''}
                            placeholder={isBangla ? 'যেমন: ব্যবসা, শিক্ষক, কৃষক' : 'Example: Business, Teacher, Farmer'}
                            onChange={(e) => form.setData('occupation', e.target.value)}
                        />
                        <FormError message={form.errors.occupation} />
                    </div>
                </FormGrid>
            </FormCard>

            <FormCard
                title={t('guarantors.identityMedia') || (isBangla ? 'ছবি ও পরিচয়পত্র' : 'Photo & Identity Documents')}
                subtitle={t('guarantors.identityMediaSubtitle') || (isBangla
                    ? 'জামিনদারের ছবি, এনআইডি সামনের অংশ এবং পেছনের অংশ আপলোড করুন।'
                    : 'Upload guarantor photo, NID front, and NID back in a clean and organized way.')}
            >
                <div className="mb-6">
                    <SectionBadge variant="success">
                        {isBangla
                            ? 'স্পষ্ট ছবি বা PDF ব্যবহার করুন যাতে পরে সহজে যাচাই করা যায়।'
                            : 'Use clear image or PDF files so verification remains easy later.'}
                    </SectionBadge>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <div>
                        <UploadPreviewCard
                            label={t('guarantors.photo') || (isBangla ? 'জামিনদারের ছবি' : 'Guarantor Photo')}
                            helper={isBangla ? 'JPG, PNG, WEBP' : 'JPG, PNG, WEBP'}
                            file={form.data.photo}
                            currentUrl={!form.data.remove_photo ? guarantor?.photo_url : null}
                            remove={form.data.remove_photo}
                            setRemove={(v) => form.setData('remove_photo', v)}
                            setFile={(v) => form.setData('photo', v)}
                            accept="image/*"
                            removeLabel={isBangla ? 'বর্তমান ছবি মুছুন' : 'Remove current'}
                            emptyLabel={isBangla ? 'কোনো ছবি নির্বাচন করা হয়নি' : 'No photo selected'}
                            replaceLabel={isBangla ? 'ছবি আপলোড / পরিবর্তন' : 'Upload / Replace Photo'}
                        />
                        <FormError message={form.errors.photo} />
                    </div>

                    <div>
                        <UploadPreviewCard
                            label={t('guarantors.nidFront') || (isBangla ? 'এনআইডি সামনের অংশ' : 'NID Front')}
                            helper={isBangla ? 'JPG, PNG, WEBP, PDF' : 'JPG, PNG, WEBP, PDF'}
                            file={form.data.nid_front}
                            currentUrl={!form.data.remove_nid_front ? guarantor?.nid_front_url : null}
                            remove={form.data.remove_nid_front}
                            setRemove={(v) => form.setData('remove_nid_front', v)}
                            setFile={(v) => form.setData('nid_front', v)}
                            accept="image/*,.pdf"
                            removeLabel={isBangla ? 'বর্তমান ফাইল মুছুন' : 'Remove current'}
                            openPdfLabel={isBangla ? 'বর্তমান PDF খুলুন' : 'Open current PDF'}
                            emptyLabel={isBangla ? 'কোনো ফাইল নির্বাচন করা হয়নি' : 'No file selected'}
                            replaceLabel={isBangla ? 'এনআইডি ফ্রন্ট আপলোড / পরিবর্তন' : 'Upload / Replace NID Front'}
                        />
                        <FormError message={form.errors.nid_front} />
                    </div>

                    <div>
                        <UploadPreviewCard
                            label={t('guarantors.nidBack') || (isBangla ? 'এনআইডি পেছনের অংশ' : 'NID Back')}
                            helper={isBangla ? 'JPG, PNG, WEBP, PDF' : 'JPG, PNG, WEBP, PDF'}
                            file={form.data.nid_back}
                            currentUrl={!form.data.remove_nid_back ? guarantor?.nid_back_url : null}
                            remove={form.data.remove_nid_back}
                            setRemove={(v) => form.setData('remove_nid_back', v)}
                            setFile={(v) => form.setData('nid_back', v)}
                            accept="image/*,.pdf"
                            removeLabel={isBangla ? 'বর্তমান ফাইল মুছুন' : 'Remove current'}
                            openPdfLabel={isBangla ? 'বর্তমান PDF খুলুন' : 'Open current PDF'}
                            emptyLabel={isBangla ? 'কোনো ফাইল নির্বাচন করা হয়নি' : 'No file selected'}
                            replaceLabel={isBangla ? 'এনআইডি ব্যাক আপলোড / পরিবর্তন' : 'Upload / Replace NID Back'}
                        />
                        <FormError message={form.errors.nid_back} />
                    </div>
                </div>
            </FormCard>

            <FormCard
                title={t('guarantors.connectionInfo') || (isBangla ? 'সংযোগ ও অতিরিক্ত তথ্য' : 'Connection & Additional Information')}
                subtitle={t('guarantors.connectionHint') || (isBangla
                    ? 'ঠিকানা, অবস্থা এবং প্রয়োজনীয় অতিরিক্ত নোট যুক্ত করুন।'
                    : 'Add address, status, and any extra notes if needed.')}
            >
                <div className="grid gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <AppLabel htmlFor="address">
                            {t('guarantors.address') || (isBangla ? 'ঠিকানা' : 'Address')}
                        </AppLabel>
                        <AppTextarea
                            id="address"
                            rows={4}
                            value={form.data.address ?? ''}
                            placeholder={isBangla ? 'জামিনদারের পূর্ণ ঠিকানা লিখুন' : 'Enter full address'}
                            onChange={(e) => form.setData('address', e.target.value)}
                        />
                        <FormError message={form.errors.address} />
                    </div>

                    <div>
                        <AppLabel htmlFor="status">
                            {t('guarantors.status') || (isBangla ? 'স্ট্যাটাস' : 'Status')}
                        </AppLabel>
                        <AppSelect
                            id="status"
                            value={form.data.status}
                            onChange={(e) => form.setData('status', e.target.value)}
                        >
                            <option value="active">{t('guarantors.active') || (isBangla ? 'সক্রিয়' : 'Active')}</option>
                            <option value="inactive">{t('guarantors.inactive') || (isBangla ? 'নিষ্ক্রিয়' : 'Inactive')}</option>
                        </AppSelect>
                        <FormError message={form.errors.status} />
                    </div>

                    <div className="md:col-span-2">
                        <AppLabel htmlFor="notes">
                            {t('guarantors.notes') || (isBangla ? 'নোট' : 'Notes')}
                        </AppLabel>
                        <AppTextarea
                            id="notes"
                            rows={4}
                            value={form.data.notes ?? ''}
                            placeholder={isBangla ? 'প্রয়োজনে অতিরিক্ত তথ্য লিখুন' : 'Add any useful notes'}
                            onChange={(e) => form.setData('notes', e.target.value)}
                        />
                        <FormError message={form.errors.notes} />
                    </div>
                </div>
            </FormCard>

            <div className="sticky bottom-4 z-10">
                <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-950/90">
                    <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {t('guarantors.reviewBeforeSubmit') || (isBangla
                                ? 'ফর্ম জমা দেওয়ার আগে সব তথ্য আরেকবার দেখে নিন'
                                : 'Review all information before submitting')}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {isBangla
                                ? 'গ্রাহক নির্বাচন, মোবাইল নম্বর, এনআইডি এবং সম্পর্কের তথ্য সঠিক কিনা নিশ্চিত করুন।'
                                : 'Please verify customer link, phone number, NID, and relationship information before saving.'}
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <AppButton
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            {t('common.cancel') || (isBangla ? 'বাতিল' : 'Cancel')}
                        </AppButton>

                        <AppButton type="submit" disabled={form.processing} className="min-w-[180px]">
                            {form.processing
                                ? (t('common.loading') || (isBangla ? 'প্রসেস হচ্ছে...' : 'Processing...'))
                                : mode === 'edit'
                                  ? (t('guarantors.updateGuarantor') || (isBangla ? 'জামিনদার হালনাগাদ করুন' : 'Update Guarantor'))
                                  : (t('guarantors.saveGuarantor') || (isBangla ? 'জামিনদার সংরক্ষণ করুন' : 'Save Guarantor'))}
                        </AppButton>
                    </div>
                </div>
            </div>
        </form>
    );
}