import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import AdminUserForm from '@/pages/admin-users/partials/admin-user-form';
import { useLocale } from '@/hooks/use-locale';

export default function AdminUsersCreate({ roleOptions = [] }) {
    const { t } = useLocale();

    return (
        <>
            <Head title={t('adminUsers.createTitle') || 'Create Admin User'} />

            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={t('adminUsers.createTitle') || 'Create Admin User'}
                        description={t('adminUsers.createSubtitle') || 'Create a new admin or super admin account with profile details and identity documents.'}
                    />

                    <AdminUserForm
                        mode="create"
                        action="/admin-users"
                        method="post"
                        roleOptions={roleOptions}
                    />
                </PageContainer>
            </AppLayout>
        </>
    );
}