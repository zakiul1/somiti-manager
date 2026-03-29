import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppCard } from '@/components/ui/app-card';
import { AppButton } from '@/components/ui/app-button';
import { useLocale } from '@/hooks/use-locale';

const money = (value, locale = 'en') => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 2 }).format(Number(value || 0));

export default function InstallmentsShow({ loan }) {
    const { t, locale } = useLocale();
    return (
        <>
            <Head title={`${t('installments.title')} - ${loan.loan_code}`} />
            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={`${t('installments.scheduleFor')} ${loan.loan_code}`}
                        description={t('installments.scheduleSubtitle')}
                        actions={<div className="flex flex-wrap gap-2"><Link href={`/loans/${loan.id}`}><AppButton variant="outline">{t('installments.backToLoan')}</AppButton></Link><Link href={`/loans/${loan.id}/installments/print?locale=${locale}`}><AppButton variant="outline">{t('print.installmentSchedule')}</AppButton></Link></div>}
                    />

                    <div className="grid gap-4 md:grid-cols-4 mb-6">
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('installments.loan')}</p><p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{loan.loan_code}</p></AppCard>
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('installments.customer')}</p><p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{loan.customer?.name ?? '-'}</p></AppCard>
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('installments.totalPayable')}</p><p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{money(loan.total_payable, locale)}</p></AppCard>
                        <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">{t('installments.frequency')}</p><p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{t(`loans.${loan.collection_frequency}`)}</p></AppCard>
                    </div>

                    <AppCard className="overflow-hidden p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                                <thead className="bg-slate-50 dark:bg-slate-950/50">
                                    <tr>
                                        {[t('installments.installmentNo'), t('installments.dueDate'), t('installments.principal'), t('installments.interest'), t('installments.amount'), t('installments.paid'), t('installments.status')].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {loan.installments.length ? loan.installments.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">{item.installment_no}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{item.due_date}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{money(item.principal_component, locale)}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{money(item.interest_component, locale)}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{money(item.installment_amount, locale)}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{money(item.paid_amount, locale)}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{t(`installments.${item.status}`)}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="7" className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">{t('installments.noInstallments')}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </AppCard>
                </PageContainer>
            </AppLayout>
        </>
    );
}
