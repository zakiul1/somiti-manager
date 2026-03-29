import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import DocumentForm from '@/pages/documents/partials/document-form';
import { useLocale } from '@/hooks/use-locale';

export default function DocumentsCreate({ documentCode, customers, loans, selectedEntity }) {
    const { t } = useLocale();

    return (
        <>
            <Head title={t('documents.createTitle')} />
            <AppLayout>
                <PageContainer>
                    <PageHeader title={t('documents.createTitle')} description={t('documents.createSubtitle')} />
                    <DocumentForm action="/documents" method="post" documentCode={documentCode} customers={customers} loans={loans} selectedEntity={selectedEntity} />
                </PageContainer>
            </AppLayout>
        </>
    );
}
