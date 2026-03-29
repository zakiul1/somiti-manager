
import { useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { AppButton } from '@/components/ui/app-button';
import { useLocale } from '@/hooks/use-locale';

type PageHeaderProps = {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    showBackButton?: boolean;
};

type PageProps = {
    ziggy?: {
        location?: string;
    };
};

export function PageHeader({ title, description, actions, showBackButton }: PageHeaderProps) {
    const { t } = useLocale();
    const { url } = usePage<PageProps>();
    const shouldShowBackButton = useMemo(() => {
        if (typeof showBackButton === 'boolean') {
            return showBackButton;
        }
        return /\/(create|edit)(\?.*)?$/.test(url) || /\/portal-account\/(create|edit)(\?.*)?$/.test(url);
    }, [showBackButton, url]);

    return (
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                {shouldShowBackButton ? (
                    <AppButton
                        variant="ghost"
                        size="sm"
                        className="mb-3 px-0 text-indigo-600 hover:bg-transparent dark:text-indigo-400"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft size={16} />
                        {t('common.back')}
                    </AppButton>
                ) : null}
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
                {description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
            </div>

            {actions ? <div>{actions}</div> : null}
        </div>
    );
}
