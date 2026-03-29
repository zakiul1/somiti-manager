import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import PortalAccountForm from '@/pages/customer-portal-accounts/form';
import { useLocale } from '@/hooks/use-locale';

export default function EditCustomerPortalAccount({ customer, portalAccount }) {
    const { t } = useLocale();
    return <><Head title={t('portal.editPortalAccount')} /><AppLayout><PageContainer><PageHeader title={t('portal.editPortalAccount')} description={t('portal.adminDescription')} actions={<AppButton variant="outline" onClick={()=>router.patch(`/customers/${customer.id}/portal-account/toggle`)}>{portalAccount.portal_access_enabled ? t('portal.disableAccess') : t('portal.enableAccess')}</AppButton>} /><div className="grid gap-6 xl:grid-cols-[2fr,1fr]"><PortalAccountForm customer={customer} portalAccount={portalAccount} submitLabel={t('portal.updatePortalAccount')} onSubmit={(form)=>form.put(`/customers/${customer.id}/portal-account`)} /><AppCard><h2 className="text-lg font-semibold">{t('portal.portalSummary')}</h2><div className="mt-4 space-y-4 text-sm"><div><p className="text-slate-500 dark:text-slate-400">{t('portal.customerName')}</p><p className="mt-1 text-slate-900 dark:text-slate-100">{customer.name}</p></div><div><p className="text-slate-500 dark:text-slate-400">{t('portal.portalStatus')}</p><p className="mt-1 text-slate-900 dark:text-slate-100">{portalAccount.portal_access_enabled ? t('portal.enabled') : t('portal.disabled')}</p></div><div><p className="text-slate-500 dark:text-slate-400">{t('portal.lastLogin')}</p><p className="mt-1 text-slate-900 dark:text-slate-100">{portalAccount.last_login_at || '-'}</p></div></div></AppCard></div></PageContainer></AppLayout></>;
}
