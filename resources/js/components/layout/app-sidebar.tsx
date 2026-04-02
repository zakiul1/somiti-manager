import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { APP_NAME, SIDEBAR_NAV_ITEMS } from '@/lib/constants';
import { useLocale } from '@/hooks/use-locale';

const labelMap: Record<string, string> = {
    Dashboard: 'Dashboard',
    Customers: 'Customers',
    Guarantors: 'Guarantors',
    Loans: 'Loans',
    Installments: 'Installments',
    Payments: 'Payments',
    Documents: 'Documents',
    'Contribution Fund': 'Contribution Fund',
    'Contribution Overview': 'Overview',
    'Monthly Collections': 'Monthly Collections',
    'Member Statements': 'Member Statements',
    Notifications: 'Notifications',
    'Admin Users': 'Admin Users',
    Reports: 'Reports',
    'Staff Workflow': 'Admin Workflow',
    'Audit Logs': 'Audit Logs',
    Settings: 'Settings',
};

type PageProps = {
    auth?: {
        user?: {
            roles?: string[];
        } | null;
    };
    app?: {
        name?: string;
    };
};

export function AppSidebar() {
    const { url, props } = usePage<PageProps>();
    const { t } = useLocale();
    const userRoles = props.auth?.user?.roles ?? [];
    const appName = props.app?.name ?? APP_NAME;

    const items = useMemo(
        () =>
            SIDEBAR_NAV_ITEMS.filter((item) => {
                if (!item.roles || item.roles.length === 0) {
                    return true;
                }

                return item.roles.some((role) => userRoles.includes(role));
            }),
        [userRoles],
    );

    const [openMenus, setOpenMenus] = useState<string[]>([]);
    const hasManualState = (title: string) => openMenus.includes(title);

    const toggleMenu = (title: string, defaultOpen = false) => {
        setOpenMenus((current) => {
            const isCurrentlyOpen = current.includes(title) || defaultOpen;
            return isCurrentlyOpen ? current.filter((item) => item !== title) : [...current, title];
        });
    };

    return (
        <aside className="hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:flex lg:flex-col">
            <div className="flex h-16 items-center border-b border-slate-200 px-6 dark:border-slate-800">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                        <img
                            src="/images/brand/logo.png"
                            alt={appName}
                            className="h-8 w-8 object-contain"
                        />
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {appName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {t('common.adminPanel')}
                        </p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto p-4">
                {items.map((item) => {
                    const hasChildren = !!item.children?.length;
                    const childIsActive = (href: string) =>
                        url === href || (href !== item.href && url.startsWith(`${href}/`));
                    const hasActiveChild = !!item.children?.some((child) => childIsActive(child.href));
                    const isParentActive = hasChildren
                        ? hasActiveChild
                        : url === item.href || url.startsWith(`${item.href}/`);
                    const isOpen = hasChildren
                        ? hasManualState(item.title)
                            ? true
                            : hasActiveChild
                        : false;
                    const Icon = item.icon;

                    if (hasChildren) {
                        return (
                            <div key={item.title} className="rounded-2xl p-2 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => toggleMenu(item.title, hasActiveChild)}
                                    aria-expanded={isOpen}
                                    className={cn(
                                        'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition',
                                        isParentActive
                                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                                            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900',
                                    )}
                                >
                                    {Icon ? <Icon size={18} /> : null}
                                    <span className="flex-1 truncate">
                                        {labelMap[item.title] ?? item.title}
                                    </span>
                                    <ChevronDown
                                        size={16}
                                        className={cn(
                                            'transition-transform duration-300',
                                            isOpen ? 'rotate-180' : 'rotate-0',
                                        )}
                                    />
                                </button>

                                <div
                                    className={cn(
                                        'overflow-hidden transition-all duration-300 ease-in-out',
                                        isOpen ? 'mt-2 max-h-60 opacity-100' : 'max-h-0 opacity-0',
                                    )}
                                >
                                    <div className="space-y-1 px-2 pb-2">
                                        {item.children?.map((child) => {
                                            const childActive =
                                                url === child.href ||
                                                (child.href !== item.href &&
                                                    url.startsWith(`${child.href}/`));

                                            return (
                                                <Link
                                                    key={child.title}
                                                    href={child.href}
                                                    className={cn(
                                                        'block rounded-xl px-3 py-2 text-sm transition',
                                                        childActive
                                                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                                                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900',
                                                    )}
                                                >
                                                    {labelMap[child.title] ?? child.title}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={item.title}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition',
                                isParentActive
                                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900',
                            )}
                        >
                            {Icon ? <Icon size={18} /> : null}
                            <span className="truncate">{labelMap[item.title] ?? item.title}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}