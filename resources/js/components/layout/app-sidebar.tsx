import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { APP_NAME, SIDEBAR_NAV_ITEMS } from '@/lib/constants';
import { useLocale } from '@/hooks/use-locale';

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

    const items = SIDEBAR_NAV_ITEMS.filter((item) => {
        if (!item.roles || item.roles.length === 0) {
            return true;
        }

        return item.roles.some((role) => userRoles.includes(role));
    });

    return (
        <aside className="hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:flex lg:flex-col">
            <div className="flex h-16 items-center border-b border-slate-200 px-6 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
                        SM
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{appName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Admin Panel</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto p-4">
                {items.map((item) => {
                    const isActive = item.href !== '#' && (url === item.href || url.startsWith(item.href));
                    const Icon = item.icon;

                    const labelMap: Record<string, string> = {
                        Dashboard: t('nav.dashboard'),
                        Customers: t('nav.customers'),
                        Guarantors: t('nav.guarantors'),
                        Loans: t('nav.loans'),
                        Installments: t('nav.installments'),
                        Payments: t('nav.payments'),
                        Documents: t('nav.documents'),
                        Notifications: t('nav.notifications'),
                        'Admin Users': t('nav.adminUsers'),
                        Reports: t('nav.reports'),
                        'Staff Workflow': t('nav.staffWorkflow'),
                        'Audit Logs': t('nav.auditLogs'),
                        Settings: t('nav.settings'),
                    };

                    const content = (
                        <>
                            {Icon ? <Icon size={18} /> : null}
                            <span>{labelMap[item.title] ?? item.title}</span>
                        </>
                    );

                    if (item.href === '#') {
                        return (
                            <div
                                key={item.title}
                                className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 dark:text-slate-500"
                            >
                                {content}
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={item.title}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition',
                                isActive
                                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900',
                            )}
                        >
                            {content}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
