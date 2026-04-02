import PortalStatCard from '@/components/portal/portal-stat-card';
import { formatDate, formatMoney, formatNumber } from '@/lib/formatters';
import { useLocale } from '@/hooks/use-locale';

export default function PortalSummaryStrip({ summary }) {
    const { locale, t } = useLocale();

    const cards = [
        {
            label: t('portal.activeLoans'),
            value: formatNumber(summary.activeLoans ?? 0, locale),
            hint: t('portal.activeLoansHint'),
        },
        {
            label: t('portal.totalInstallments'),
            value: formatNumber(summary.totalInstallments ?? 0, locale),
            hint: `${t('portal.openInstallments')}: ${formatNumber(summary.openInstallments ?? 0, locale)}`,
        },
        {
            label: t('portal.totalPaid'),
            value: formatMoney(summary.totalPaid ?? 0, locale),
            hint: `${t('portal.closedLoans')}: ${formatNumber(summary.closedLoans ?? 0, locale)}`,
        },
        {
            label: t('portal.nextDueAmount'),
            value: formatMoney(summary.nextDueAmount ?? 0, locale),
            hint: `${t('portal.nextDueDate')}: ${formatDate(summary.nextDueDate, locale)}`,
        },
        {
            label: t('portal.remainingBalance'),
            value: formatMoney(summary.remainingBalance ?? 0, locale),
            hint: summary.nextDueLoanCode ? `${t('portal.nextDueLoan')}: ${summary.nextDueLoanCode}` : t('portal.noUpcomingDue'),
        },
        {
            label: t('portal.overdueAmount'),
            value: formatMoney(summary.overdueAmount ?? 0, locale),
            hint: `${t('portal.dueTodayAmount')}: ${formatMoney(summary.dueTodayAmount ?? 0, locale)}`,
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
                <PortalStatCard key={card.label} label={card.label} value={card.value} hint={card.hint} />
            ))}
        </div>
    );
}
