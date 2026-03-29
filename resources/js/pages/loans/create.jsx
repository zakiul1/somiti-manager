import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import LoanForm from '@/pages/loans/partials/loan-form';
import { useLocale } from '@/hooks/use-locale';

export default function LoansCreate({ loanCode, selectedCustomer, customers, guarantors, staffOptions }) {
    const { t } = useLocale();

    return (
        <>
            <Head title={t('loans.createTitle')} />
            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={t('loans.createTitle')}
                        description={selectedCustomer ? `${t('loans.createSubtitle')} ${selectedCustomer.name} (${selectedCustomer.customer_code})` : t('loans.createSubtitle')}
                    />
                    <LoanForm
                        mode="create"
                        action="/loans"
                        method="post"
                        loanCode={loanCode}
                        selectedCustomer={selectedCustomer}
                        customers={customers}
                        guarantors={guarantors}
                        staffOptions={staffOptions}
                    />
                </PageContainer>
            </AppLayout>
        </>
    );
}
