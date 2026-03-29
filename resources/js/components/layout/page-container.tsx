import * as React from 'react';
import { cn } from '@/lib/utils';

type PageContainerProps = React.HTMLAttributes<HTMLDivElement>;

export function PageContainer({ className, ...props }: PageContainerProps) {
    return (
        <div
            className={cn('mx-auto w-full max-w-7xl p-4 sm:p-6', className)}
            {...props}
        />
    );
}