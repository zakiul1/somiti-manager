import { router } from '@inertiajs/react';
import { AppButton } from '@/components/ui/app-button';
import { useLocale } from '@/hooks/use-locale';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type TablePaginationProps = {
    links?: PaginationLink[];
    from?: number | null;
    to?: number | null;
    total?: number | null;
    previousPageUrl?: string | null;
    nextPageUrl?: string | null;
    itemLabel?: string;
};

export function TablePagination({
    links = [],
    from,
    to,
    total,
    previousPageUrl,
    nextPageUrl,
    itemLabel = 'items',
}: TablePaginationProps) {
    const { t } = useLocale();

    if (!links.length) {
        return null;
    }

    return (
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 px-4 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <p className="break-words text-sm text-slate-500 dark:text-slate-400">
                {typeof from === 'number' && typeof to === 'number' && typeof total === 'number'
                    ? t('common.showingRange', { from, to, total, itemLabel })
                    : t('common.pagination')}
            </p>

            <div className="flex flex-wrap items-center gap-2">
                <AppButton variant="outline" size="sm" disabled={!previousPageUrl} onClick={() => previousPageUrl && router.visit(previousPageUrl, { preserveScroll: true })}>
                    {t('common.previous')}
                </AppButton>

                {links.filter((link) => !['&laquo; Previous', 'Next &raquo;'].includes(link.label)).map((link, index) => (
                    <button
                        key={`${link.label}-${index}`}
                        type="button"
                        disabled={!link.url}
                        onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                        className={`min-w-10 rounded-lg px-3 py-2 text-sm ${link.active ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'} disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                    </button>
                ))}

                <AppButton variant="outline" size="sm" disabled={!nextPageUrl} onClick={() => nextPageUrl && router.visit(nextPageUrl, { preserveScroll: true })}>
                    {t('common.next')}
                </AppButton>
            </div>
        </div>
    );
}
