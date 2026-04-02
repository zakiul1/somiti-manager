import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppCard } from '@/components/ui/app-card';
import { AppButton } from '@/components/ui/app-button';
import { useLocale } from '@/hooks/use-locale';

function InfoRow({ label, value }) {
    return (
        <div className="rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {label}
            </p>
            <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                {value || '-'}
            </p>
        </div>
    );
}

function FilePreviewCard({ title, url }) {
    if (!url) {
        return (
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{title}</p>
                <div className="mt-4 flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    No file uploaded
                </div>
            </div>
        );
    }

    const isPdf = url.toLowerCase().endsWith('.pdf');

    return (
        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{title}</p>

            <div className="mt-4">
                {isPdf ? (
                    <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-indigo-600 dark:text-indigo-400"
                    >
                        Open PDF
                    </a>
                ) : (
                    <img
                        src={url}
                        alt={title}
                        className="h-48 w-full rounded-xl object-cover"
                    />
                )}
            </div>
        </div>
    );
}

export default function AdminUsersShow({ userRecord }) {
    const { t } = useLocale();

    return (
        <>
            <Head title={t('adminUsers.showTitle') || 'Admin User Details'} />

            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={t('adminUsers.showTitle') || 'Admin User Details'}
                        description={t('adminUsers.showSubtitle') || 'View admin profile, account details, and identity documents.'}
                        actions={
                            <div className="flex gap-2">
                                <Link href="/admin-users">
                                    <AppButton variant="outline">
                                        {t('common.back') || 'Back'}
                                    </AppButton>
                                </Link>

                                <Link href={`/admin-users/${userRecord.id}/edit`}>
                                    <AppButton>
                                        {t('adminUsers.editUser') || 'Edit User'}
                                    </AppButton>
                                </Link>
                            </div>
                        }
                    />

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-1">
                            <AppCard className="h-full">
                                <div className="flex flex-col items-center text-center">
                                    {userRecord.photo_url ? (
                                        <img
                                            src={userRecord.photo_url}
                                            alt={userRecord.name}
                                            className="h-32 w-32 rounded-full object-cover ring-4 ring-slate-200 dark:ring-slate-800"
                                        />
                                    ) : (
                                        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-slate-200 text-3xl font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                            {(userRecord.name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    )}

                                    <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
                                        {userRecord.name}
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        @{userRecord.username || 'username'}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        {userRecord.email}
                                    </p>

                                    {userRecord.designation ? (
                                        <p className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                            {userRecord.designation}
                                        </p>
                                    ) : null}

                                    <div className="mt-4">
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                                userRecord.is_active
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                                            }`}
                                        >
                                            {userRecord.is_active
                                                ? (t('adminUsers.active') || 'Active')
                                                : (t('adminUsers.inactive') || 'Inactive')}
                                        </span>
                                    </div>
                                </div>
                            </AppCard>
                        </div>

                        <div className="space-y-6 lg:col-span-2">
                            <AppCard>
                                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                    {t('adminUsers.basicInformation') || 'Basic Information'}
                                </h3>

                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    <InfoRow label={t('adminUsers.name') || 'Name'} value={userRecord.name} />
                                    <InfoRow label={t('adminUsers.username') || 'Username'} value={userRecord.username} />
                                    <InfoRow label={t('adminUsers.email') || 'Email'} value={userRecord.email} />
                                    <InfoRow label={t('adminUsers.phone') || 'Phone'} value={userRecord.phone} />
                                    <InfoRow label={t('adminUsers.role') || 'Role'} value={userRecord.role} />
                                    <InfoRow label={t('adminUsers.status') || 'Status'} value={userRecord.is_active ? 'Active' : 'Inactive'} />
                                    <InfoRow label={t('adminUsers.designation') || 'Designation'} value={userRecord.designation} />
                                    <InfoRow label={t('adminUsers.createdAt') || 'Created At'} value={userRecord.created_at} />
                                </div>

                                <div className="mt-4">
                                    <InfoRow label={t('adminUsers.address') || 'Address'} value={userRecord.address} />
                                </div>
                            </AppCard>

                            <AppCard>
                                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                    {t('adminUsers.workSummary') || 'Work Summary'}
                                </h3>

                                <div className="mt-4 grid gap-4 md:grid-cols-3">
                                    <InfoRow
                                        label={t('adminUsers.customersAssigned') || 'Customers Assigned'}
                                        value={userRecord.assigned_customers_count}
                                    />
                                    <InfoRow
                                        label={t('adminUsers.loansAssigned') || 'Loans Assigned'}
                                        value={userRecord.assigned_loans_count}
                                    />
                                    <InfoRow
                                        label={t('adminUsers.paymentsCollected') || 'Payments Collected'}
                                        value={userRecord.payments_count}
                                    />
                                </div>
                            </AppCard>

                            <AppCard>
                                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                    {t('adminUsers.identityDocuments') || 'Identity Documents'}
                                </h3>

                                <div className="mt-4 grid gap-5 md:grid-cols-3">
                                    <FilePreviewCard
                                        title={t('adminUsers.photo') || 'Photo'}
                                        url={userRecord.photo_url}
                                    />

                                    <FilePreviewCard
                                        title={t('adminUsers.nidFront') || 'NID Front'}
                                        url={userRecord.nid_front_url}
                                    />

                                    <FilePreviewCard
                                        title={t('adminUsers.nidBack') || 'NID Back'}
                                        url={userRecord.nid_back_url}
                                    />
                                </div>
                            </AppCard>
                        </div>
                    </div>
                </PageContainer>
            </AppLayout>
        </>
    );
}