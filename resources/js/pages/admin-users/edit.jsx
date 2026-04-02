import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import AdminUserForm from '@/pages/admin-users/partials/admin-user-form';
import { useLocale } from '@/hooks/use-locale';

export default function AdminUsersEdit({ userRecord, roleOptions = [] }) {
    const { t } = useLocale();

    return (
        <>
            <Head title={t('adminUsers.editTitle') || 'Edit Admin User'} />

            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={t('adminUsers.editTitle') || 'Edit Admin User'}
                        description={t('adminUsers.editSubtitle') || 'Update admin profile details, role, identity files, and account status.'}
                    />

                    <AdminUserForm
                        mode="edit"
                        action={`/admin-users/${userRecord.id}`}
                        method="put"
                        userRecord={userRecord}
                        roleOptions={roleOptions}
                    />
                </PageContainer>
            </AppLayout>
        </>
    );
}