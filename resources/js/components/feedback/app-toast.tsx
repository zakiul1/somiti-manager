
import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { Toaster, toast } from 'react-hot-toast';

type FlashProps = {
    flash?: {
        success?: string | null;
        error?: string | null;
    };
};

export function AppToast() {
    const { props } = usePage<FlashProps>();
    const lastSuccess = useRef<string | null>(null);
    const lastError = useRef<string | null>(null);

    useEffect(() => {
        const success = props.flash?.success ?? null;
        if (success && success !== lastSuccess.current) {
            toast.success(success);
            lastSuccess.current = success;
        }
    }, [props.flash?.success]);

    useEffect(() => {
        const error = props.flash?.error ?? null;
        if (error && error !== lastError.current) {
            toast.error(error);
            lastError.current = error;
        }
    }, [props.flash?.error]);

    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 3200,
                className: 'text-sm',
            }}
        />
    );
}
