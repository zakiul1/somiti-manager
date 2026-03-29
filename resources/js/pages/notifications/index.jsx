
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { useLocale } from '@/hooks/use-locale';

export default function NotificationsPage() {
    const { t } = useLocale();

    return (
        <>
            <Head title={t('notifications.title')} />

            <AppLayout>
                <PageContainer>
                    <PageHeader
                        title={t('notifications.title')}
                        description={t('notifications.subtitle')}
                    />

                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            {t('notifications.emptyTitle')}
                        </h2>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            {t('notifications.emptySubtitle')}
                        </p>
                    </div>
                </PageContainer>
            </AppLayout>
        </>
    );
}
