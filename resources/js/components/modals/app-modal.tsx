import Modal from '@/components/Modal';

export function AppModal({ show, onClose, children, maxWidth = '2xl' }: {
    show: boolean;
    onClose: () => void;
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}) {
    return (
        <Modal show={show} onClose={onClose} maxWidth={maxWidth}>
            <div className="bg-white p-6 dark:bg-slate-900">{children}</div>
        </Modal>
    );
}
