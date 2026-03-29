import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppCard } from '@/components/ui/app-card';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { AppSelect } from '@/components/ui/app-select';
import { DataTableShell } from '@/components/tables/data-table-shell';
import { TablePagination } from '@/components/tables/table-pagination';
import { useLocale } from '@/hooks/use-locale';
import { useState } from 'react';

export default function AdminUsersIndex({ users, filters, stats }) {
    const { t } = useLocale();
    const [search, setSearch] = useState(filters.search ?? '');
    const [role, setRole] = useState(filters.role ?? 'all');
    const [status, setStatus] = useState(filters.status ?? 'all');

    const applyFilters = (next = {}) => {
        router.get('/admin-users', {
            search,
            role,
            status,
            ...next,
        }, { preserveState: true, preserveScroll: true });
    };

    const clearFilters = () => {
        setSearch('');
        setRole('all');
        setStatus('all');
        router.get('/admin-users', {}, { preserveState: true, preserveScroll: true });
    };

    return (
        <>
            <Head title={t('adminUsers.title')} />

            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={t('adminUsers.title')}
                        description={t('adminUsers.subtitle')}
                        actions={
                            <Link href="/admin-users/create">
                                <AppButton>{t('adminUsers.addUser')}</AppButton>
                            </Link>
                        }
                    />

                    <div className="mb-6 grid gap-4 md:grid-cols-4">
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('adminUsers.totalUsers')}</p><p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{stats.total}</p></AppCard>
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('adminUsers.activeUsers')}</p><p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{stats.active}</p></AppCard>
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('adminUsers.inactiveUsers')}</p><p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{stats.inactive}</p></AppCard>
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('adminUsers.admins')}</p><p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{stats.admins}</p></AppCard>
                    </div>

                    <AppCard className="mb-6">
                        <div className="grid gap-4 md:grid-cols-4">
                            <AppInput
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder={t('adminUsers.searchPlaceholder')}
                            />
                            <AppSelect value={role} onChange={(event) => setRole(event.target.value)}>
                                <option value="all">{t('adminUsers.allRoles')}</option>
                                <option value="super-admin">{t('adminUsers.superAdmin')}</option>
                                <option value="admin">{t('adminUsers.admin')}</option>
                            </AppSelect>
                            <AppSelect value={status} onChange={(event) => setStatus(event.target.value)}>
                                <option value="all">{t('adminUsers.allStatus')}</option>
                                <option value="active">{t('adminUsers.active')}</option>
                                <option value="inactive">{t('adminUsers.inactive')}</option>
                            </AppSelect>
                            <div className="flex gap-2">
                                <AppButton type="button" onClick={() => applyFilters()}>{t('adminUsers.applyFilters')}</AppButton>
                                <AppButton type="button" variant="outline" onClick={clearFilters}>{t('common.clearFilters')}</AppButton>
                            </div>
                        </div>
                    </AppCard>

                    <DataTableShell>
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                            <thead className="bg-slate-50 dark:bg-slate-950/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t('adminUsers.name')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t('adminUsers.role')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t('adminUsers.status')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t('adminUsers.assignments')}</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">{t('adminUsers.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {users.data.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-4 py-4">
                                            <p className="font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{user.roles.join(', ')}</td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                {user.is_active ? t('adminUsers.active') : t('adminUsers.inactive')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                                            <p>{t('adminUsers.customersAssigned')}: {user.assigned_customers_count}</p>
                                            <p>{t('adminUsers.loansAssigned')}: {user.assigned_loans_count}</p>
                                            <p>{t('adminUsers.paymentsCollected')}: {user.payments_count}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin-users/${user.id}/edit`}>
                                                    <AppButton size="sm" variant="outline">{t('adminUsers.editUser')}</AppButton>
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => router.patch(`/admin-users/${user.id}/toggle-status`, {}, { preserveScroll: true })}
                                                    className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100"
                                                >
                                                    {user.is_active ? t('adminUsers.deactivate') : t('adminUsers.activate')}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <TablePagination
                            links={users.links}
                            from={users.from}
                            to={users.to}
                            total={users.total}
                            previousPageUrl={users.prev_page_url}
                            nextPageUrl={users.next_page_url}
                            itemLabel={t('adminUsers.userItems')}
                        />
                    </DataTableShell>
                </PageContainer>
            </AppLayout>
        </>
    );
}
