import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppCard } from '@/components/ui/app-card';
import { AppBadge } from '@/components/ui/app-badge';
import { AppInput } from '@/components/ui/app-input';
import { AppTextarea } from '@/components/ui/app-textarea';
import { AppButton } from '@/components/ui/app-button';
import { AppLabel } from '@/components/ui/app-label';
import { useLocale } from '@/hooks/use-locale';

export default function SettingsIndex({ settings }) {
    const { props } = usePage();
    const { t } = useLocale();
    const form = useForm({
        organization_name_en: settings?.organization_name_en ?? '',
        organization_name_bn: settings?.organization_name_bn ?? '',
        organization_address_en: settings?.organization_address_en ?? '',
        organization_address_bn: settings?.organization_address_bn ?? '',
        organization_phone: settings?.organization_phone ?? '',
        organization_email: settings?.organization_email ?? '',
        organization_footer_en: settings?.organization_footer_en ?? '',
        organization_footer_bn: settings?.organization_footer_bn ?? '',
        organization_authority_name: settings?.organization_authority_name ?? '',
        organization_authority_title_en: settings?.organization_authority_title_en ?? '',
        organization_authority_title_bn: settings?.organization_authority_title_bn ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.patch(route('settings.update'));
    };

    return (
        <>
            <Head title={t('settings.title')} />

            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={t('settings.title')}
                        description={t('settings.subtitle')}
                    />

                    <div className="grid gap-6 lg:grid-cols-3">
                        <form onSubmit={submit} className="lg:col-span-2 space-y-6">
                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('settings.printBranding')}</h2>
                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t('settings.printBrandingHelp')}</p>

                                <div className="mt-6 grid gap-4 md:grid-cols-2">
                                    <div>
                                        <AppLabel>{t('settings.organizationNameEn')}</AppLabel>
                                        <AppInput value={form.data.organization_name_en} onChange={(e) => form.setData('organization_name_en', e.target.value)} />
                                        {form.errors.organization_name_en ? <p className="mt-1 text-sm text-rose-600">{form.errors.organization_name_en}</p> : null}
                                    </div>
                                    <div>
                                        <AppLabel>{t('settings.organizationNameBn')}</AppLabel>
                                        <AppInput value={form.data.organization_name_bn} onChange={(e) => form.setData('organization_name_bn', e.target.value)} />
                                        {form.errors.organization_name_bn ? <p className="mt-1 text-sm text-rose-600">{form.errors.organization_name_bn}</p> : null}
                                    </div>
                                    <div>
                                        <AppLabel>{t('settings.phone')}</AppLabel>
                                        <AppInput value={form.data.organization_phone} onChange={(e) => form.setData('organization_phone', e.target.value)} />
                                    </div>
                                    <div>
                                        <AppLabel>{t('settings.email')}</AppLabel>
                                        <AppInput type="email" value={form.data.organization_email} onChange={(e) => form.setData('organization_email', e.target.value)} />
                                        {form.errors.organization_email ? <p className="mt-1 text-sm text-rose-600">{form.errors.organization_email}</p> : null}
                                    </div>
                                    <div>
                                        <AppLabel>{t('settings.addressEn')}</AppLabel>
                                        <AppTextarea rows={4} value={form.data.organization_address_en} onChange={(e) => form.setData('organization_address_en', e.target.value)} />
                                    </div>
                                    <div>
                                        <AppLabel>{t('settings.addressBn')}</AppLabel>
                                        <AppTextarea rows={4} value={form.data.organization_address_bn} onChange={(e) => form.setData('organization_address_bn', e.target.value)} />
                                    </div>
                                    <div>
                                        <AppLabel>{t('settings.authorityName')}</AppLabel>
                                        <AppInput value={form.data.organization_authority_name} onChange={(e) => form.setData('organization_authority_name', e.target.value)} />
                                    </div>
                                    <div>
                                        <AppLabel>{t('settings.authorityTitleEn')}</AppLabel>
                                        <AppInput value={form.data.organization_authority_title_en} onChange={(e) => form.setData('organization_authority_title_en', e.target.value)} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <AppLabel>{t('settings.authorityTitleBn')}</AppLabel>
                                        <AppInput value={form.data.organization_authority_title_bn} onChange={(e) => form.setData('organization_authority_title_bn', e.target.value)} />
                                    </div>
                                    <div>
                                        <AppLabel>{t('settings.footerEn')}</AppLabel>
                                        <AppTextarea rows={3} value={form.data.organization_footer_en} onChange={(e) => form.setData('organization_footer_en', e.target.value)} />
                                    </div>
                                    <div>
                                        <AppLabel>{t('settings.footerBn')}</AppLabel>
                                        <AppTextarea rows={3} value={form.data.organization_footer_bn} onChange={(e) => form.setData('organization_footer_bn', e.target.value)} />
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <AppButton type="submit" disabled={form.processing}>{t('settings.save')}</AppButton>
                                </div>
                            </AppCard>
                        </form>

                        <div className="space-y-6">
                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('settings.foundationStatus')}</h2>
                                <div className="mt-6 grid gap-3">
                                    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">App</p>
                                        <p className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">{props.app?.name ?? 'Somiti Manager'}</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Locale</p>
                                        <p className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">{props.app?.locale ?? 'en'}</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('settings.access')}</p>
                                        <p className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">{t('settings.adminProtected')}</p>
                                    </div>
                                </div>
                            </AppCard>

                            <AppCard>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('settings.visibleTo')}</h2>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {(props.auth?.user?.roles ?? []).map((role) => (
                                        <AppBadge key={role}>{role}</AppBadge>
                                    ))}
                                </div>
                            </AppCard>
                        </div>
                    </div>
                </PageContainer>
            </AppLayout>
        </>
    );
}
