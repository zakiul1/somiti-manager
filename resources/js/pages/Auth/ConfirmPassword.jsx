import InputError from '@/components/InputError';
import InputLabel from '@/components/InputLabel';
import PrimaryButton from '@/components/PrimaryButton';
import TextInput from '@/components/TextInput';
import { useLocale } from '@/hooks/use-locale';
import GuestLayout from '@/layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { t } = useLocale();
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title={t('auth.confirmTitle')} />

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('auth.confirmTitle')}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('auth.secureArea')}</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="password" value={t('auth.password')} />
                    <TextInput id="password" type="password" name="password" value={data.password} className="mt-1 block w-full" isFocused onChange={(e) => setData('password', e.target.value)} />
                    <InputError message={errors.password} className="mt-2" />
                </div>
                <PrimaryButton className="w-full justify-center" disabled={processing}>{t('auth.confirmButton')}</PrimaryButton>
            </form>
        </GuestLayout>
    );
}
