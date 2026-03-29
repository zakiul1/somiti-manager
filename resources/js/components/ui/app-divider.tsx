import { cn } from '@/lib/utils';

export function AppDivider({ className = '' }: { className?: string }) {
    return <div className={cn('h-px w-full bg-slate-200 dark:bg-slate-800', className)} />;
}
