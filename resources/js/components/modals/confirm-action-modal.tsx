import { AppModal } from '@/components/modals/app-modal';
import { AppButton } from '@/components/ui/app-button';
import { useLocale } from '@/hooks/use-locale';

export function ConfirmActionModal({
    show,
    title,
    description,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onClose,
}: {
    show: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onClose: () => void;
}) {
    const { t } = useLocale();

    return (
        <AppModal show={show} onClose={onClose} maxWidth="md">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            {description ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
            <div className="mt-6 flex justify-end gap-3">
                <AppButton type="button" variant="outline" onClick={onClose}>{cancelLabel ?? t('common.cancel')}</AppButton>
                <AppButton type="button" variant="danger" onClick={onConfirm}>{confirmLabel ?? t('common.confirm')}</AppButton>
            </div>
        </AppModal>
    );
}
