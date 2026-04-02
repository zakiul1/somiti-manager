import { Link } from '@inertiajs/react';
import { AppCard } from '@/components/ui/app-card';
import { AppButton } from '@/components/ui/app-button';
import { InstallmentStatusBadge } from '@/components/installments/installment-status-badge';
import { useLocale } from '@/hooks/use-locale';

const money = (value, locale = 'en') => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 2 }).format(Number(value || 0));

export default function DueOverduePanel({ items = [] }) {
    const { t, locale } = useLocale();

    return (
        <AppCard className="overflow-hidden p-0">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-950/50">
                        <tr>
                            {[t('installments.customer'), t('installments.loan'), t('installments.installmentNo'), t('installments.dueDate'), t('installments.outstanding'), t('installments.daysLate'), t('installments.status'), t('installments.actions')].map((h) => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {items.length ? items.map((item) => (
                            <tr key={item.id}>
                                <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">{item.customer?.name || '-'}</td>
                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{item.loan?.loan_code || '-'}</td>
                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">#{item.installment_no}</td>
                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{item.due_date || '-'}</td>
                                <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">{money(item.outstanding_amount, locale)}</td>
                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{item.days_late || 0}</td>
                                <td className="px-4 py-3 text-sm"><InstallmentStatusBadge status={item.status} /></td>
                                <td className="px-4 py-3 text-sm">
                                    <div className="flex flex-wrap gap-2">
                                        <Link href={route('payments.create', { installment_id: item.id })}><AppButton size="sm">{t('installments.collectPayment')}</AppButton></Link>
                                        <Link href={route('installments.customers.show', item.customer?.id)}><AppButton variant="outline" size="sm">{t('installments.viewCustomer')}</AppButton></Link>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="8" className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">{t('installments.noDueOverdueInstallments')}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AppCard>
    );
}
