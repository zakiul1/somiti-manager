import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, X } from 'lucide-react';
import { SIDEBAR_NAV_ITEMS } from '@/lib/constants';
import { AppButton } from '@/components/ui/app-button';
import { cn } from '@/lib/utils';
import { useLocale } from '@/hooks/use-locale';

type MobileNavProps = {
    open: boolean;
    onClose: () => void;
};

type PageProps = {
    auth?: {
        user?: {
            roles?: string[];
        } | null;
    };
};

export function MobileNav({ open, onClose }: MobileNavProps) {
    const { url, props } = usePage<PageProps>();
    const { t } = useLocale();
    const userRoles = props.auth?.user?.roles ?? [];

    const items = SIDEBAR_NAV_ITEMS.filter((item) => {
        if (!item.roles || item.roles.length === 0) {
            return true;
        }
        return item.roles.some((role) => userRoles.includes(role));
    });

    return (
        <div className={cn('fixed inset-0 z-40 lg:hidden', open ? 'block' : 'hidden')}>
            <button className="absolute inset-0 bg-slate-950/50" onClick={onClose} aria-label={t('common.closeMenu')} />

            <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] border-r border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-950">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('common.appName')}</h2>
                    <AppButton variant="ghost" size="sm" onClick={onClose}>
                        <X size={18} />
                    </AppButton>
                </div>

                <nav className="space-y-2">
                    {items.map((item) => {
                        const Icon = item.icon;
                        const isActive = url === item.href || url.startsWith(item.href);

                        if (item.children?.length) {
                            return (
                                <div key={item.title} className="rounded-xl border border-slate-200 p-2 dark:border-slate-800">
                                    <div className={cn('flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium', isActive ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200')}>
                                        {Icon ? <Icon size={18} /> : null}
                                        <span className="flex-1 truncate">{item.title}</span>
                                        <ChevronDown size={16} className={cn('transition', isActive ? 'rotate-180' : '')} />
                                    </div>
                                    <div className="mt-2 space-y-1 px-2 pb-2">
                                        {item.children.map((child) => {
                                            const childActive = url === child.href || url.startsWith(child.href);
                                            return <Link key={child.title} href={child.href} onClick={onClose} className={cn('block rounded-xl px-3 py-2 text-sm', childActive ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900')}>{child.title}</Link>;
                                        })}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.title}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition',
                                    isActive
                                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900',
                                )}
                            >
                                {Icon ? <Icon size={18} /> : null}
                                <span className="truncate">{item.title}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
