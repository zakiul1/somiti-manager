import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import LoanForm from '@/pages/loans/partials/loan-form';
import { useLocale } from '@/hooks/use-locale';

export default function LoansEdit({ loan, customers, guarantors, staffOptions }) {
    const { t } = useLocale();

    return (
        <>
            <Head title={t('loans.editTitle')} />
            <AppLayout>
                <PageContainer>
                    <PageHeader title={t('loans.editTitle')} description={t('loans.editSubtitle')} />
                    <LoanForm
                        mode="edit"
                        action={`/loans/${loan.id}`}
                        method="put"
                        loan={loan}
                        customers={customers}
                        guarantors={guarantors}
                        staffOptions={staffOptions}
                    />
                </PageContainer>
            </AppLayout>
        </>
    );
}
