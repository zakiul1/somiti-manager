import ApplicationLogo from '@/components/ApplicationLogo';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { useLocale } from '@/hooks/use-locale';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    const { t } = useLocale();

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
            <div className="mx-auto flex max-w-5xl items-center justify-end gap-2">
                <LanguageSwitcher />
                <ThemeToggle />
            </div>

            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col items-center justify-center">
                <div className="mb-8 text-center">
                    <Link href="/dashboard" className="inline-flex flex-col items-center">
                        <ApplicationLogo className="h-20 w-20 fill-current text-slate-500 dark:text-slate-300" />
                        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {t('common.appName')}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {t('auth.panelSubtitle')}
                        </p>
                    </Link>
                </div>

                <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    {children}
                </div>
            </div>
        </div>
    );
}
