import { ConfirmActionModal } from '@/components/modals/confirm-action-modal';

export function ConfirmDeleteModal(props: {
    show: boolean;
    title?: string;
    description?: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onClose: () => void;
}) {
    return (
        <ConfirmActionModal
            show={props.show}
            title={props.title ?? 'Delete item'}
            description={props.description ?? 'This action cannot be undone.'}
            confirmLabel={props.confirmLabel}
            onConfirm={props.onConfirm}
            onClose={props.onClose}
        />
    );
}
