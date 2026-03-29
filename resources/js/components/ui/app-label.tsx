import * as React from 'react';
import { cn } from '@/lib/utils';

export type AppLabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function AppLabel({ className, ...props }: AppLabelProps) {
    return (
        <label
            className={cn('mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300', className)}
            {...props}
        />
    );
}
