import PrimaryButton from '@/components/PrimaryButton';
import { useLocale } from '@/hooks/use-locale';
import GuestLayout from '@/layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { t } = useLocale();
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title={t('auth.verifyTitle')} />

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('auth.verifyTitle')}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('auth.verifyHelp')}</p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">{t('auth.verificationSent')}</div>
            )}

            <form onSubmit={submit}>
                <div className="mt-4 flex items-center justify-between gap-4">
                    <PrimaryButton disabled={processing}>{t('auth.resendVerification')}</PrimaryButton>
                    <Link href={route('logout')} method="post" as="button" className="rounded-md text-sm text-slate-600 underline hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-slate-300 dark:hover:text-white dark:focus:ring-offset-slate-900">
                        {t('common.logout')}
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
