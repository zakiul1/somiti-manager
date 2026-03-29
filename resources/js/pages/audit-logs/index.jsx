import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppInput } from '@/components/ui/app-input';
import { AppSelect } from '@/components/ui/app-select';
import { AppCard } from '@/components/ui/app-card';
import { AppButton } from '@/components/ui/app-button';
import { useLocale } from '@/hooks/use-locale';

export default function AuditLogsIndex({ logs, filters, stats, modules, actions }) {
    const { t } = useLocale();

    const updateFilter = (key, value) => {
        router.get(
            route('audit-logs.index'),
            { ...filters, [key]: value },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title={t('audit.title')} />
            <AppLayout>
                <PageContainer>
                    <PageHeader title={t('audit.title')} description={t('audit.subtitle')} />

                    <div className="mb-6 grid gap-4 md:grid-cols-3">
                        <AppCard className="p-5">
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('audit.total')}</p>
                            <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{stats.total}</p>
                        </AppCard>
                        <AppCard className="p-5">
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('audit.today')}</p>
                            <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{stats.today}</p>
                        </AppCard>
                        <AppCard className="p-5">
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('audit.activeUsers')}</p>
                            <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{stats.users}</p>
                        </AppCard>
                    </div>

                    <AppCard className="mb-6 p-4">
                        <div className="grid gap-4 md:grid-cols-4">
                            <AppInput
                                value={filters.search}
                                onChange={(e) => updateFilter('search', e.target.value)}
                                placeholder={t('common.search')}
                            />
                            <AppSelect value={filters.module} onChange={(e) => updateFilter('module', e.target.value)}>
                                <option value="all">{t('audit.allModules')}</option>
                                {modules.map((item) => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </AppSelect>
                            <AppSelect value={filters.action} onChange={(e) => updateFilter('action', e.target.value)}>
                                <option value="all">{t('audit.allActions')}</option>
                                {actions.map((item) => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </AppSelect>
                            <div className="flex items-center justify-end">
                                <AppButton variant="outline" onClick={() => router.get(route('audit-logs.index'))}>Reset</AppButton>
                            </div>
                        </div>
                    </AppCard>

                    <AppCard className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                                <thead className="bg-slate-50 dark:bg-slate-900/60">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t('audit.time')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t('audit.module')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t('audit.action')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t('audit.subject')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t('audit.actor')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t('audit.description')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
                                    {logs.data.length ? logs.data.map((log) => (
                                        <tr key={log.id}>
                                            <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{log.created_at}</td>
                                            <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{log.module}</td>
                                            <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{log.action}</td>
                                            <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{log.subject_code ?? '-'}</td>
                                            <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                                                {log.actor ? (
                                                    <div>
                                                        <div>{log.actor.name}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">{log.actor.email}</div>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{log.description}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">{t('audit.noLogs')}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </AppCard>

                    {logs.links?.length > 3 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {logs.links.map((link, index) => (
                                <Link
                                    key={`${link.url}-${index}`}
                                    href={link.url || '#'}
                                    className={`rounded-lg border px-3 py-2 text-sm ${link.active ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'} ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    ) : null}
                </PageContainer>
            </AppLayout>
        </>
    );
}
