import { Link } from '@inertiajs/react';
import { AppButton } from '@/components/ui/app-button';
import { useLocale } from '@/hooks/use-locale';

type PrintActionsProps = {
    backHref: string;
    downloadHref?: string;
    saveLabel?: string;
};

export function PrintActions({ backHref, downloadHref, saveLabel }: PrintActionsProps) {
    const { t, locale } = useLocale();

    const handlePrint = () => {
        window.print();
    };

    const resolvedDownloadHref = downloadHref
        ? (downloadHref.includes('locale=') ? downloadHref : `${downloadHref}${downloadHref.includes('?') ? '&' : '?'}locale=${locale}`)
        : null;

    return (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <Link href={backHref}>
                <AppButton variant="outline">{t('common.back')}</AppButton>
            </Link>
            <div className="flex flex-wrap gap-2">
                <AppButton variant="outline" onClick={handlePrint}>{t('print.print')}</AppButton>
                {resolvedDownloadHref ? (
                    <a
                        href={resolvedDownloadHref}
                        className="inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-medium text-white transition hover:bg-indigo-700"
                    >
                        {saveLabel ?? t('print.savePdf')}
                    </a>
                ) : (
                    <AppButton onClick={handlePrint}>{saveLabel ?? t('print.savePdf')}</AppButton>
                )}
            </div>
        </div>
    );
}
