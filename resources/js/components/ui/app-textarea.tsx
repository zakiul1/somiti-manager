import * as React from 'react';
import { cn } from '@/lib/utils';

export type AppTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const AppTextarea = React.forwardRef<HTMLTextAreaElement, AppTextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                className={cn(
                    'flex min-h-28 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
                    className,
                )}
                {...props}
            />
        );
    },
);

AppTextarea.displayName = 'AppTextarea';
