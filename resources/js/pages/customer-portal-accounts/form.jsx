import { useForm } from '@inertiajs/react';
import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppInput } from '@/components/ui/app-input';
import { useLocale } from '@/hooks/use-locale';

export default function PortalAccountForm({ customer, portalAccount = null, submitLabel, onSubmit }) {
    const { t } = useLocale();
    const form = useForm({
        name: portalAccount?.name ?? customer.name,
        email: portalAccount?.email ?? customer.email ?? '',
        password: '',
        password_confirmation: '',
        portal_access_enabled: portalAccount?.portal_access_enabled ?? true,
    });

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-6">
            <AppCard>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('portal.accountSetup')}</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{customer.name} • {customer.customer_code}</p>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium">{t('portal.loginName')}</label>
                        <AppInput value={form.data.name} onChange={(e)=>form.setData('name', e.target.value)} />
                        {form.errors.name ? <p className="mt-1 text-xs text-rose-600">{form.errors.name}</p> : null}
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium">{t('portal.customerLoginField')}</label>
                        <AppInput value={customer.phone} disabled />
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('portal.customerPhoneLoginHint')}</p>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium">{t('portal.loginEmail')}</label>
                        <AppInput type="email" value={form.data.email} onChange={(e)=>form.setData('email', e.target.value)} />
                        {form.errors.email ? <p className="mt-1 text-xs text-rose-600">{form.errors.email}</p> : null}
                    </div>
                    <div className="flex items-end">
                        <label className="flex items-center gap-3 text-sm">
                            <input type="checkbox" checked={form.data.portal_access_enabled} onChange={(e)=>form.setData('portal_access_enabled', e.target.checked)} />
                            <span>{t('portal.portalAccessEnabled')}</span>
                        </label>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium">{t('portal.password')}</label>
                        <AppInput type="password" value={form.data.password} onChange={(e)=>form.setData('password', e.target.value)} />
                        {form.errors.password ? <p className="mt-1 text-xs text-rose-600">{form.errors.password}</p> : null}
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium">{t('portal.confirmPassword')}</label>
                        <AppInput type="password" value={form.data.password_confirmation} onChange={(e)=>form.setData('password_confirmation', e.target.value)} />
                    </div>
                </div>
            </AppCard>
            <div className="flex justify-end"><AppButton disabled={form.processing}>{submitLabel}</AppButton></div>
        </form>
    );
}
