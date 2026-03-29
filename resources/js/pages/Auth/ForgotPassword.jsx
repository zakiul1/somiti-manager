import InputError from '@/components/InputError';
import PrimaryButton from '@/components/PrimaryButton';
import TextInput from '@/components/TextInput';
import { useLocale } from '@/hooks/use-locale';
import GuestLayout from '@/layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { t } = useLocale();
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title={t('auth.forgotTitle')} />

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('auth.forgotTitle')}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('auth.forgotHelp')}</p>
            </div>

            {status && <div className="mb-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">{status}</div>}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <TextInput id="email" type="email" name="email" value={data.email} className="mt-1 block w-full" isFocused onChange={(e) => setData('email', e.target.value)} placeholder={t('auth.email')} />
                    <InputError message={errors.email} className="mt-2" />
                </div>
                <PrimaryButton className="w-full justify-center" disabled={processing}>{t('auth.sendResetLink')}</PrimaryButton>
            </form>
        </GuestLayout>
    );
}
