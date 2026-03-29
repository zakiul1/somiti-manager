import CustomerPortalLayout from '@/layouts/customer-portal-layout';
import { AppCard } from '@/components/ui/app-card';
import { useLocale } from '@/hooks/use-locale';

function Info({ label, value, className = '' }) {
    return (
        <div className={className}>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">{value || '-'}</p>
        </div>
    );
}

function MediaCard({ title, src }) {
    return (
        <AppCard>
            <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
            {src ? (
                <img src={src} alt={title} className="h-56 w-full rounded-2xl object-cover" />
            ) : (
                <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-500">No file uploaded</div>
            )}
        </AppCard>
    );
}

export default function PortalProfile({ customer, portalAccount }) {
    const { t } = useLocale();

    return (
        <CustomerPortalLayout title={t('portal.profile')}>
            <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
                <div className="space-y-6">
                    <AppCard>
                        <div className="flex items-start gap-4">
                            {customer.photo_url ? (
                                <img src={customer.photo_url} alt={customer.full_name} className="h-20 w-20 rounded-2xl object-cover" />
                            ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-xl font-semibold text-slate-500 dark:bg-slate-900 dark:text-slate-300">
                                    {customer.full_name?.charAt(0)}
                                </div>
                            )}
                            <div className="min-w-0">
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{customer.full_name}</h1>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{customer.customer_code} • {customer.phone}</p>
                            </div>
                        </div>
                    </AppCard>

                    <AppCard>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('portal.profileSummary')}</h2>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <Info label={t('customers.phone')} value={customer.phone} />
                            <Info label={t('customers.email')} value={customer.email} />
                            <Info label={t('customers.nidNumber')} value={customer.nid_number} />
                            <Info label={t('customers.dateOfBirth')} value={customer.date_of_birth} />
                            <Info label={t('customers.gender')} value={customer.gender} />
                            <Info label={t('customers.status')} value={customer.status} />
                            <Info label={t('customers.presentAddress')} value={customer.present_address} />
                            <Info label={t('customers.permanentAddress')} value={customer.permanent_address} />
                            <Info label={t('portal.loginId')} value={portalAccount.username} />
                            <Info label={t('portal.lastLogin')} value={portalAccount.last_login_at} />
                        </div>
                    </AppCard>
                </div>

                <div className="space-y-6">
                    <MediaCard title={t('customers.profilePhoto')} src={customer.photo_url} />
                    <MediaCard title={t('customers.nidFront')} src={customer.nid_front_url} />
                    <MediaCard title={t('customers.nidBack')} src={customer.nid_back_url} />
                </div>
            </div>
        </CustomerPortalLayout>
    );
}
