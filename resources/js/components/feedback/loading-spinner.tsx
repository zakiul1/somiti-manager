export function LoadingSpinner({ label = 'Loading...' }: { label?: string }) {
    return (
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" />
            <span>{label}</span>
        </div>
    );
}
