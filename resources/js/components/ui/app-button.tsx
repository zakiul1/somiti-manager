import * as React from 'react';
import { cn } from '@/lib/utils';

type AppButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
};

const variantClasses = {
    primary:
        'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500',
    secondary:
        'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500',
    outline:
        'border border-slate-300 bg-white text-slate-900 hover:bg-slate-100',
    danger:
        'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500',
    ghost:
        'text-slate-700 hover:bg-slate-100',
};

const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
};

export function AppButton({
    className,
    variant = 'primary',
    size = 'md',
    type = 'button',
    ...props
}: AppButtonProps) {
    return (
        <button
            type={type}
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                variantClasses[variant],
                sizeClasses[size],
                className,
            )}
            {...props}
        />
    );
}