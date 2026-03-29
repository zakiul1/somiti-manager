import Checkbox from '@/components/Checkbox';
import InputError from '@/components/InputError';
import InputLabel from '@/components/InputLabel';
import PrimaryButton from '@/components/PrimaryButton';
import TextInput from '@/components/TextInput';
import { useLocale } from '@/hooks/use-locale';
import GuestLayout from '@/layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword, variant = 'admin' }) {
    const { t } = useLocale();
    const isCustomer = variant === 'customer';

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        login: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(isCustomer ? route('customer.login.store') : route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title={isCustomer ? t('portal.customerLoginTitle') : t('auth.loginTitle')} />

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {isCustomer ? t('portal.customerLoginTitle') : t('auth.loginTitle')}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {isCustomer ? t('portal.customerLoginSubtitle') : t('auth.loginSubtitle')}
                </p>
            </div>

            {status && <div className="mb-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">{status}</div>}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel
                        htmlFor={isCustomer ? 'login' : 'email'}
                        value={isCustomer ? t('portal.customerLoginField') : t('auth.email')}
                    />
                    <TextInput
                        id={isCustomer ? 'login' : 'email'}
                        type={isCustomer ? 'text' : 'email'}
                        name={isCustomer ? 'login' : 'email'}
                        value={isCustomer ? data.login : data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused
                        onChange={(e) => setData(isCustomer ? 'login' : 'email', e.target.value)}
                    />
                    <InputError message={isCustomer ? errors.login : errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value={t('auth.password')} />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                {!isCustomer ? (
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-300">{t('auth.rememberMe')}</span>
                        </label>

                        {canResetPassword ? (
                            <Link href={route('password.request')} className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                                {t('auth.forgotPassword')}
                            </Link>
                        ) : null}
                    </div>
                ) : null}

                <div className="flex items-center justify-end">
                    <PrimaryButton className="ms-4" disabled={processing}>
                        {isCustomer ? t('portal.customerLoginButton') : t('auth.login')}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
