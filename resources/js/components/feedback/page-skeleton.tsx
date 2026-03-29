export function PageSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 w-56 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="grid gap-4 md:grid-cols-3">
                {[...Array(3)].map((_, index) => (
                    <div key={index} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                ))}
            </div>
            <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
    );
}
