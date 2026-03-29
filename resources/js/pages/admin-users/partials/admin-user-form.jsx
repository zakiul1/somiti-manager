import { useForm } from '@inertiajs/react';
import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppInput } from '@/components/ui/app-input';
import { AppSelect } from '@/components/ui/app-select';
import { useLocale } from '@/hooks/use-locale';

export default function AdminUserForm({ mode = 'create', action, method = 'post', userRecord = null, roleOptions = [] }) {
    const { t } = useLocale();

    const { data, setData, post, processing, errors } = useForm({
        name: userRecord?.name ?? '',
        email: userRecord?.email ?? '',
        password: '',
        password_confirmation: '',
        role: userRecord?.role ?? 'admin',
        is_active: userRecord?.is_active ?? true,
        _method: method,
    });

    const submit = (event) => {
        event.preventDefault();
        post(action);
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <AppCard>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">{t('adminUsers.name')}</label>
                        <AppInput value={data.name} onChange={(event) => setData('name', event.target.value)} />
                        {errors.name ? <p className="mt-1 text-sm text-rose-600">{errors.name}</p> : null}
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">{t('adminUsers.email')}</label>
                        <AppInput type="email" value={data.email} onChange={(event) => setData('email', event.target.value)} />
                        {errors.email ? <p className="mt-1 text-sm text-rose-600">{errors.email}</p> : null}
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">{t('adminUsers.role')}</label>
                        <AppSelect value={data.role} onChange={(event) => setData('role', event.target.value)}>
                            {roleOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </AppSelect>
                        {errors.role ? <p className="mt-1 text-sm text-rose-600">{errors.role}</p> : null}
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">{t('adminUsers.status')}</label>
                        <AppSelect value={data.is_active ? '1' : '0'} onChange={(event) => setData('is_active', event.target.value === '1')}>
                            <option value="1">{t('adminUsers.active')}</option>
                            <option value="0">{t('adminUsers.inactive')}</option>
                        </AppSelect>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">{t('adminUsers.password')}</label>
                        <AppInput type="password" value={data.password} onChange={(event) => setData('password', event.target.value)} />
                        {errors.password ? <p className="mt-1 text-sm text-rose-600">{errors.password}</p> : null}
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">{t('adminUsers.passwordConfirmation')}</label>
                        <AppInput type="password" value={data.password_confirmation} onChange={(event) => setData('password_confirmation', event.target.value)} />
                    </div>
                </div>
            </AppCard>

            <div className="flex justify-end gap-3">
                <AppButton type="submit" disabled={processing}>
                    {mode === 'create' ? t('adminUsers.createUser') : t('adminUsers.updateUser')}
                </AppButton>
            </div>
        </form>
    );
}
