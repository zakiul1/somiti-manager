import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import CustomerForm from '@/pages/customers/partials/customer-form';
import { useLocale } from '@/hooks/use-locale';

export default function CustomersEdit({ customer, staffOptions }) {
    const { t } = useLocale();

    return (
        <>
            <Head title={t('customers.editTitle')} />

            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={t('customers.editTitle')}
                        description={t('customers.editSubtitle')}
                    />

                    <CustomerForm
                        mode="edit"
                        action={`/customers/${customer.id}`}
                        method="put"
                        customer={customer}
                        staffOptions={staffOptions}
                    />
                </PageContainer>
            </AppLayout>
        </>
    );
}
