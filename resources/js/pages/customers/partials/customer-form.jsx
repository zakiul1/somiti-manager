import { useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { AppLabel } from '@/components/ui/app-label';
import { AppSelect } from '@/components/ui/app-select';
import { AppTextarea } from '@/components/ui/app-textarea';
import { FormError } from '@/components/forms/form-error';
import { FieldHint } from '@/components/forms/field-hint';
import { FormGrid } from '@/components/forms/form-grid';
import { FormSection } from '@/components/forms/form-section';
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

function PreviewCard({
    label,
    file,
    currentUrl,
    remove,
    setRemove,
    setFile,
    accept = 'image/*,.pdf',
}) {
    const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
    const previewUrl = objectUrl || currentUrl || null;
    const isPdf = previewUrl?.toLowerCase().endsWith('.pdf') || file?.type === 'application/pdf';

    return (
        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {accept.includes('pdf') ? 'JPG, PNG, PDF' : 'JPG, PNG'}
                    </p>
                </div>

                {currentUrl ? (
                    <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <input
                            type="checkbox"
                            checked={remove}
                            onChange={(e) => setRemove(e.target.checked)}
                        />
                        <span>Remove current</span>
                    </label>
                ) : null}
            </div>

            <div className="mt-4">
                {previewUrl ? (
                    isPdf ? (
                        <a
                            href={previewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-indigo-600 dark:text-indigo-400"
                        >
                            Open current PDF
                        </a>
                    ) : (
                        <img
                            src={previewUrl}
                            alt={label}
                            className="h-40 w-full rounded-xl object-cover"
                        />
                    )
                ) : (
                    <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                        No file selected
                    </div>
                )}
            </div>

            <input
                className="mt-4 block w-full text-sm"
                type="file"
                accept={accept}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
        </div>
    );
}

export default function CustomerForm({
    mode = 'create',
    action,
    method = 'post',
    customerCode = 'Auto generated',
    customer = null,
    staffOptions = [],
}) {
    const { t } = useLocale();

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
        <form onSubmit={submit} className="space-y-6">
            <FormSection
                title={t('customers.basicInfo')}
                description={t('customers.recordSummarySubtitle')}
            >
                <FormGrid>
                    <div>
                        <AppLabel>{t('customers.customerCode')}</AppLabel>
                        <AppInput value={customerCode} disabled />
                    </div>

                    <div>
                        <AppLabel>{t('customers.name')}</AppLabel>
                        <AppInput
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                        />
                        <FormError message={form.errors.name} />
                    </div>

                    <div>
                        <AppLabel>{t('customers.phone')}</AppLabel>
                        <AppInput
                            value={form.data.phone}
                            onChange={(e) => form.setData('phone', e.target.value)}
                        />
                        <FieldHint>{t('portal.customerPhoneLoginHint')}</FieldHint>
                        <FormError message={form.errors.phone} />
                    </div>

                    <div>
                        <AppLabel>{t('customers.email')}</AppLabel>
                        <AppInput
                            type="email"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                        />
                        <FieldHint>{t('portal.customerEmailLoginHint')}</FieldHint>
                        <FormError message={form.errors.email} />
                    </div>

                    <div>
                        <AppLabel>{t('customers.nidNumber')}</AppLabel>
                        <AppInput
                            value={form.data.nid_number}
                            onChange={(e) => form.setData('nid_number', e.target.value)}
                        />
                        <FormError message={form.errors.nid_number} />
                    </div>

                    <div>
                        <AppLabel>{t('customers.dateOfBirth')}</AppLabel>
                        <AppInput
                            type="date"
                            value={form.data.date_of_birth || ''}
                            onChange={(e) => form.setData('date_of_birth', e.target.value)}
                        />
                        <FormError message={form.errors.date_of_birth} />
                    </div>

                    <div>
                        <AppLabel>{t('customers.gender')}</AppLabel>
                        <AppSelect
                            value={form.data.gender || ''}
                            onChange={(e) => form.setData('gender', e.target.value)}
                        >
                            <option value="">{t('common.selectOption')}</option>
                            <option value="male">{t('customers.male')}</option>
                            <option value="female">{t('customers.female')}</option>
                            <option value="other">{t('customers.other')}</option>
                        </AppSelect>
                        <FormError message={form.errors.gender} />
                    </div>

                    <div>
                        <AppLabel>{t('customers.status')}</AppLabel>
                        <AppSelect
                            value={form.data.status}
                            onChange={(e) => form.setData('status', e.target.value)}
                        >
                            <option value="active">{t('customers.active')}</option>
                            <option value="inactive">{t('customers.inactive')}</option>
                        </AppSelect>
                        <FormError message={form.errors.status} />
                    </div>

                    <div>
                        <AppLabel>{t('customers.fatherName')}</AppLabel>
                        <AppInput
                            value={form.data.father_name || ''}
                            onChange={(e) => form.setData('father_name', e.target.value)}
                        />
                    </div>

                    <div>
                        <AppLabel>{t('customers.motherName')}</AppLabel>
                        <AppInput
                            value={form.data.mother_name || ''}
                            onChange={(e) => form.setData('mother_name', e.target.value)}
                        />
                    </div>

                    <div>
                        <AppLabel>{t('customers.spouseName')}</AppLabel>
                        <AppInput
                            value={form.data.spouse_name || ''}
                            onChange={(e) => form.setData('spouse_name', e.target.value)}
                        />
                    </div>

                    <div>
                        <AppLabel>{t('customers.occupation')}</AppLabel>
                        <AppInput
                            value={form.data.occupation || ''}
                            onChange={(e) => form.setData('occupation', e.target.value)}
                        />
                    </div>

                    <div>
                        <AppLabel>{t('common.assignedStaff')}</AppLabel>
                        <AppSelect
                            value={form.data.assigned_staff_id || ''}
                            onChange={(e) => form.setData('assigned_staff_id', e.target.value)}
                        >
                            <option value="">{t('common.selectOption')}</option>
                            {staffOptions.map((staff) => (
                                <option key={staff.id} value={staff.id}>
                                    {staff.name}
                                </option>
                            ))}
                        </AppSelect>
                    </div>
                </FormGrid>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <div>
                        <AppLabel>{t('customers.presentAddress')}</AppLabel>
                        <AppTextarea
                            value={form.data.present_address || ''}
                            onChange={(e) => form.setData('present_address', e.target.value)}
                            rows={4}
                        />
                    </div>

                    <div>
                        <AppLabel>{t('customers.permanentAddress')}</AppLabel>
                        <AppTextarea
                            value={form.data.permanent_address || ''}
                            onChange={(e) => form.setData('permanent_address', e.target.value)}
                            rows={4}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <AppLabel>{t('customers.notes')}</AppLabel>
                        <AppTextarea
                            value={form.data.notes || ''}
                            onChange={(e) => form.setData('notes', e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>
            </FormSection>

            <FormSection
                title={t('customers.identityMedia')}
                description={t('customers.identityMediaSubtitle')}
            >
                <div className="grid gap-5 md:grid-cols-3">
                    <PreviewCard
                        label={t('customers.photo')}
                        file={form.data.photo}
                        currentUrl={customer?.photo_url}
                        remove={form.data.remove_photo}
                        setRemove={(value) => form.setData('remove_photo', value)}
                        setFile={(value) => form.setData('photo', value)}
                        accept="image/*"
                    />

                    <PreviewCard
                        label={t('customers.nidFront')}
                        file={form.data.nid_front}
                        currentUrl={customer?.nid_front_url}
                        remove={form.data.remove_nid_front}
                        setRemove={(value) => form.setData('remove_nid_front', value)}
                        setFile={(value) => form.setData('nid_front', value)}
                        accept="image/*,.pdf"
                    />

                    <PreviewCard
                        label={t('customers.nidBack')}
                        file={form.data.nid_back}
                        currentUrl={customer?.nid_back_url}
                        remove={form.data.remove_nid_back}
                        setRemove={(value) => form.setData('remove_nid_back', value)}
                        setFile={(value) => form.setData('nid_back', value)}
                        accept="image/*,.pdf"
                    />
                </div>
            </FormSection>

            {mode === 'create' ? (
                <FormSection
                    title={t('portal.portalAccess')}
                    description={t('portal.portalAccessAdminDescription')}
                >
                    <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
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
                        />
                        <span>{t('portal.createPortalOnCustomerCreate')}</span>
                    </label>

                    {form.data.create_portal_account ? (
                        <div className="mt-5 grid gap-5 md:grid-cols-2">
                            <div className="md:col-span-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
                                Portal account is enabled. Enter a portal password. If customer email is empty, portal email is required.
                            </div>

                            <div>
                                <AppLabel>{t('portal.loginEmail')}</AppLabel>
                                <AppInput
                                    type="email"
                                    value={form.data.portal_email || ''}
                                    onChange={(e) => form.setData('portal_email', e.target.value)}
                                />
                                <FieldHint>{t('portal.customerEmailLoginHint')}</FieldHint>
                                <FormError message={form.errors.portal_email} />
                            </div>

                            <div className="flex items-end">
                                <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={form.data.portal_access_enabled}
                                        onChange={(e) =>
                                            form.setData('portal_access_enabled', e.target.checked)
                                        }
                                    />
                                    <span>{t('portal.portalAccessEnabled')}</span>
                                </label>
                            </div>

                            <div>
                                <AppLabel>{t('portal.password')}</AppLabel>
                                <AppInput
                                    type="password"
                                    value={form.data.portal_password || ''}
                                    onChange={(e) => form.setData('portal_password', e.target.value)}
                                />
                                <FormError message={form.errors.portal_password} />
                            </div>

                            <div>
                                <AppLabel>{t('portal.confirmPassword')}</AppLabel>
                                <AppInput
                                    type="password"
                                    value={form.data.portal_password_confirmation || ''}
                                    onChange={(e) =>
                                        form.setData('portal_password_confirmation', e.target.value)
                                    }
                                />
                                <FormError message={form.errors.portal_password_confirmation} />
                            </div>
                        </div>
                    ) : null}
                </FormSection>
            ) : null}

            <div className="flex justify-end">
                <AppButton type="submit" disabled={form.processing}>
                    {form.processing
                        ? t('common.loading') || 'Processing...'
                        : mode === 'create'
                          ? t('common.create')
                          : t('common.update')}
                </AppButton>
            </div>
        </form>
    );
}
