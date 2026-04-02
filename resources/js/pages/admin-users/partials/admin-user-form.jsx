import { useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppInput } from '@/components/ui/app-input';
import { AppSelect } from '@/components/ui/app-select';
import { AppTextarea } from '@/components/ui/app-textarea';
import { useLocale } from '@/hooks/use-locale';

function FilePreviewCard({
    label,
    file,
    currentUrl,
    remove,
    setRemove,
    setFile,
    accept = 'image/*,.pdf',
}) {
    const previewUrl = useMemo(() => {
        if (file && file.type?.startsWith('image/')) {
            return URL.createObjectURL(file);
        }

        return currentUrl || null;
    }, [file, currentUrl]);

    const isPdf =
        (file && file.type === 'application/pdf') ||
        (!!currentUrl && currentUrl.toLowerCase().endsWith('.pdf'));

    return (
        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {accept.includes('pdf') ? 'JPG, PNG, WEBP, PDF' : 'JPG, PNG, WEBP'}
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
                            href={currentUrl || '#'}
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

function ErrorText({ message }) {
    if (!message) return null;

    return <p className="mt-1 text-sm text-rose-600">{message}</p>;
}

export default function AdminUserForm({
    mode = 'create',
    action,
    method = 'post',
    userRecord = null,
    roleOptions = [],
}) {
    const { t } = useLocale();

    const form = useForm({
        name: userRecord?.name ?? '',
        username: userRecord?.username ?? '',
        email: userRecord?.email ?? '',
        phone: userRecord?.phone ?? '',
        designation: userRecord?.designation ?? '',
        address: userRecord?.address ?? '',
        password: '',
        password_confirmation: '',
        role: userRecord?.role ?? 'admin',
        is_active: userRecord?.is_active ?? true,

        photo: null,
        nid_front: null,
        nid_back: null,

        remove_photo: false,
        remove_nid_front: false,
        remove_nid_back: false,

        _method: method,
    });

    const submit = (event) => {
        event.preventDefault();

        form.post(action, {
            forceFormData: true,
            preserveScroll: true,
            onError: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <AppCard>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                            {t('adminUsers.name') || 'Name'}
                        </label>
                        <AppInput
                            value={form.data.name}
                            onChange={(event) => form.setData('name', event.target.value)}
                        />
                        <ErrorText message={form.errors.name} />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                            {t('adminUsers.username') || 'Username'}
                        </label>
                        <AppInput
                            value={form.data.username}
                            onChange={(event) => form.setData('username', event.target.value)}
                        />
                        <ErrorText message={form.errors.username} />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                            {t('adminUsers.email') || 'Email'}
                        </label>
                        <AppInput
                            type="email"
                            value={form.data.email}
                            onChange={(event) => form.setData('email', event.target.value)}
                        />
                        <ErrorText message={form.errors.email} />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                            {t('adminUsers.phone') || 'Phone'}
                        </label>
                        <AppInput
                            value={form.data.phone}
                            onChange={(event) => form.setData('phone', event.target.value)}
                        />
                        <ErrorText message={form.errors.phone} />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                            {t('adminUsers.designation') || 'Designation'}
                        </label>
                        <AppInput
                            value={form.data.designation}
                            onChange={(event) => form.setData('designation', event.target.value)}
                        />
                        <ErrorText message={form.errors.designation} />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                            {t('adminUsers.role') || 'Role'}
                        </label>
                        <AppSelect
                            value={form.data.role}
                            onChange={(event) => form.setData('role', event.target.value)}
                        >
                            {roleOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </AppSelect>
                        <ErrorText message={form.errors.role} />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                            {t('adminUsers.status') || 'Status'}
                        </label>
                        <AppSelect
                            value={form.data.is_active ? '1' : '0'}
                            onChange={(event) => form.setData('is_active', event.target.value === '1')}
                        >
                            <option value="1">{t('adminUsers.active') || 'Active'}</option>
                            <option value="0">{t('adminUsers.inactive') || 'Inactive'}</option>
                        </AppSelect>
                        <ErrorText message={form.errors.is_active} />
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                            {t('adminUsers.address') || 'Address'}
                        </label>
                        <AppTextarea
                            rows={4}
                            value={form.data.address}
                            onChange={(event) => form.setData('address', event.target.value)}
                        />
                        <ErrorText message={form.errors.address} />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                            {t('adminUsers.password') || 'Password'}
                        </label>
                        <AppInput
                            type="password"
                            value={form.data.password}
                            onChange={(event) => form.setData('password', event.target.value)}
                            placeholder={mode === 'edit' ? 'Leave blank to keep current password' : ''}
                        />
                        <ErrorText message={form.errors.password} />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                            {t('adminUsers.passwordConfirmation') || 'Confirm Password'}
                        </label>
                        <AppInput
                            type="password"
                            value={form.data.password_confirmation}
                            onChange={(event) => form.setData('password_confirmation', event.target.value)}
                        />
                        <ErrorText message={form.errors.password_confirmation} />
                    </div>
                </div>
            </AppCard>

            <AppCard>
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {t('adminUsers.identityDocuments') || 'Identity Documents'}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {t('adminUsers.identityDocumentsSubtitle') ||
                            'Upload admin profile photo and NID documents.'}
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                    <div>
                        <FilePreviewCard
                            label={t('adminUsers.photo') || 'Photo'}
                            file={form.data.photo}
                            currentUrl={userRecord?.photo_url}
                            remove={form.data.remove_photo}
                            setRemove={(value) => form.setData('remove_photo', value)}
                            setFile={(value) => form.setData('photo', value)}
                            accept="image/*"
                        />
                        <ErrorText message={form.errors.photo} />
                    </div>

                    <div>
                        <FilePreviewCard
                            label={t('adminUsers.nidFront') || 'NID Front'}
                            file={form.data.nid_front}
                            currentUrl={userRecord?.nid_front_url}
                            remove={form.data.remove_nid_front}
                            setRemove={(value) => form.setData('remove_nid_front', value)}
                            setFile={(value) => form.setData('nid_front', value)}
                            accept="image/*,.pdf"
                        />
                        <ErrorText message={form.errors.nid_front} />
                    </div>

                    <div>
                        <FilePreviewCard
                            label={t('adminUsers.nidBack') || 'NID Back'}
                            file={form.data.nid_back}
                            currentUrl={userRecord?.nid_back_url}
                            remove={form.data.remove_nid_back}
                            setRemove={(value) => form.setData('remove_nid_back', value)}
                            setFile={(value) => form.setData('nid_back', value)}
                            accept="image/*,.pdf"
                        />
                        <ErrorText message={form.errors.nid_back} />
                    </div>
                </div>
            </AppCard>

            <div className="flex justify-end gap-3">
                <AppButton type="submit" disabled={form.processing}>
                    {form.processing
                        ? (t('common.loading') || 'Processing...')
                        : mode === 'create'
                          ? (t('adminUsers.createUser') || 'Create User')
                          : (t('adminUsers.updateUser') || 'Update User')}
                </AppButton>
            </div>
        </form>
    );
}