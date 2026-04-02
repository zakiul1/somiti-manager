import ApplicationLogo from '@/components/ApplicationLogo';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { useLocale } from '@/hooks/use-locale';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    const { t, locale } = useLocale();

    const appName =
        t('common.appName') ||
        (locale === 'bn'
            ? 'পাচবাড়িয়া স্বপ্নসিঁড়ি ফাউন্ডেশন'
            : 'Pachbaria Swapnasiri Foundation');

    const panelSubtitle =
        t('auth.panelSubtitle') ||
        (locale === 'bn'
            ? 'নিরাপদভাবে আপনার অ্যাকাউন্টে সাইন ইন করুন'
            : 'Secure sign in to your account');

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-600 via-sky-500 to-cyan-400 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_28%)] dark:bg-[radial-gradient(circle_at_top,rgba(129,140,248,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.14),transparent_26%)]" />

            <div className="absolute inset-0 dark:bg-[linear-gradient(135deg,rgba(2,6,23,0.18),rgba(15,23,42,0.52),rgba(30,41,59,0.28))]" />

            <div className="relative z-10 flex min-h-screen flex-col px-4 py-4 sm:px-6 sm:py-6">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-end gap-3">
                    <div className="rounded-2xl border border-white/15 bg-white/8 px-2 py-1 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                        <LanguageSwitcher />
                    </div>

                    <div className="rounded-2xl border border-white/15 bg-white/8 px-2 py-1 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                        <ThemeToggle />
                    </div>
                </div>

                <div className="flex flex-1 items-center justify-center py-6 sm:py-10">
                    <div className="w-full max-w-md">
                        <div className="mb-6 text-center sm:mb-8">
                            <Link href="/" className="inline-flex flex-col items-center">
                                <div className="relative flex h-24 w-24 items-center justify-center rounded-[1.75rem] border border-white/25 bg-white/92 p-3 shadow-2xl shadow-slate-950/20 backdrop-blur-xl dark:border-cyan-400/20 dark:bg-slate-900/88 dark:shadow-cyan-950/30">
                                    <div className="absolute inset-0 rounded-[1.75rem] bg-gradient-to-br from-white/40 via-transparent to-cyan-300/10 dark:from-indigo-400/10 dark:via-transparent dark:to-cyan-400/10" />
                                    <ApplicationLogo
                                        className="relative h-full w-full object-contain drop-shadow-[0_0_12px_rgba(34,211,238,0.18)]"
                                        alt={appName}
                                    />
                                </div>

                                <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-white drop-shadow-sm sm:text-3xl">
                                    {appName}
                                </h1>

                                <p className="mt-2 max-w-sm text-center text-sm text-white/90 dark:text-slate-200">
                                    {panelSubtitle}
                                </p>
                            </Link>
                        </div>

                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}