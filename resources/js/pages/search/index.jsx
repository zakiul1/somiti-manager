import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AppCard } from '@/components/ui/app-card';
import { AppBadge } from '@/components/ui/app-badge';
import { useLocale } from '@/hooks/use-locale';

function ResultSection({ title, items = [], emptyText }) {
    return (
        <AppCard>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
                <AppBadge variant="default">{items.length}</AppBadge>
            </div>

            {items.length ? (
                <div className="space-y-3">
                    {items.map((item) => (
                        <Link key={`${title}-${item.id}`} href={item.url} className="block rounded-xl border border-slate-200 px-4 py-3 transition hover:border-indigo-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-indigo-700 dark:hover:bg-slate-900">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-slate-100">{item.title}</p>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.subtitle}</p>
                                </div>
                                {item.status ? <AppBadge variant="default">{item.status}</AppBadge> : null}
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">{emptyText}</p>
            )}
        </AppCard>
    );
}

export default function SearchIndex({ query, results, totals }) {
    const { t } = useLocale();
    const hasQuery = Boolean(query);
    const totalCount = Object.values(totals ?? {}).reduce((sum, value) => sum + Number(value || 0), 0);

    return (
        <>
            <Head title={t('search.title')} />
            <AppLayout>
                <PageContainer>
                    <PageHeader title={t('search.title')} description={hasQuery ? `${t('search.resultsFor')} “${query}”` : t('search.prompt')} />

                    {!hasQuery ? (
                        <AppCard>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('search.prompt')}</p>
                        </AppCard>
                    ) : (
                        <>
                            <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                                {totalCount ? `${totalCount} ${t('search.resultsFound')}` : t('search.noResults')}
                            </div>

                            <div className="grid gap-6 xl:grid-cols-2">
                                <ResultSection title={t('nav.customers')} items={results.customers} emptyText={t('search.noCustomers')} />
                                <ResultSection title={t('nav.guarantors')} items={results.guarantors} emptyText={t('search.noGuarantors')} />
                                <ResultSection title={t('nav.loans')} items={results.loans} emptyText={t('search.noLoans')} />
                                <ResultSection title={t('nav.installments')} items={results.installments} emptyText={t('search.noInstallments')} />
                                <ResultSection title={t('nav.payments')} items={results.payments} emptyText={t('search.noPayments')} />
                                <ResultSection title={t('nav.documents')} items={results.documents} emptyText={t('search.noDocuments')} />
                            </div>
                        </>
                    )}
                </PageContainer>
            </AppLayout>
        </>
    );
}
