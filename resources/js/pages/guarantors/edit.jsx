import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import GuarantorForm from '@/pages/guarantors/partials/guarantor-form';
import { useLocale } from '@/hooks/use-locale';

export default function GuarantorsEdit({ guarantor, customers }) {
    const { t } = useLocale();

    return (
        <>
            <Head title={t('guarantors.editTitle')} />
            <AppLayout>
                <PageContainer>
                    <PageHeader title={t('guarantors.editTitle')} description={t('guarantors.editSubtitle')} />
                    <GuarantorForm mode="edit" action={`/guarantors/${guarantor.id}`} method="put" guarantor={guarantor} customers={customers} />
                </PageContainer>
            </AppLayout>
        </>
    );
}
