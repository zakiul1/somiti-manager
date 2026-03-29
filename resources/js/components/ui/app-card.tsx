import * as React from 'react';
import { cn } from '@/lib/utils';

type AppCardProps = React.HTMLAttributes<HTMLDivElement>;

export function AppCard({ className, ...props }: AppCardProps) {
    return (
        <div
            className={cn(
                'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900',
                className,
            )}
            {...props}
        />
    );
}
