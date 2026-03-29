import { cn } from '@/lib/utils';

export function DataTableShell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900', className)}>
            <div className="overflow-x-auto">{children}</div>
        </div>
    );
}
