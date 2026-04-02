import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
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

function UserAvatar({ user }) {
    if (user.photo_url) {
        return (
            <img
                src={user.photo_url}
                alt={user.name}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-800"
            />
        );
    }

    const initial = (user.name || 'U').charAt(0).toUpperCase();

    return (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {initial}
        </div>
    );
}

export default function AdminUsersIndex({ users, filters, stats }) {
    const { t } = useLocale();
    const [search, setSearch] = useState(filters.search ?? '');
    const [role, setRole] = useState(filters.role ?? 'all');
    const [status, setStatus] = useState(filters.status ?? 'all');

    const applyFilters = (next = {}) => {
        router.get(
            '/admin-users',
            {
                search,
                role,
                status,
                ...next,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const clearFilters = () => {
        setSearch('');
        setRole('all');
        setStatus('all');
        router.get('/admin-users', {}, { preserveState: true, preserveScroll: true });
    };

    return (
        <>
            <Head title={t('adminUsers.title') || 'Admin Users'} />

            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={t('adminUsers.title') || 'Admin Users'}
                        description={t('adminUsers.subtitle') || 'Manage admin and super-admin accounts.'}
                        actions={
                            <Link href="/admin-users/create">
                                <AppButton>{t('adminUsers.addUser') || 'Add User'}</AppButton>
                            </Link>
                        }
                    />

                    <div className="mb-6 grid gap-4 md:grid-cols-4">
                        <AppCard>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t('adminUsers.totalUsers') || 'Total Users'}
                            </p>
                            <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                {stats.total}
                            </p>
                        </AppCard>

                        <AppCard>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t('adminUsers.activeUsers') || 'Active Users'}
                            </p>
                            <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                {stats.active}
                            </p>
                        </AppCard>

                        <AppCard>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t('adminUsers.inactiveUsers') || 'Inactive Users'}
                            </p>
                            <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                {stats.inactive}
                            </p>
                        </AppCard>

                        <AppCard>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t('adminUsers.admins') || 'Admins'}
                            </p>
                            <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                {stats.admins}
                            </p>
                        </AppCard>
                    </div>

                    <AppCard className="mb-6">
                        <div className="grid gap-4 md:grid-cols-4">
                            <AppInput
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder={t('adminUsers.searchPlaceholder') || 'Search by name, username, email, or phone'}
                            />

                            <AppSelect value={role} onChange={(event) => setRole(event.target.value)}>
                                <option value="all">{t('adminUsers.allRoles') || 'All Roles'}</option>
                                <option value="super-admin">{t('adminUsers.superAdmin') || 'Super Admin'}</option>
                                <option value="admin">{t('adminUsers.admin') || 'Admin'}</option>
                            </AppSelect>

                            <AppSelect value={status} onChange={(event) => setStatus(event.target.value)}>
                                <option value="all">{t('adminUsers.allStatus') || 'All Status'}</option>
                                <option value="active">{t('adminUsers.active') || 'Active'}</option>
                                <option value="inactive">{t('adminUsers.inactive') || 'Inactive'}</option>
                            </AppSelect>

                            <div className="flex gap-2">
                                <AppButton type="button" onClick={() => applyFilters()}>
                                    {t('adminUsers.applyFilters') || 'Apply Filters'}
                                </AppButton>

                                <AppButton type="button" variant="outline" onClick={clearFilters}>
                                    {t('common.clearFilters') || 'Clear'}
                                </AppButton>
                            </div>
                        </div>
                    </AppCard>

                    <DataTableShell>
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                            <thead className="bg-slate-50 dark:bg-slate-950/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        {t('adminUsers.name') || 'User'}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        {t('adminUsers.role') || 'Role'}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        {t('adminUsers.status') || 'Status'}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        {t('adminUsers.assignments') || 'Assignments'}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        {t('adminUsers.actions') || 'Actions'}
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {users.data.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <UserAvatar user={user} />

                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-slate-100">
                                                        {user.name}
                                                    </p>

                                                    {user.username ? (
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                                            @{user.username}
                                                        </p>
                                                    ) : null}

                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        {user.email}
                                                    </p>

                                                    {user.phone ? (
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                                            {user.phone}
                                                        </p>
                                                    ) : null}

                                                    {user.designation ? (
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                                            {user.designation}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                                            {user.roles.join(', ')}
                                        </td>

                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    user.is_active
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                                                }`}
                                            >
                                                {user.is_active
                                                    ? t('adminUsers.active') || 'Active'
                                                    : t('adminUsers.inactive') || 'Inactive'}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                                            <p>
                                                {t('adminUsers.customersAssigned') || 'Customers Assigned'}:{' '}
                                                {user.assigned_customers_count}
                                            </p>
                                            <p>
                                                {t('adminUsers.loansAssigned') || 'Loans Assigned'}:{' '}
                                                {user.assigned_loans_count}
                                            </p>
                                            <p>
                                                {t('adminUsers.paymentsCollected') || 'Payments Collected'}:{' '}
                                                {user.payments_count}
                                            </p>
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin-users/${user.id}`}>
                                                    <AppButton size="sm" variant="outline">
                                                        {t('common.view') || 'View'}
                                                    </AppButton>
                                                </Link>

                                                <Link href={`/admin-users/${user.id}/edit`}>
                                                    <AppButton size="sm" variant="outline">
                                                        {t('adminUsers.editUser') || 'Edit'}
                                                    </AppButton>
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.patch(
                                                            `/admin-users/${user.id}/toggle-status`,
                                                            {},
                                                            { preserveScroll: true }
                                                        )
                                                    }
                                                    className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    {user.is_active
                                                        ? t('adminUsers.deactivate') || 'Deactivate'
                                                        : t('adminUsers.activate') || 'Activate'}
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
                            itemLabel={t('adminUsers.userItems') || 'users'}
                        />
                    </DataTableShell>
                </PageContainer>
            </AppLayout>
        </>
    );
}