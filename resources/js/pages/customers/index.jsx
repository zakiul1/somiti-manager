import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppButton } from '@/components/ui/app-button';
import { AppBadge } from '@/components/ui/app-badge';
import { AppCard } from '@/components/ui/app-card';
import { EmptyState } from '@/components/feedback/empty-state';
import { DataTableShell } from '@/components/tables/data-table-shell';
import { TableSearch } from '@/components/tables/table-search';
import { TableActions } from '@/components/tables/table-actions';
import { TablePagination } from '@/components/tables/table-pagination';
import { AppSelect } from '@/components/ui/app-select';
import { ConfirmDeleteModal } from '@/components/modals/confirm-delete-modal';
import { useLocale } from '@/hooks/use-locale';

function StatCard({ title, value }) {
    return (
        <AppCard>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
        </AppCard>
    );
}

export default function CustomersIndex({ customers, filters, stats }) {
    const { t } = useLocale();
    const { props } = usePage();
    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? 'all');
    const [gender, setGender] = useState(filters?.gender ?? 'all');
    const [perPage, setPerPage] = useState(String(filters?.per_page ?? 10));
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            router.get('/customers', {
                search,
                status,
                gender,
                per_page: perPage,
            }, {
                preserveState: true,
                replace: true,
                preserveScroll: true,
                only: ['customers', 'filters', 'stats', 'flash'],
            });
        }, 350);

        return () => window.clearTimeout(timeout);
    }, [search, status, gender, perPage]);

    const exportUrl = useMemo(() => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (status && status !== 'all') params.set('status', status);
        if (gender && gender !== 'all') params.set('gender', gender);
        return `/customers-export${params.toString() ? `?${params.toString()}` : ''}`;
    }, [search, status, gender]);

    return (
        <>
            <Head title={t('customers.title')} />

            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={t('customers.title')}
                        description={t('customers.subtitle')}
                        actions={
                            <div className="flex flex-wrap gap-2">
                                <a href={exportUrl}>
                                    <AppButton variant="outline">{t('customers.exportCustomers')}</AppButton>
                                </a>
                                <Link href="/customers/create">
                                    <AppButton>{t('customers.addCustomer')}</AppButton>
                                </Link>
                            </div>
                        }
                    />

                    {props.flash?.success ? (
                        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                            {props.flash.success}
                        </div>
                    ) : null}
                    {props.flash?.error ? (
                        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                            {props.flash.error}
                        </div>
                    ) : null}

                    <div className="mb-6 grid gap-4 md:grid-cols-3">
                        <StatCard title={t('customers.totalCustomers')} value={stats?.total ?? 0} />
                        <StatCard title={t('customers.activeCustomers')} value={stats?.active ?? 0} />
                        <StatCard title={t('customers.inactiveCustomers')} value={stats?.inactive ?? 0} />
                    </div>

                    <AppCard className="mb-6">
                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_180px_140px]">
                            <TableSearch value={search} onChange={setSearch} placeholder={t('customers.searchPlaceholder')} />

                            <AppSelect value={status} onChange={(event) => setStatus(event.target.value)}>
                                <option value="all">{t('customers.allStatus')}</option>
                                <option value="active">{t('customers.active')}</option>
                                <option value="inactive">{t('customers.inactive')}</option>
                            </AppSelect>

                            <AppSelect value={gender} onChange={(event) => setGender(event.target.value)}>
                                <option value="all">{t('customers.allGenders')}</option>
                                <option value="male">{t('customers.male')}</option>
                                <option value="female">{t('customers.female')}</option>
                                <option value="other">{t('customers.other')}</option>
                            </AppSelect>

                            <AppSelect value={perPage} onChange={(event) => setPerPage(event.target.value)}>
                                <option value="10">10 / page</option>
                                <option value="25">25 / page</option>
                                <option value="50">50 / page</option>
                            </AppSelect>
                        </div>
                    </AppCard>

                    {!customers?.data?.length ? (
                        <EmptyState title={t('customers.noCustomers')} description={t('customers.listSubtitle')} actionLabel={t('customers.addCustomer')} onAction={() => router.visit('/customers/create')} />
                    ) : (
                        <DataTableShell>
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                                <thead className="bg-slate-50 dark:bg-slate-950/40">
                                    <tr>
                                        {[
                                            t('customers.customerCode'),
                                            t('customers.name'),
                                            t('customers.phone'),
                                            t('customers.status'),
                                            t('customers.assets'),
                                            t('customers.actions'),
                                        ].map((heading) => (
                                            <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                                    {customers.data.map((customer) => (
                                        <tr key={customer.id}>
                                            <td className="px-4 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">{customer.customer_code}</td>
                                            <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                                                <Link className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400" href={`/customers/${customer.id}`}>
                                                    {customer.name}
                                                </Link>
                                                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{customer.email || customer.occupation || '-'}</div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{customer.phone}</td>
                                            <td className="px-4 py-4 text-sm">
                                                <AppBadge variant={customer.status === 'active' ? 'success' : 'warning'}>
                                                    {customer.status === 'active' ? t('customers.active') : t('customers.inactive')}
                                                </AppBadge>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                                                <div className="flex flex-wrap gap-2">
                                                    <AppBadge variant={customer.has_photo ? 'success' : 'default'}>{customer.has_photo ? t('customers.photoReady') : t('customers.photoPending')}</AppBadge>
                                                    <AppBadge variant={customer.has_documents ? 'success' : 'default'}>{customer.has_documents ? t('customers.documentReady') : t('customers.documentPending')}</AppBadge>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm">
                                                <TableActions>
                                                    <Link href={`/customers/${customer.id}`}>
                                                        <AppButton variant="outline" size="sm">{t('customers.viewCustomer')}</AppButton>
                                                    </Link>
                                                    <Link href={`/customers/${customer.id}/edit`}>
                                                        <AppButton variant="outline" size="sm">{t('customers.editCustomer')}</AppButton>
                                                    </Link>
                                                    <AppButton variant="danger" size="sm" onClick={() => setDeleteTarget(customer)}>{t('customers.deleteCustomer')}</AppButton>
                                                </TableActions>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <TablePagination
                                links={customers.links}
                                from={customers.from}
                                to={customers.to}
                                total={customers.total}
                                previousPageUrl={customers.prev_page_url}
                                nextPageUrl={customers.next_page_url}
                                itemLabel="customers"
                            />
                        </DataTableShell>
                    )}
                </PageContainer>
            </AppLayout>

            <ConfirmDeleteModal
                show={Boolean(deleteTarget)}
                title={t('customers.deleteCustomer')}
                description={t('customers.deleteConfirm')}
                confirmLabel={t('common.delete')}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => deleteTarget && router.delete(`/customers/${deleteTarget.id}`, { preserveScroll: true, onSuccess: () => setDeleteTarget(null) })}
            />
        </>
    );
}
