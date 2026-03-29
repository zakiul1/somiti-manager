import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import CustomerForm from '@/pages/customers/partials/customer-form';
import { useLocale } from '@/hooks/use-locale';

export default function CustomersCreate({ customerCode, staffOptions }) {
    const { t } = useLocale();

    return (
        <>
            <Head title={t('customers.createTitle')} />

            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={t('customers.createTitle')}
                        description={t('customers.createSubtitle')}
                    />

                    <CustomerForm
                        mode="create"
                        action="/customers"
                        method="post"
                        customerCode={customerCode}
                        staffOptions={staffOptions}
                    />
                </PageContainer>
            </AppLayout>
        </>
    );
}
