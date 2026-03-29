import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import AdminUserForm from '@/pages/admin-users/partials/admin-user-form';
import { useLocale } from '@/hooks/use-locale';

export default function AdminUsersCreate({ roleOptions }) {
    const { t } = useLocale();

    return (
        <>
            <Head title={t('adminUsers.createTitle')} />

            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={t('adminUsers.createTitle')}
                        description={t('adminUsers.createSubtitle')}
                    />
                    <AdminUserForm mode="create" action="/admin-users" method="post" roleOptions={roleOptions} />
                </PageContainer>
            </AppLayout>
        </>
    );
}
