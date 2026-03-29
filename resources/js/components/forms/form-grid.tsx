import { cn } from '@/lib/utils';

export function FormGrid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={cn('grid gap-4 md:grid-cols-2', className)}>{children}</div>;
}
