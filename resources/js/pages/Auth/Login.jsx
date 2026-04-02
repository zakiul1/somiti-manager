import { useState } from 'react';
import Checkbox from '@/components/Checkbox';
import InputError from '@/components/InputError';
import InputLabel from '@/components/InputLabel';
import PrimaryButton from '@/components/PrimaryButton';
import TextInput from '@/components/TextInput';
import { useLocale } from '@/hooks/use-locale';
import GuestLayout from '@/layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

function PortalBadge({ isCustomer, isBangla, t }) {
    return (
        <div
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                isCustomer
                    ? 'bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-400/12 dark:text-emerald-200 dark:ring-emerald-400/25'
                    : 'bg-indigo-500/12 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-400/12 dark:text-indigo-200 dark:ring-indigo-400/25'
            }`}
        >
            <span className="h-2 w-2 rounded-full bg-current" />
            {isCustomer
                ? t('portal.customerPortal') || (isBangla ? 'গ্রাহক পোর্টাল' : 'Customer Portal')
                : t('auth.adminPortal') || (isBangla ? 'অ্যাডমিন পোর্টাল' : 'Admin Portal')}
        </div>
    );
}

export default function Login({
    status,
    canResetPassword,
    variant = 'admin',
    switchLink = null,
    switchLabel = null,
}) {
    const { t, locale } = useLocale();
    const isCustomer = variant === 'customer';
    const isBangla = locale === 'bn';
    const [showPassword, setShowPassword] = useState(false);

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

    const pageTitle = isCustomer
        ? t('portal.customerLoginTitle') || (isBangla ? 'গ্রাহক লগইন' : 'Customer Login')
        : t('auth.loginTitle') || (isBangla ? 'সাইন ইন' : 'Admin Sign in');

    const pageSubtitle = isCustomer
        ? t('portal.customerLoginSubtitle') ||
          (isBangla
              ? 'নিজের ঋণ, কিস্তি ও পেমেন্ট তথ্য দেখতে পোর্টালে প্রবেশ করুন।'
              : 'Sign in to view your loan, installment, and payment details.')
        : t('auth.loginSubtitle') ||
          (isBangla
              ? 'আপনার অ্যাকাউন্ট দিয়ে অ্যাডমিন প্যানেলে প্রবেশ করুন।'
              : 'Access the admin panel with your account credentials.');

    const switchButtonLabel =
        switchLabel ||
        (isCustomer
            ? t('auth.adminLogin') || (isBangla ? 'অ্যাডমিন লগইন' : 'Admin Login')
            : t('portal.customerPortal') || (isBangla ? 'গ্রাহক পোর্টাল' : 'Customer Portal'));

    const submitButtonLabel = processing
        ? t('common.loading') || (isBangla ? 'প্রসেস হচ্ছে...' : 'Processing...')
        : isCustomer
          ? t('portal.customerLoginButton') ||
            (isBangla ? 'গ্রাহক লগইন' : 'Customer Login')
          : t('auth.login') || (isBangla ? 'লগইন' : 'Log in');

    return (
        <GuestLayout>
            <Head title={pageTitle} />

            <div className="rounded-[2rem] border border-white/35 bg-white/92 p-5 shadow-2xl shadow-slate-950/15 backdrop-blur-xl dark:border-indigo-400/20 dark:bg-slate-950/92 dark:shadow-black/40 sm:p-7">
                <div className="mx-auto w-full">
                    <div className="text-center">
                        <PortalBadge isCustomer={isCustomer} isBangla={isBangla} t={t} />

                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {pageTitle}
                        </h2>

                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-300">
                            {pageSubtitle}
                        </p>
                    </div>

                    {switchLink ? (
                        <div className="mt-6">
                            <div className="grid grid-cols-2 rounded-2xl border border-slate-200/80 bg-slate-100/90 p-1 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/85">
                                <div
                                    className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                                        !isCustomer
                                            ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white dark:ring-1 dark:ring-indigo-400/20'
                                            : 'text-slate-500 dark:text-slate-300'
                                    }`}
                                >
                                    {t('auth.adminPortal') || (isBangla ? 'অ্যাডমিন পোর্টাল' : 'Admin Portal')}
                                </div>

                                <Link
                                    href={switchLink}
                                    className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                                        isCustomer
                                            ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white dark:ring-1 dark:ring-indigo-400/20'
                                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white'
                                    }`}
                                >
                                    {switchButtonLabel}
                                </Link>
                            </div>
                        </div>
                    ) : null}

                    {status ? (
                        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                            {status}
                        </div>
                    ) : null}

                    {(errors.login || errors.email || errors.password) && !status ? (
                        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200">
                            {errors.login || errors.email || errors.password}
                        </div>
                    ) : null}

                    <form onSubmit={submit} className="mt-6 space-y-5">
                        <div>
                            <InputLabel
                                htmlFor={isCustomer ? 'login' : 'email'}
                                value={
                                    isCustomer
                                        ? t('portal.customerLoginField') ||
                                          (isBangla ? 'ইমেইল / ইউজারনেম / লগইন' : 'Email / Username / Login')
                                        : t('auth.email') || (isBangla ? 'ইমেইল' : 'Email')
                                }
                            />

                            <TextInput
                                id={isCustomer ? 'login' : 'email'}
                                type={isCustomer ? 'text' : 'email'}
                                name={isCustomer ? 'login' : 'email'}
                                value={isCustomer ? data.login : data.email}
                                className="mt-2 block w-full rounded-2xl border border-slate-200/90 bg-white/90 px-4 py-3.5 text-base text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                                autoComplete="username"
                                isFocused
                                placeholder={
                                    isCustomer
                                        ? isBangla
                                            ? 'ইমেইল বা ইউজারনেম লিখুন'
                                            : 'Enter email or username'
                                        : isBangla
                                          ? 'আপনার ইমেইল লিখুন'
                                          : 'Enter your email'
                                }
                                onChange={(e) =>
                                    setData(isCustomer ? 'login' : 'email', e.target.value)
                                }
                            />

                            <InputError
                                message={isCustomer ? errors.login : errors.email}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between gap-3">
                                <InputLabel
                                    htmlFor="password"
                                    value={t('auth.password') || (isBangla ? 'পাসওয়ার্ড' : 'Password')}
                                />

                                {!isCustomer && canResetPassword ? (
                                    <Link
                                        href={route('password.request')}
                                        className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
                                    >
                                        {t('auth.forgotPassword') ||
                                            (isBangla ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?')}
                                    </Link>
                                ) : null}
                            </div>

                            <div className="relative mt-2">
                                <TextInput
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    className="block w-full rounded-2xl border border-slate-200/90 bg-white/90 px-4 py-3.5 pr-16 text-base text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                                    autoComplete="current-password"
                                    placeholder={
                                        isBangla ? 'আপনার পাসওয়ার্ড লিখুন' : 'Enter your password'
                                    }
                                    onChange={(e) => setData('password', e.target.value)}
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((value) => !value)}
                                    className="absolute inset-y-0 right-0 inline-flex items-center px-4 text-sm font-semibold text-slate-500 transition hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
                                >
                                    {showPassword
                                        ? isBangla
                                            ? 'লুকান'
                                            : 'Hide'
                                        : isBangla
                                          ? 'দেখুন'
                                          : 'Show'}
                                </button>
                            </div>

                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        {!isCustomer ? (
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <label className="inline-flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                    />
                                    <span>
                                        {t('auth.rememberMe') || (isBangla ? 'আমাকে মনে রাখুন' : 'Remember me')}
                                    </span>
                                </label>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-200">
                                {isBangla
                                    ? 'গ্রাহক পোর্টাল থেকে আপনি নিজের ঋণ, কিস্তি ও পেমেন্ট তথ্য দেখতে পারবেন।'
                                    : 'From the customer portal, you can view your loan, installment, and payment information.'}
                            </div>
                        )}

                        <PrimaryButton
                            className="flex w-full items-center justify-center rounded-2xl border-0 bg-indigo-600 px-4 py-3.5 text-sm font-semibold tracking-[0.18em] text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700 focus:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:bg-indigo-400 dark:shadow-indigo-950/50"
                            disabled={processing}
                        >
                            {submitButtonLabel}
                        </PrimaryButton>
                    </form>

                    <div className="mt-6 border-t border-slate-200 pt-5 text-center text-xs leading-5 text-slate-500 dark:border-slate-800 dark:text-slate-300">
                        {isCustomer
                            ? isBangla
                                ? 'গ্রাহক পোর্টাল অ্যাক্সেস নিয়ে সমস্যা হলে অফিসের সাথে যোগাযোগ করুন।'
                                : 'If you have trouble accessing the customer portal, contact the office.'
                            : isBangla
                              ? 'শুধুমাত্র অনুমোদিত অ্যাডমিন এবং সুপার-অ্যাডমিন ব্যবহারকারীরা প্রবেশ করতে পারবেন।'
                              : 'Only authorized admin and super-admin users can access this area.'}
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}