import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import DocumentForm from '@/pages/documents/partials/document-form';
import { useLocale } from '@/hooks/use-locale';

export default function DocumentsEdit({ document, customers, loans }) {
    const { t } = useLocale();

    return (
        <>
            <Head title={t('documents.editTitle')} />
            <AppLayout>
                <PageContainer>
                    <PageHeader title={t('documents.editTitle')} description={t('documents.editSubtitle')} />
                    <DocumentForm mode="edit" action={`/documents/${document.id}`} method="put" document={document} customers={customers} loans={loans} />
                </PageContainer>
            </AppLayout>
        </>
    );
}
