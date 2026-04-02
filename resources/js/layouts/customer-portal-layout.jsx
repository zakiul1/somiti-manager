import { Head, Link, usePage } from '@inertiajs/react';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { AppButton } from '@/components/ui/app-button';
import { useLocale } from '@/hooks/use-locale';

export default function CustomerPortalLayout({ title, children }) {
    const { props, url } = usePage();
    const { t } = useLocale();

    const navItems = [
        { href: route('portal.dashboard'), label: t('portal.dashboard') },
        { href: route('portal.loans'), label: t('portal.loans') },
        { href: route('portal.installments'), label: t('portal.installments') },
        { href: route('portal.payments'), label: t('portal.payments') },
        { href: route('portal.profile'), label: t('portal.profile') },
    ];

    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
                    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{t('portal.title')}</p>
                                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{props.auth?.user?.name}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <LanguageSwitcher />
                                <ThemeToggle />
                                <Link href="/logout" method="post" as="button"><AppButton variant="outline" size="sm">{t('common.logout')}</AppButton></Link>
                            </div>
                        </div>
                        <nav className="flex flex-wrap gap-2">
                            {navItems.map((item) => {
                                const active = url.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`rounded-xl px-4 py-2 text-sm font-medium transition ${active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'}`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </header>
                <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
            </div>
        </>
    );
}
