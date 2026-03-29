import * as React from 'react';
import { cn } from '@/lib/utils';

export type AppInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const AppInput = React.forwardRef<HTMLInputElement, AppInputProps>(
    ({ className, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={cn(
                    'flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
                    className,
                )}
                {...props}
            />
        );
    },
);

AppInput.displayName = 'AppInput';
