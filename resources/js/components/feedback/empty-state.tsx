import { AppButton } from '@/components/ui/app-button';

type EmptyStateProps = {
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            {description ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
            {actionLabel ? (
                <div className="mt-5">
                    <AppButton variant="outline" onClick={onAction}>{actionLabel}</AppButton>
                </div>
            ) : null}
        </div>
    );
}
