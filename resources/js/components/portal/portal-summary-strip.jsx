import PortalStatCard from '@/components/portal/portal-stat-card';
import { formatDate, formatMoney, formatNumber } from '@/lib/formatters';
import { useLocale } from '@/hooks/use-locale';

export default function PortalSummaryStrip({ summary }) {
    const { locale, t } = useLocale();

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <PortalStatCard label={t('portal.activeLoans')} value={formatNumber(summary.activeLoans, locale)} />
            <PortalStatCard label={t('portal.totalInstallments')} value={formatNumber(summary.totalInstallments, locale)} />
            <PortalStatCard label={t('portal.totalPaid')} value={formatMoney(summary.totalPaid, locale)} />
            <PortalStatCard
                label={t('portal.nextDueAmount')}
                value={formatMoney(summary.nextDueAmount, locale)}
                hint={`${t('portal.nextDueDate')}: ${formatDate(summary.nextDueDate, locale)}`}
            />
            <PortalStatCard label={t('portal.remainingBalance')} value={formatMoney(summary.remainingBalance, locale)} />
        </div>
    );
}
