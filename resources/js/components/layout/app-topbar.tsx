import { FormEvent, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Menu, Search } from 'lucide-react';
import { AppInput } from '@/components/ui/app-input';
import { AppButton } from '@/components/ui/app-button';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { NotificationBell } from '@/components/layout/notification-bell';
import { useLocale } from '@/hooks/use-locale';

type AuthUser = {
    name?: string;
    email?: string;
};

type PageProps = {
    auth?: {
        user?: AuthUser | null;
    };
};

type AppTopbarProps = {
    onMenuClick?: () => void;
};

export function AppTopbar({ onMenuClick }: AppTopbarProps) {
    const { t } = useLocale();
    const { props } = usePage<PageProps>();
    const user = props.auth?.user;
    const [query, setQuery] = useState('');

    const submitSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get('/search', { q: query }, { preserveState: false, preserveScroll: false });
    };

    return (
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
            <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <AppButton variant="ghost" size="sm" className="lg:hidden" onClick={onMenuClick}>
                        <Menu size={18} />
                    </AppButton>

                    <form className="relative hidden w-full max-w-md md:block" onSubmit={submitSearch}>
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <AppInput value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10 pr-24" placeholder={t('common.globalSearchPlaceholder')} />
                        <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50 dark:hover:bg-indigo-950/40">
                            {t('common.search')}
                        </button>
                    </form>
                </div>

                <div className="flex items-center gap-2">
                    <LanguageSwitcher />
                    <ThemeToggle />
                    <NotificationBell />

                    <div className="hidden items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-800 lg:flex">
                        <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40" />
                        <div className="text-left">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.name ?? 'User'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email ?? '-'}</p>
                        </div>
                        <div className="flex items-center gap-2 pl-2">
                            <Link href={route('profile.edit')} className="rounded-lg px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white">
                                {t('common.profile')}
                            </Link>
                            <Link href={route('logout')} method="post" as="button" className="rounded-lg px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/30">
                                {t('common.logout')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
