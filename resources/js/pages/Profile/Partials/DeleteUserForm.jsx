import DangerButton from '@/components/DangerButton';
import InputError from '@/components/InputError';
import InputLabel from '@/components/InputLabel';
import Modal from '@/components/Modal';
import SecondaryButton from '@/components/SecondaryButton';
import TextInput from '@/components/TextInput';
import { useLocale } from '@/hooks/use-locale';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const { t } = useLocale();
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-rose-700 dark:text-rose-400">{t('profile.deleteTitle')}</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t('profile.deleteSubtitle')}</p>
            </header>

            <DangerButton onClick={confirmUserDeletion}>{t('profile.deleteTitle')}</DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6 dark:bg-slate-900">
                    <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">{t('profile.deleteConfirmTitle')}</h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t('profile.deleteConfirmSubtitle')}</p>

                    <div className="mt-6">
                        <InputLabel htmlFor="password" value={t('auth.password')} className="sr-only" />
                        <TextInput id="password" type="password" name="password" ref={passwordInput} value={data.password} onChange={(e) => setData('password', e.target.value)} className="mt-1 block w-3/4" isFocused placeholder={t('auth.password')} />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>{t('common.cancel')}</SecondaryButton>
                        <DangerButton className="ms-3" disabled={processing}>{t('profile.deleteTitle')}</DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
