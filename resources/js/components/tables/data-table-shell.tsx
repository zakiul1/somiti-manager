import { cn } from '@/lib/utils';

export function DataTableShell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900', className)}>
            <div className="w-full overflow-x-auto">
                <div className="min-w-full align-middle">{children}</div>
            </div>
        </div>
    );
}
