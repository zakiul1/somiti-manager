import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import PortalAccountForm from '@/pages/customer-portal-accounts/form';
import { useLocale } from '@/hooks/use-locale';

export default function CreateCustomerPortalAccount({ customer }) {
    const { t } = useLocale();
    return <><Head title={t('portal.createPortalAccount')} /><AppLayout><PageContainer><PageHeader title={t('portal.createPortalAccount')} description={t('portal.adminDescription')} /><PortalAccountForm customer={customer} submitLabel={t('portal.createPortalAccount')} onSubmit={(form)=>form.post(`/customers/${customer.id}/portal-account`)} /></PageContainer></AppLayout></>;
}
