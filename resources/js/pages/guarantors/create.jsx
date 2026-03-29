import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import GuarantorForm from '@/pages/guarantors/partials/guarantor-form';
import { useLocale } from '@/hooks/use-locale';

export default function GuarantorsCreate({ guarantorCode, selectedCustomer, customers }) {
    const { t } = useLocale();

    return (
        <>
            <Head title={t('guarantors.createTitle')} />
            <AppLayout>
                <PageContainer>
                    <PageHeader title={t('guarantors.createTitle')} description={selectedCustomer ? `${t('guarantors.createSubtitle')} ${selectedCustomer.name} (${selectedCustomer.customer_code})` : t('guarantors.createSubtitle')} />
                    <GuarantorForm mode="create" action="/guarantors" method="post" guarantorCode={guarantorCode} selectedCustomer={selectedCustomer} customers={customers} />
                </PageContainer>
            </AppLayout>
        </>
    );
}
