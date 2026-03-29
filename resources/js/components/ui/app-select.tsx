import * as React from 'react';
import { cn } from '@/lib/utils';

export type AppSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const AppSelect = React.forwardRef<HTMLSelectElement, AppSelectProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <select
                ref={ref}
                className={cn(
                    'flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
                    className,
                )}
                {...props}
            >
                {children}
            </select>
        );
    },
);

AppSelect.displayName = 'AppSelect';
